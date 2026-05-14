import os
import json
import subprocess
import threading
import queue
from flask import Flask, jsonify, request, send_from_directory, Response
from flask_cors import CORS

app = Flask(__name__, static_folder='dashboard')
CORS(app)

REPORT_PATH = os.path.join(os.path.dirname(__file__), 'relatorio_vagas.json')
DASHBOARD_DIR = os.path.join(os.path.dirname(__file__), 'dashboard')

# Fila para logs em tempo real
log_queue = queue.Queue()

def stream_logs():
    while True:
        log = log_queue.get()
        if log is None: break
        yield f"data: {json.dumps({'message': log})}\n\n"

def run_script_and_capture_logs(command, cwd):
    process = subprocess.Popen(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    for line in iter(process.stdout.readline, ''):
        log_queue.put(line.strip())
    
    process.stdout.close()
    process.wait()
    log_queue.put("🏁 Processo concluído.")

@app.route('/')
def index():
    return send_from_directory(DASHBOARD_DIR, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(DASHBOARD_DIR, path)

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    if not os.path.exists(REPORT_PATH):
        return jsonify([])
    with open(REPORT_PATH, 'r', encoding='utf-8') as f:
        try:
            return jsonify(json.load(f))
        except:
            return jsonify([])

@app.route('/api/stream')
def stream():
    return Response(stream_logs(), mimetype='text/event-stream')

@app.route('/api/search', methods=['POST'])
def run_search():
    data = request.json or {}
    query = data.get('query', 'Software Engineer Node.js')
    location = data.get('location', 'Brazil')
    
    python_exe = os.path.join(os.path.dirname(__file__), 'venv', 'bin', 'python')
    if not os.path.exists(python_exe): python_exe = 'python3'

    threading.Thread(
        target=run_script_and_capture_logs,
        args=([python_exe, 'main.py', query, location], os.path.dirname(__file__))
    ).start()
    
    return jsonify({"status": "success", "message": "Busca iniciada."})

@app.route('/api/apply/<int:job_index>', methods=['POST'])
def run_apply(job_index):
    python_exe = os.path.join(os.path.dirname(__file__), 'venv', 'bin', 'python')
    if not os.path.exists(python_exe): python_exe = 'python3'

    threading.Thread(
        target=run_script_and_capture_logs,
        args=([python_exe, 'apply_manual_jobs.py', str(job_index)], os.path.dirname(__file__))
    ).start()
    
    return jsonify({"status": "success", "message": "Candidatura iniciada."})

@app.route('/api/upload', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "Nenhum arquivo enviado."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "Nome de arquivo vazio."}), 400
    
    if file and file.filename.endswith('.pdf'):
        save_path = os.path.join(os.path.dirname(__file__), 'my_resume.pdf')
        file.save(save_path)
        log_queue.put(f"📂 Novo currículo enviado e salvo: {file.filename}")
        return jsonify({"status": "success", "message": "Currículo atualizado com sucesso!"})
    
    return jsonify({"status": "error", "message": "Apenas arquivos PDF são permitidos."}), 400

if __name__ == '__main__':

    print("🚀 ICO Platform Backend running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)

