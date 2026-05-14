import re

class KeywordMatcher:
    def __init__(self, keywords=None):
        # Palavras-chave padrão baseadas na sua busca
        self.default_keywords = [
            "node", "nodejs", "javascript", "typescript", "react", 
            "nest", "nestjs", "express", "postgres", "sql", "docker",
            "aws", "api", "backend", "frontend", "git"
        ]
        self.keywords = keywords or self.default_keywords

    def analyze_match(self, resume_text, job_description, search_keywords=""):
        resume_text = resume_text.lower()
        job_description = job_description.lower()
        
        # Combina palavras-chave padrão com as da busca atual
        current_keywords = self.keywords.copy()
        if search_keywords:
            search_list = [k.strip().lower() for k in search_keywords.split() if len(k) > 2]
            current_keywords.extend(search_list)
            current_keywords = list(set(current_keywords)) # Remove duplicatas

        found_in_resume = [k for k in current_keywords if k in resume_text]
        found_in_job = [k for k in current_keywords if k in job_description]
        
        # Interseção: O que o currículo tem que a vaga pede
        matches = [k for k in found_in_job if k in found_in_resume]
        missing = [k for k in found_in_job if k not in found_in_resume]
        
        # Cálculo de score simples
        if not found_in_job:
            score = 50 # Vaga genérica
        else:
            score = int((len(matches) / len(found_in_job)) * 100)
            if score > 95: score = 95 # IA costuma ser mais conservadora
            
        # Simula o formato JSON que o main.py espera
        result = {
            "match_score": score,
            "is_good_match": score >= 60,
            "summary": f"Encontradas {len(matches)} tecnologias compatíveis: {', '.join(matches)}.",
            "custom_email_body": f"Olá,\n\nVi a vaga para esta posição e notei que meu perfil tem forte aderência em {', '.join(matches)}. Tenho experiência sólida com Node.js e gostaria de conversar mais sobre como posso somar ao time.\n\nAtenciosamente,\nThomas",
            "skills_found": matches,
            "skills_missing": missing
        }
        
        import json
        return json.dumps(result)

if __name__ == "__main__":
    matcher = KeywordMatcher()
    print("Keyword Matcher ready.")
