import { useState, useEffect } from 'react';
import { Layout, Search, Link as LinkIcon, Plus, CheckCircle, Clock, AlertCircle, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for initial UI before backend integration
const MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior Fullstack Engineer',
    company: 'TechFlow Systems',
    location: 'Remote',
    status: 'COMPLETED',
    score: 88,
    scrapedAt: '2024-05-14T10:00:00Z',
  },
  {
    id: '2',
    title: 'Backend Developer (Node.js)',
    company: 'Fintech Solutions',
    location: 'São Paulo, BR',
    status: 'PROCESSING',
    score: null,
    scrapedAt: '2024-05-14T15:20:00Z',
  }
];

function App() {
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newJob = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'New Job Position',
        company: 'Extracting...',
        location: '---',
        status: 'PENDING',
        score: null,
        scrapedAt: new Date().toISOString(),
      };
      setJobs([newJob, ...jobs]);
      setUrl('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <h1 className="logo">JobTailor <span style={{fontSize: '0.8rem', opacity: 0.6}}>AI</span></h1>
        </div>
        <div className="user-profile">
          <div className="glass-card" style={{padding: '0.5rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div style={{width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)'}}></div>
            <span style={{fontSize: '0.875rem', fontWeight: 600}}>Thomas</span>
          </div>
        </div>
      </header>

      {/* Hero / Submit Section */}
      <section className="submit-section">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h2 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>Match Your Skills to Any Job</h2>
            <p className="text-muted">Paste a job URL from LinkedIn, Gupy, or Indeed and let AI do the rest.</p>
          </div>

          <form onSubmit={handleSubmit} className="input-group">
            <LinkIcon className="text-muted" style={{marginLeft: '1rem'}} size={20} />
            <input 
              type="text" 
              placeholder="https://linkedin.com/jobs/view/..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSubmitting}
            />
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Analyze Match'}
            </button>
          </form>
        </motion.div>
      </section>

      {/* Stats Quick View */}
      <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
        <div className="glass-card" style={{flex: 1, padding: '1.5rem'}}>
          <p className="text-muted">Total Analyses</p>
          <h3 style={{fontSize: '1.5rem'}}>24</h3>
        </div>
        <div className="glass-card" style={{flex: 1, padding: '1.5rem'}}>
          <p className="text-muted">Avg. Match Score</p>
          <h3 style={{fontSize: '1.5rem', color: 'var(--success)'}}>72%</h3>
        </div>
        <div className="glass-card" style={{flex: 1, padding: '1.5rem'}}>
          <p className="text-muted">Missing Skills</p>
          <h3 style={{fontSize: '1.5rem', color: 'var(--warning)'}}>12</h3>
        </div>
      </div>

      {/* Recent Jobs List */}
      <section>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h3 style={{fontSize: '1.25rem'}}>Recent Applications</h3>
          <button className="text-muted" style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
            View All <ChevronRight size={16} />
          </button>
        </div>

        <div className="dashboard-grid">
          <AnimatePresence>
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card job-card"
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <h4 style={{fontSize: '1.1rem', marginBottom: '0.25rem'}}>{job.title}</h4>
                    <p className="text-muted">{job.company} • {job.location}</p>
                  </div>
                  {job.score && (
                    <div className={`score-badge ${job.score > 80 ? 'score-high' : job.score > 50 ? 'score-mid' : 'score-low'}`}>
                      {job.score}%
                    </div>
                  )}
                </div>

                <div className="mt-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    {job.status === 'COMPLETED' && <CheckCircle size={14} className="text-success" style={{color: 'var(--success)'}} />}
                    {job.status === 'PROCESSING' && <Loader2 size={14} className="animate-spin" style={{color: 'var(--primary)'}} />}
                    {job.status === 'PENDING' && <Clock size={14} className="text-muted" />}
                    {job.status === 'FAILED' && <AlertCircle size={14} className="text-danger" style={{color: 'var(--danger)'}} />}
                    <span className={`status-badge status-${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </div>
                  <span className="text-muted" style={{fontSize: '0.75rem'}}>
                    {new Date(job.scrapedAt).toLocaleDateString()}
                  </span>
                </div>

                {job.status === 'COMPLETED' && (
                  <div className="mt-4" style={{paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem'}}>
                    <button className="btn-primary" style={{flex: 1, fontSize: '0.8rem', padding: '0.5rem'}}>Tailor Resume</button>
                    <button className="glass-card" style={{flex: 1, fontSize: '0.8rem', padding: '0.5rem', background: 'transparent'}}>Details</button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default App;
