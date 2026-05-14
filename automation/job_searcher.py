import re
import time
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

class JobSearcher:
    def __init__(self):
        self.emails_found = []

    def search_all_platforms(self, keywords, location="Brasil"):
        all_jobs = []
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            print(f"🔎 Buscando no LinkedIn Jobs...")
            all_jobs.extend(self._search_linkedin_jobs(page, keywords, location))
            
            print(f"🔎 Buscando no Indeed...")
            all_jobs.extend(self._search_indeed_jobs(page, keywords, location))
            
            print(f"🔎 Buscando na Web (Gupy, Greenhouse, Lever)...")
            all_jobs.extend(self._search_generic_google_jobs(page, keywords))
            
            print(f"🔎 Buscando LinkedIn POSTS (Recrutadores)...")
            all_jobs.extend(self._search_linkedin_posts(page, keywords))
            
            browser.close()
            
        return all_jobs

    def _search_generic_google_jobs(self, page, keywords):
        """Busca vagas em plataformas populares via Google Search."""
        jobs = []
        platforms = ["gupy.io", "greenhouse.io", "lever.co", "workable.com"]
        search_query = f'"{keywords}" (site:{ " OR site:".join(platforms) })'
        url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}"
        
        try:
            page.goto(url, wait_until="networkidle")
            self._human_delay(2, 4)
            
            results = page.query_selector_all("div.g")
            for res in results:
                try:
                    title_el = res.query_selector("h3")
                    link_el = res.query_selector("a")
                    if title_el and link_el:
                        title = title_el.inner_text()
                        link = link_el.get_attribute("href")
                        # Identifica a plataforma pelo domínio
                        source = "Generic Web"
                        for p in platforms:
                            if p in link:
                                source = p.capitalize().split('.')[0]
                                break
                        
                        jobs.append({
                            "title": title,
                            "company": "Identificando...",
                            "url": link,
                            "source": source
                        })
                except: continue
        except Exception as e:
            print(f"⚠️ Erro na busca genérica: {e}")
        return jobs

    def _search_linkedin_jobs(self, page, keywords, location):
        jobs = []
        url = f"https://www.linkedin.com/jobs/search?keywords={keywords}&location={location}"
        page.goto(url)
        page.wait_for_selector(".base-card", timeout=10000)
        
        # Rola um pouco para carregar mais
        for _ in range(3):
            page.keyboard.press("PageDown")
            time.sleep(1)

        content = page.content()
        soup = BeautifulSoup(content, "html.parser")
        cards = soup.find_all("div", class_="base-card")
        
        for card in cards:
            try:
                title = card.find("h3", class_="base-search-card__title").text.strip()
                company = card.find("h4", class_="base-search-card__subtitle").text.strip()
                link = card.find("a", class_="base-card__full-link")["href"]
                jobs.append({"title": title, "company": company, "url": link, "source": "LinkedIn Jobs"})
            except: continue
        return jobs

    def _search_indeed_jobs(self, page, keywords, location):
        jobs = []
        # URL do Indeed formatada para o Brasil
        url = f"https://br.indeed.com/jobs?q={keywords.replace(' ', '+')}&l={location.replace(' ', '+')}"
        try:
            page.goto(url, wait_until="networkidle")
            self._human_delay(2, 4)
            
            # Tenta fechar popup de login se aparecer
            try:
                page.click("button[aria-label='Fechar']", timeout=2000)
            except: pass

            content = page.content()
            soup = BeautifulSoup(content, "html.parser")
            
            # Seletores do Indeed costumam mudar, mas o 'jcs-JobTitle' é persistente
            cards = soup.select(".job_seen_beacon")
            for card in cards:
                try:
                    title_el = card.select_one(".jobTitle a")
                    title = title_el.text.strip()
                    jk = title_el.get("data-jk")
                    link = f"https://br.indeed.com/viewjob?jk={jk}"
                    
                    company_el = card.select_one("[data-testid='company-name']")
                    company = company_el.text.strip() if company_el else "Empresa não informada"
                    
                    jobs.append({
                        "title": title, 
                        "company": company, 
                        "url": link, 
                        "source": "Indeed"
                    })
                except Exception as e:
                    print(f"⚠️ Erro ao processar card Indeed: {e}")
                    continue
        except Exception as e: 
            print(f"❌ Erro na busca Indeed: {e}")
        return jobs

    def _human_delay(self, min_s, max_s):
        import random
        time.sleep(random.uniform(min_s, max_s))

    def _search_linkedin_posts(self, page, keywords):
        # Busca por publicações que mencionam "contratando" ou "vaga" + keywords
        jobs = []
        search_query = f"{keywords} contratando email"
        url = f"https://www.google.com/search?q=site:linkedin.com/posts+{search_query}"
        page.goto(url)
        time.sleep(2)
        
        content = page.content()
        soup = BeautifulSoup(content, "html.parser")
        results = soup.find_all("div", class_="g") # Resultados do Google
        
        for res in results:
            try:
                title = res.find("h3").text.strip()
                link = res.find("a")["href"]
                snippet = res.find("div", class_="VwiC3b").text # Snippet do Google
                
                # Tenta achar e-mail direto no snippet
                email = self.extract_email_from_description(snippet)
                if email:
                    jobs.append({
                        "title": "Vaga em Post LinkedIn",
                        "company": "Recrutador Direto",
                        "url": link,
                        "description": snippet,
                        "source": "LinkedIn Post",
                        "direct_email": email
                    })
            except: continue
        return jobs

    def extract_email_from_description(self, description):
        if not description: return None
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', description)
        return emails[0] if emails else None
