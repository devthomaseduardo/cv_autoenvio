const API_BASE = 'http://localhost:5000/api';
let allJobs = [];
let currentFilter = 'all';

async function fetchJobs() {
    try {
        const response = await fetch(`${API_BASE}/jobs`);
        allJobs = await response.json();
        applyFiltersAndRender();
        updateStats(allJobs);
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
    }
}

function applyFiltersAndRender() {
    let filtered = allJobs;
    if (currentFilter === 'high') {
        filtered = allJobs.filter(j => (j.score || 0) >= 80);
    } else if (currentFilter === 'pending') {
        filtered = allJobs.filter(j => !j.applied);
    }
    renderJobs(filtered);
}

function renderJobs(jobs) {
    const grid = document.getElementById('job-grid');
    grid.innerHTML = '';

    if (jobs.length === 0) {
        grid.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1">
                <i data-lucide="info" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem"></i>
                <p>Nenhuma vaga encontrada para este filtro.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    jobs.forEach((job, index) => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.onclick = () => showJobDetails(job, index);

        const score = job.score || 0;
        const scoreColor = score >= 80 ? 'var(--accent-primary)' : score >= 60 ? 'var(--accent-secondary)' : '#f87171';
        
        card.innerHTML = `
            <div class="job-header">
                <div class="company-logo">${job.company ? job.company.substring(0, 1) : 'J'}</div>
                <div class="match-badge" style="color: ${scoreColor}; border-color: ${scoreColor}33; background: ${scoreColor}11">
                    ${score}% Match
                </div>
            </div>
            <div class="job-title">${job.title}</div>
            <div class="job-company">${job.company}</div>
            <div class="job-tags">
                <span class="tag">${job.seniority || 'N/A'}</span>
                ${(job.skill_gaps || []).slice(0, 2).map(gap => `<span class="tag warning">Falta: ${gap}</span>`).join('')}
            </div>
            <div class="job-footer">
                <span class="job-source">
                    <i data-lucide="globe" style="width: 14px"></i>
                    ${job.source || 'Plataforma'}
                </span>
                ${job.applied ? `<span style="font-size: 0.75rem; color: var(--accent-primary)">✅ Aplicada</span>` : `<i data-lucide="arrow-right" style="width: 16px"></i>`}
            </div>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

function updateStats(jobs) {
    document.getElementById('total-analyzed').textContent = jobs.length;
    const avg = jobs.length ? Math.round(jobs.reduce((acc, j) => acc + (j.score || 0), 0) / jobs.length) : 0;
    document.getElementById('avg-match').textContent = `${avg}%`;
    document.getElementById('total-applied').textContent = jobs.filter(j => j.applied).length;
}

function showJobDetails(job, index) {
    const modal = document.getElementById('modal-container');
    const body = document.getElementById('modal-body');

    const technicalBrief = job.technical_brief || { focus: 'Geral', potential_questions: [] };

    body.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem">
            <div>
                <h2 style="font-size: 2.2rem; margin-bottom: 0.5rem; letter-spacing: -1px">${job.title}</h2>
                <div style="color: var(--text-muted); font-size: 1.1rem; font-weight: 500">${job.company} • ${job.seniority || 'N/A'}</div>
            </div>
            <div style="text-align: right">
                <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); margin-bottom: 0.5rem">Match Score</div>
                <div style="font-size: 3.5rem; font-weight: 900; color: var(--accent-primary); line-height: 1">${job.score || 0}%</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.8fr 1fr; gap: 3.5rem">
            <div>
                <section style="margin-bottom: 2.5rem">
                    <h3 style="margin-bottom: 1.25rem; color: var(--accent-primary); display: flex; align-items: center; gap: 0.75rem">
                        <i data-lucide="target"></i> Resumo Estratégico
                    </h3>
                    <p style="line-height: 1.7; font-size: 1.05rem; color: #cbd5e1">${job.match_summary || 'Sem resumo disponível.'}</p>
                </section>

                <section>
                    <h3 style="margin-bottom: 1.25rem; color: var(--accent-secondary); display: flex; align-items: center; gap: 0.75rem">
                        <i data-lucide="brain"></i> Technical Interview Brief
                    </h3>
                    <div style="background: rgba(255,255,255,0.02); padding: 2rem; border-radius: 24px; border: 1px solid var(--glass-border)">
                        <div style="margin-bottom: 1.5rem">
                            <p style="font-weight: 700; color: white; margin-bottom: 0.5rem; font-size: 0.95rem">Foco Recomendado:</p>
                            <p style="font-size: 1rem; color: var(--text-muted)">${technicalBrief.focus}</p>
                        </div>
                        <div>
                            <p style="font-weight: 700; color: white; margin-bottom: 1rem; font-size: 0.95rem">Perguntas Prováveis:</p>
                            <ul style="display: flex; flex-direction: column; gap: 1rem; list-style: none">
                                ${(technicalBrief.potential_questions || []).map(q => `
                                    <li style="display: flex; gap: 0.75rem; font-size: 0.95rem; color: var(--text-muted)">
                                        <i data-lucide="help-circle" style="width: 18px; color: var(--accent-secondary); flex-shrink: 0"></i>
                                        ${q}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            <div>
                <div style="margin-bottom: 2.5rem">
                    <h4 style="margin-bottom: 1.25rem; font-size: 1rem">Skill Gaps Identificados</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem">
                        ${(job.skill_gaps || []).length > 0 ? job.skill_gaps.map(gap => `
                            <span class="tag warning" style="padding: 0.6rem 1rem; font-size: 0.85rem">${gap}</span>
                        `).join('') : '<span class="tag" style="color: var(--accent-primary)">Nenhum gap crítico! 🚀</span>'}
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.02); padding: 2rem; border-radius: 24px; border: 1px solid var(--glass-border); margin-bottom: 2rem">
                    <div style="font-size: 0.9rem; margin-bottom: 1.5rem">
                        <strong style="display: block; margin-bottom: 0.25rem">Localização:</strong>
                        <span style="color: var(--text-muted)">${job.location || 'Não especificada'}</span>
                    </div>
                    <div style="font-size: 0.9rem">
                        <strong style="display: block; margin-bottom: 0.25rem">Plataforma:</strong>
                        <span style="color: var(--text-muted)">${job.source || 'Desconhecida'}</span>
                    </div>
                </div>

                <button class="btn btn-primary" style="width: 100%; padding: 1.25rem; font-size: 1rem" onclick="applyToJob(${index})">
                    <i data-lucide="send"></i> 
                    <span>${job.applied ? 'Re-aplicar Agora' : 'Aplicar Estrategicamente'}</span>
                </button>
                <p style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem">
                    O bot usará comportamento humano e responderá "ETEC" conforme configurado.
                </p>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();
}

async function applyToJob(index) {
    const btn = event.currentTarget;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px"></div><span>Processando...</span>';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/apply/${index}`, { method: 'POST' });
        const result = await response.json();
        alert(result.message);
        fetchJobs(); // Refresh to show application status
    } catch (error) {
        alert('Erro ao iniciar aplicação.');
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

document.querySelector('.close-modal').onclick = () => {
    document.getElementById('modal-container').classList.add('hidden');
};

document.getElementById('run-search').onclick = async () => {
    const btn = document.getElementById('run-search');
    const query = document.getElementById('job-query-input').value;
    const location = document.getElementById('location-input').value;

    if (!query) {
        alert('Por favor, insira o cargo desejado.');
        return;
    }

    const originalContent = btn.innerHTML;
    btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px"></div><span>Buscando...</span>';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/search`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, location })
        });
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        alert('Erro ao iniciar busca.');
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
};

document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.onclick = () => {
        document.querySelector('.filter-chip.active').classList.remove('active');
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        applyFiltersAndRender();
    };
});

document.getElementById('refresh-jobs').onclick = fetchJobs;

// Initial fetch
fetchJobs();
// Refresh every 30 seconds
setInterval(fetchJobs, 30000);
