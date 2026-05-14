import os
import json
import time
import sys
from resume_parser import ResumeParser
from ai_matcher import AIMatcher
from job_searcher import JobSearcher
from keyword_matcher import KeywordMatcher
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURAÇÃO ESTRATÉGICA PADRÃO ---
RESUME_PATH = "my_resume.pdf"
DEFAULT_KEYWORDS = "Software Engineer Node.js"
DEFAULT_LOCATION = "Brasil"
MATCH_THRESHOLD = 70 
MAX_JOBS_PER_RUN = 15
# --------------------------

def main():
    # Suporte a argumentos via CLI (usado pelo Backend)
    keywords = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_KEYWORDS
    location = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_LOCATION

    print("\n" + "═"*60)
    print("🚀 ICO - INTELLIGENT CAREER OPTIMIZER")
    print(f"   Buscando: {keywords} em {location}")
    print("═"*60 + "\n")

    # 1. Carregar e Processar Currículo
    if not os.path.exists(RESUME_PATH):
        print(f"❌ Erro: Arquivo '{RESUME_PATH}' não encontrado.")
        return

    print(f"📄 Analisando perfil profissional...")
    try:
        parser = ResumeParser(RESUME_PATH)
        resume_text = parser.extract_text()
        print(f"✅ Currículo processado ({len(resume_text)} caracteres)")
    except Exception as e:
        print(f"❌ Erro ao ler currículo: {e}")
        return
    
    # 2. Inicializar Motores de Inteligência
    searcher = JobSearcher()
    matcher = AIMatcher()
    fallback_matcher = KeywordMatcher()

    print(f"🔍 Iniciando busca multi-plataforma...")
    try:
        jobs = searcher.search_all_platforms(keywords, location)
        print(f"✅ {len(jobs)} oportunidades encontradas.")
    except Exception as e:
        print(f"❌ Erro durante a busca: {e}")
        jobs = []
    
    results_log = []

    # 3. Ciclo de Inteligência Profunda
    for i, job in enumerate(jobs[:MAX_JOBS_PER_RUN]):
        print(f"\n[{i+1}/{min(len(jobs), MAX_JOBS_PER_RUN)}] 🏢 {job['company']} | {job['title']}")
        
        try:
            # Descrição (Muitas vezes a busca inicial não traz a descrição completa)
            description = job.get('description', f"Vaga para {job['title']} em {job['company']}. Requer conhecimentos em {keywords}.")
            
            print("🤖 IA processando análise estratégica...")
            analysis = matcher.analyze_match(resume_text, description)
            
            # FALLBACK: Se a IA falhar ou retornar score 0, use KeywordMatcher
            if analysis.get('score', 0) == 0:
                print("⚠️ IA indisponível ou falhou. Ativando Fallback de Palavras-Chave...")
                kw_analysis_raw = fallback_matcher.analyze_match(resume_text, description, search_keywords=keywords)
                kw_data = json.loads(kw_analysis_raw)
                
                analysis = {
                    "score": kw_data['match_score'],
                    "seniority": "Análise Manual",
                    "match_summary": f"Análise via Palavras-Chave: {kw_data['summary']}",
                    "strengths": kw_data['skills_found'],
                    "skill_gaps": kw_data['skills_missing'],
                    "technical_brief": {
                        "focus": "Focar nas tecnologias encontradas.",
                        "potential_questions": ["Quais projetos você já fez com " + (kw_data['skills_found'][0] if kw_data['skills_found'] else "Node.js") + "?"]
                    },
                    "cover_letter": kw_data['custom_email_body'],
                    "personal_summary": "Perfil técnico compatível com " + ", ".join(kw_data['skills_found'])
                }

            # Enriquecimento do objeto job
            job.update(analysis)
            job['id'] = i
            job['last_updated'] = time.strftime("%Y-%m-%d %H:%M:%S")
            
            # Decisão Estratégica
            if job['score'] >= MATCH_THRESHOLD:
                print(f"⭐ ALTO IMPACTO: Match de {job['score']}%")
                job['should_apply'] = True
            else:
                print(f"📉 Baixa compatibilidade ({job['score']}%). Sugerido para ignorar.")
                job['should_apply'] = False

        except Exception as e:
            print(f"⚠️ Falha Crítica na análise: {e}")
            job['error'] = str(e)
            job['score'] = 0

        results_log.append(job)
        time.sleep(1) # Respeitar rate limits

    # 4. Persistência do Relatório de Inteligência
    report_file = "relatorio_vagas.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(results_log, f, indent=4, ensure_ascii=False)

    print("\n" + "═"*60)
    print(f"✨ INTELIGÊNCIA CONCLUÍDA")
    print(f"📊 {len(results_log)} vagas analisadas com sucesso.")
    print(f"👉 Acesse o Dashboard para ver Technical Briefs e Skill Gaps.")
    print("═"*60 + "\n")

if __name__ == "__main__":
    main()
