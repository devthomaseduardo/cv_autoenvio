import google.generativeai as genai
import os
from dotenv import load_dotenv

# Carrega .env do diretório pai se não estiver no atual
load_dotenv("../.env")
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERRO: GEMINI_API_KEY não encontrada.")
else:
    genai.configure(api_key=api_key)
    try:
        models = genai.list_models()
        print("Modelos disponíveis:")
        for m in models:
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Erro ao listar modelos: {e}")
