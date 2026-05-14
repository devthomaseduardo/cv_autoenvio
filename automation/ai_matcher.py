import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class AIMatcher:
    def __init__(self):
        # Preferimos OpenAI ou Groq agora, já que o usuário pediu para não usar Gemini
        self.api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY")
        self.base_url = os.getenv("AI_BASE_URL") # Opcional: para Groq ou DeepSeek
        
        if not self.api_key:
            self.client = None
            print("⚠️ Aviso: OPENAI_API_KEY ou GROQ_API_KEY não encontrada no .env")
        else:
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url if self.base_url else None
            )
        
        self.model = os.getenv("AI_MODEL", "gpt-4o-mini")

    def analyze_match(self, resume_text, job_description):
        """
        Realiza uma análise profunda da vaga vs currículo usando OpenAI/Groq.
        """
        if not self.client:
            return {
                "score": 0,
                "match_summary": "IA não configurada. Por favor, adicione sua OPENAI_API_KEY no .env.",
                "error": "Missing API Key"
            }

        prompt = f"""
        Você é um Recrutador Tech especialista em Engenharia de Software e Career Coach.
        Sua tarefa é realizar uma análise estratégica entre um CURRÍCULO e uma DESCRIÇÃO DE VAGA.
        
        --- CURRÍCULO ---
        {resume_text}

        --- DESCRIÇÃO DA VAGA ---
        {job_description}

        Responda APENAS em JSON no seguinte formato:
        {{
            "score": 85,
            "seniority": "Pleno",
            "match_summary": "Resumo executivo da compatibilidade.",
            "strengths": ["Lista de pontos fortes"],
            "skill_gaps": ["Lista de gaps"],
            "technical_brief": {{
                "focus": "Orientação de postura técnica.",
                "potential_questions": ["Pergunta 1", "Pergunta 2", "Pergunta 3"]
            }},
            "cover_letter": "Texto da carta curta e humana...",
            "personal_summary": "Texto do resumo profissional otimizado para esta vaga..."
        }}
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Você é um recrutador tech especialista."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            
            content = response.choices[0].message.content.strip()
            data = json.loads(content)
            
            defaults = {
                "score": 0,
                "seniority": "N/A",
                "match_summary": "Não foi possível analisar.",
                "strengths": [],
                "skill_gaps": [],
                "technical_brief": {"focus": "", "potential_questions": []},
                "cover_letter": "",
                "personal_summary": ""
            }
            for k, v in defaults.items():
                if k not in data:
                    data[k] = v
            return data
        except Exception as e:
            print(f"⚠️ Erro na análise da IA: {e}")
            return {
                "score": 0,
                "error": str(e),
                "match_summary": "Falha na análise automática."
            }

    def generate_interview_prep(self, job_title, company, description):
        """Gera um guia de preparação mais detalhado para uma entrevista confirmada."""
        if not self.client: return None
        # Implementação futura...
        pass
