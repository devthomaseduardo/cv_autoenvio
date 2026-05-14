import os
import time
import random
import json
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv

# Carrega variáveis do .env (procura no atual e no pai)
if not load_dotenv():
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

class PlatformApplier:
    def __init__(self, resume_path):
        self.resume_path = os.path.abspath(resume_path)
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"

    def _human_delay(self, min_s=1.5, max_s=4.0):
        """Simula uma pausa humana aleatória."""
        time.sleep(random.uniform(min_s, max_s))

    def _human_scroll(self, page):
        """Simula o usuário rolando a página para ler."""
        try:
            scroll_amount = random.randint(300, 700)
            page.mouse.wheel(0, scroll_amount)
            self._human_delay(1, 2)
            page.mouse.wheel(0, -scroll_amount + random.randint(-100, 100))
        except:
            pass

    def _human_click(self, page, element):
        """Move o mouse até o elemento e clica, simulando comportamento humano."""
        try:
            box = element.bounding_box()
            if box:
                # Move para uma posição aleatória dentro do botão
                target_x = box['x'] + box['width'] * random.uniform(0.2, 0.8)
                target_y = box['y'] + box['height'] * random.uniform(0.2, 0.8)
                page.mouse.move(target_x, target_y, steps=random.randint(10, 25))
                self._human_delay(0.2, 0.5)
                page.mouse.click(target_x, target_y)
            else:
                element.click()
        except:
            element.click()

    def _human_typing(self, element, text):
        """Digita texto como um humano, caractere por caractere."""
        try:
            # Garante foco
            element.click()
            element.fill("")
            for char in text:
                element.type(char)
                time.sleep(random.uniform(0.06, 0.18))
        except:
            element.fill(text) 

    def apply_to_job(self, job_url):
        if "linkedin.com" in job_url:
            return self.apply_to_linkedin(job_url)
        elif "indeed.com" in job_url:
            return self.apply_to_indeed(job_url)
        else:
            return self.apply_to_generic(job_url)

    def apply_to_linkedin(self, job_url):
        print(f"🕵️  Iniciando tentativa LinkedIn (Modo Humano): {job_url}")
        user_data_dir = os.path.join(os.getcwd(), "linkedin_session")
        
        with sync_playwright() as p:
            browser = p.chromium.launch_persistent_context(
                user_data_dir,
                headless=False,
                user_agent=self.user_agent,
                slow_mo=random.randint(400, 800),
                args=["--disable-blink-features=AutomationControlled"]
            )
            page = browser.new_page()
            
            try:
                self._check_login_linkedin(page)
                page.goto(job_url, wait_until="load")
                self._human_delay(3, 5)
                self._human_scroll(page)
                
                # Procura botão de Candidatura Simplificada
                easy_apply_btn = page.query_selector("button.jobs-apply-button")
                if easy_apply_btn:
                    print("🖱️  Clicando em Candidatura Simplificada (Easy Apply)...")
                    self._human_click(page, easy_apply_btn)
                    self._human_delay(2, 4)
                    return self._process_linkedin_easy_apply(page)
                else:
                    # Se não for Easy Apply, tenta o botão de candidatura externa
                    apply_btn = page.query_selector("button:has-text('Candidatar-se')") or \
                                page.query_selector("button:has-text('Apply')")
                    if apply_btn:
                        print("🔗 Abrindo site externo da vaga...")
                        with page.expect_popup() as popup_info:
                            self._human_click(page, apply_btn)
                        return self._handle_external_platform(popup_info.value)
                
                return False
            except Exception as e:
                print(f"❌ Erro no LinkedIn: {e}")
                return False
            finally:
                browser.close()

    def _process_linkedin_easy_apply(self, page):
        # Itera pelos passos do modal
        for _ in range(8):
            try:
                self._answer_common_questions(page)
                self._handle_resume_upload(page)
                
                next_btn = page.query_selector("button:has-text('Avançar')") or \
                           page.query_selector("button:has-text('Next')") or \
                           page.query_selector("button:has-text('Review')") or \
                           page.query_selector("button:has-text('Revisar')")
                
                submit_btn = page.query_selector("button:has-text('Enviar candidatura')") or \
                             page.query_selector("button:has-text('Submit application')")
                
                if submit_btn:
                    print("🚀 Enviando candidatura finalizada!")
                    self._human_click(page, submit_btn)
                    self._human_delay(3, 5)
                    return True
                elif next_btn:
                    self._human_click(page, next_btn)
                    self._human_delay(1.5, 3)
                else:
                    break
            except: break
        return False

    def apply_to_indeed(self, job_url):
        print(f"🕵️  Iniciando tentativa Indeed (Modo Humano): {job_url}")
        user_data_dir = os.path.join(os.getcwd(), "indeed_session")
        
        with sync_playwright() as p:
            browser = p.chromium.launch_persistent_context(
                user_data_dir,
                headless=False,
                user_agent=self.user_agent,
                slow_mo=random.randint(400, 800),
                args=["--disable-blink-features=AutomationControlled"]
            )
            page = browser.new_page()
            
            try:
                self._check_login_indeed(page)
                page.goto(job_url, wait_until="load")
                self._human_delay(3, 6)
                
                apply_button = page.query_selector("#indeedApplyButton") or \
                               page.query_selector("button:has-text('Candidatar-se agora')")
                
                if apply_button:
                    self._human_click(page, apply_button)
                    self._human_delay(4, 7)
                    return self._process_indeed_easy_apply(page)
                else:
                    external_link = page.query_selector("a:has-text('Apply on company site')") or \
                                   page.query_selector("a:has-text('Candidatar-se no site da empresa')")
                    if external_link:
                        with page.expect_popup() as popup_info:
                            self._human_click(page, external_link)
                        return self._handle_external_platform(popup_info.value)
                return False
            except Exception as e:
                print(f"❌ Erro Indeed: {e}")
                return False
            finally: browser.close()

    def apply_to_generic(self, job_url):
        print(f"🕵️  Plataforma Genérica: {job_url}")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False, slow_mo=600)
            page = browser.new_page()
            try:
                page.goto(job_url, wait_until="load")
                self._human_delay(3, 6)
                return self._handle_external_platform(page)
            except: return False
            finally: browser.close()

    def _handle_external_platform(self, page):
        """Tenta identificar botões de ação em sites externos (Gupy, Greenhouse, etc)."""
        print(f"🔍 Analisando site externo: {page.url}")
        try:
            self._human_delay(2, 4)
            self._human_scroll(page)
            
            # Procura botões comuns de candidatura
            btn = page.query_selector("button:has-text('Candidatar-se')") or \
                  page.query_selector("button:has-text('Apply')") or \
                  page.query_selector("a:has-text('Apply Now')") or \
                  page.query_selector("button:has-text('Join us')")
            
            if btn:
                print(f"🖱️  Botão detectado: {btn.inner_text().strip()}")
                self._human_click(page, btn)
                self._human_delay(3, 5)
                # Tenta preencher campos básicos se houver formulário visível
                self._answer_common_questions(page)
                self._handle_resume_upload(page)
                return "Ação manual pode ser necessária no site externo"
            return "Site externo aberto - verifique manualmente"
        except:
            return "Erro ao processar site externo"

    def _check_login_linkedin(self, page):
        user = os.getenv("LINKEDIN_USER")
        pw = os.getenv("LINKEDIN_PASS")
        try:
            page.goto("https://www.linkedin.com/feed/", timeout=10000)
            if "login" in page.url or page.query_selector("#username"):
                print("🔐 Logando no LinkedIn...")
                page.goto("https://www.linkedin.com/login")
                self._human_typing(page.wait_for_selector("#username"), user)
                self._human_typing(page.wait_for_selector("#password"), pw)
                submit = page.query_selector("button[type='submit']")
                self._human_click(page, submit)
                self._human_delay(4, 6)
        except: pass

    def _check_login_indeed(self, page):
        user = os.getenv("INDEED_USER")
        pw = os.getenv("INDEED_PASS")
        try:
            page.goto("https://br.indeed.com/")
            if "login" in page.url or page.query_selector("a[href*='login']"):
                print("🔐 Logando no Indeed...")
                page.goto("https://secure.indeed.com/account/login")
                email_input = page.wait_for_selector("input[name='__email']")
                self._human_typing(email_input, user)
                page.keyboard.press("Enter")
                self._human_delay(2, 3)
                pass_input = page.wait_for_selector("input[name='__password']")
                self._human_typing(pass_input, pw)
                page.keyboard.press("Enter")
                self._human_delay(4, 6)
        except: pass

    def _answer_common_questions(self, page):
        """Responde perguntas comuns de recrutamento."""
        try:
            # Inputs de texto
            inputs = page.query_selector_all("input[type='text'], textarea")
            for el in inputs:
                if not el.is_visible() or el.input_value(): continue
                label = page.query_selector(f"label[for='{el.get_attribute('id')}']")
                txt = label.inner_text().lower() if label else ""
                
                # Pedido do usuário: "responda escreva etec"
                if any(w in txt for w in ["school", "university", "escola", "faculdade", "formação"]):
                    self._human_typing(el, "ETEC - Escola Técnica")
                elif any(w in txt for w in ["experience", "experiência", "anos"]):
                    self._human_typing(el, "3")
                elif any(w in txt for w in ["salary", "pretensão", "remuneração"]):
                    self._human_typing(el, "4500")
            
            # Radios e Checkboxes (Sim/Não)
            radios = page.query_selector_all("input[type='radio'], input[type='checkbox']")
            for r in radios:
                if not r.is_visible() or r.is_checked(): continue
                val = r.get_attribute("value", "").lower()
                # Geralmente queremos marcar "Sim" para perguntas de elegibilidade
                if any(w in val for w in ["yes", "sim", "true"]):
                    r.check()
        except: pass

    def _handle_resume_upload(self, page):
        try:
            file_input = page.query_selector("input[type='file']")
            if file_input:
                file_input.set_input_files(self.resume_path)
                self._human_delay(2, 3)
        except: pass

    def _process_indeed_easy_apply(self, page):
        for _ in range(10):
            try:
                self._answer_common_questions(page)
                self._handle_resume_upload(page)
                btn = page.query_selector("button:has-text('Continuar')") or \
                      page.query_selector("button:has-text('Enviar')")
                if btn:
                    is_final = "enviar" in btn.inner_text().lower()
                    self._human_click(page, btn)
                    self._human_delay(2, 4)
                    if is_final: return True
                else: break
            except: break
        return False
