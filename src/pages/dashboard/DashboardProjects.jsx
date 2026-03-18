import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchProjects, createProject, deleteProject } from '../../services/api';

const ProjectModal = ({ onClose, onSave }) => {
  const { isDark } = useTheme();
  const [form, setForm] = useState({ title: '', slug: '', description: '', category: '', tech: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const auto = name === 'title' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {};
    setForm(prev => ({ ...prev, [name]: value, ...auto }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, tech: form.tech.split(',').map((t) => t.trim()).filter(Boolean) };
      const project = await createProject(payload);
      onSave(project);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl outline-none transition-all text-sm ${
    isDark ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500' : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary-500'
  }`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>New Project</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <Icon icon="fluent:dismiss-24-regular" width="20" />
          </button>
        </div>
        {error && <div className="mb-4 p-3 bg-rose-500/10 text-rose-400 rounded-xl text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'title', label: 'Title', placeholder: 'My Awesome Project' },
            { name: 'slug', label: 'Slug', placeholder: 'my-awesome-project' },
            { name: 'description', label: 'Description', placeholder: 'A brief description...' },
            { name: 'category', label: 'Category', placeholder: 'Web, Mobile, API...' },
            { name: 'tech', label: 'Technologies', placeholder: 'React, Node.js, MongoDB (comma separated)' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label>
              <input name={name} value={form[name]} onChange={handleChange} className={inputClass} placeholder={placeholder} required={['title','slug','description'].includes(name)} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-sm transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DashboardProjects = () => {
  const { user } = useOutletContext();
  const { isDark } = useTheme();
  const isAdmin = user?.roles?.includes('admin');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProjects().then(setProjects).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      showToast(`"${title}" deleted`);
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const statusColors = {
    'live': 'bg-emerald-500/10 text-emerald-400',
    'in-progress': 'bg-blue-500/10 text-blue-400',
    'archived': 'bg-slate-500/10 text-slate-400',
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-lg flex items-center gap-2 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          <Icon icon={toast.type === 'error' ? 'fluent:warning-24-filled' : 'fluent:checkmark-24-filled'} width="18" />
          {toast.message}
        </div>
      )}
      {showModal && (
        <ProjectModal onClose={() => setShowModal(false)} onSave={(p) => {
          setProjects((prev) => [p, ...prev]);
          showToast(`"${p.title}" created!`);
        }} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400">{loading ? 'Loading...' : `${projects.length} projects`}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25"
          >
            <Icon icon="fluent:add-24-filled" width="20" />
            New Project
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse">
              <div className="h-4 rounded w-3/4 bg-slate-200 dark:bg-white/10 mb-3" />
              <div className="h-3 rounded w-1/2 bg-slate-100 dark:bg-white/5" />
            </div>
          ))
        ) : projects.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-slate-500">
            <Icon icon="fluent:briefcase-24-regular" width="64" className="mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-2">No projects yet</p>
            {isAdmin && <button onClick={() => setShowModal(true)} className="text-primary-500 text-sm hover:underline font-medium">Create your first project →</button>}
          </div>
        ) : projects.map((p) => (
          <div key={p._id} className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center">
                <Icon icon="fluent:briefcase-24-regular" width="22" />
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${statusColors[p.status] || 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                {p.status || 'draft'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">{p.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{p.description}</p>
            {p.tech?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.tech.slice(0, 4).map((t) => (
                  <span key={t} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg">{t}</span>
                ))}
                {p.tech.length > 4 && <span className="text-[10px] text-slate-400">+{p.tech.length - 4}</span>}
              </div>
            )}
            <div className={`flex items-center gap-2 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              {p.links?.live && (
                <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-500 hover:underline font-medium">
                  <Icon icon="fluent:open-24-regular" width="14" />
                  Live
                </a>
              )}
              {p.links?.github && (
                <a href={p.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-white font-medium">
                  <Icon icon="mdi:github" width="14" />
                  GitHub
                </a>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(p._id, p.title)}
                  aria-label={`Delete ${p.title}`}
                  className="ml-auto p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Icon icon="fluent:delete-24-regular" width="16" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardProjects;
