import json
import os
import sys
import time
import random

# Adiciona o diretório atual ao path para importar o módulo local
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from platform_applier import PlatformApplier

def main():
    REPORT_PATH = "relatorio_vagas.json"
    RESUME_PATH = "my_resume.pdf"

    if not os.path.exists(REPORT_PATH):
        print(f"❌ Relatório não encontrado. Execute o main.py primeiro.")
        return

    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        jobs = json.load(f)

    # Verifica se foi passado um índice específico
    specific_index = int(sys.argv[1]) if len(sys.argv) > 1 else None

    if specific_index is not None and 0 <= specific_index < len(jobs):
        pending_jobs = [jobs[specific_index]]
        print(f"🎯 Aplicando especificamente para a vaga: {pending_jobs[0]['title']}")
    else:
        # Filtra vagas com alto match que ainda não foram aplicadas
        pending_jobs = [j for j in jobs if j.get('should_apply') and not j.get('applied')]
        print(f"🚀 Iniciando candidaturas estratégicas para {len(pending_jobs)} vagas...")

    if not pending_jobs:
        print("✅ Nenhuma vaga pendente encontrada.")
        return

    applier = PlatformApplier(RESUME_PATH)

    for job in pending_jobs:
        url = job.get('url', '')
        if not url: continue
            
        print(f"\n--- Aplicando: {job['title']} em {job['company']} ---")
        
        try:
            # Tenta a aplicação automática
            result = applier.apply_to_job(url)
            
            if result is True:
                job['applied'] = f"Sucesso via Bot ({time.strftime('%H:%M')})"
            elif isinstance(result, str):
                job['applied'] = result # Mensagem de status customizada
            else:
                job['applied'] = "Falha/Ação Manual Necessária"
        except Exception as e:
            print(f"⚠️ Erro crítico na aplicação: {e}")
            job['applied'] = f"Erro: {str(e)[:50]}"
        
        # Salva o progresso imediatamente após cada aplicação
        with open(REPORT_PATH, "w", encoding="utf-8") as f:
            json.dump(jobs, f, indent=4, ensure_ascii=False)
            
        # Delay humano entre candidaturas para evitar flags
        if len(pending_jobs) > 1:
            time.sleep(random.uniform(5, 10))

    print("\n✨ Processo finalizado!")

if __name__ == "__main__":
    main()
