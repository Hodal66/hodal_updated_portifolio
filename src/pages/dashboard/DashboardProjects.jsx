import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  fetchProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  uploadProjectImage 
} from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectModal = ({ onClose, onSave, editingProject }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('core');

  // Initial state logic
  const getInitialForm = () => {
    const defaultLocalized = {
      titleFr: '', titleSw: '', titleRw: '',
      subtitleFr: '', subtitleSw: '', subtitleRw: '',
      categoryFr: '', categorySw: '', categoryRw: '',
      descriptionFr: '', descriptionSw: '', descriptionRw: '',
      overviewFr: '', overviewSw: '', overviewRw: '',
      challengeFr: '', challengeSw: '', challengeRw: '',
      solutionFr: '', solutionSw: '', solutionRw: '',
    };

    if (editingProject) {
      return {
        ...defaultLocalized,
        ...editingProject,
        tech: Array.isArray(editingProject.tech) ? editingProject.tech.join(', ') : '',
        lessons: Array.isArray(editingProject.lessons) ? editingProject.lessons.join('\n') : '',
        links: editingProject.links || {},
        metrics: editingProject.metrics || {}
      };
    }
    return {
      title: '', slug: '', subtitle: '', category: '', year: '', duration: '',
      status: 'live', role: '', team: '', description: '', overview: '',
      challenge: '', solution: '', tech: '', lessons: '',
      ...defaultLocalized,
      links: { github: '', live: '', demo: '', docs: '', company: '' },
      featured: false, order: 0
    };
  };

  const [form, setForm] = useState(getInitialForm());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested links
    if (name.startsWith('link_')) {
      const linkKey = name.replace('link_', '');
      setForm(prev => ({
        ...prev,
        links: { ...prev.links, [linkKey]: value }
      }));
      return;
    }

    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    const auto = name === 'title' && !editingProject 
      ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } 
      : {};
    
    setForm(prev => ({ ...prev, [name]: value, ...auto }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject?._id) return;

    setUploading(true);
    try {
      const { image } = await uploadProjectImage(editingProject._id, file);
      setForm(prev => ({ ...prev, image }));
    } catch (err) {
      setError('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { 
        ...form, 
        tech: typeof form.tech === 'string' ? form.tech.split(',').map((t) => t.trim()).filter(Boolean) : form.tech,
        lessons: typeof form.lessons === 'string' ? form.lessons.split('\n').map((l) => l.trim()).filter(Boolean) : form.lessons
      };

      let result;
      if (editingProject) {
        result = await updateProject(editingProject._id, payload);
      } else {
        result = await createProject(payload);
      }
      
      onSave(result);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all text-sm font-medium ${
    isDark ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500' : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary-500'
  }`;

  const labelClass = `block text-[10px] font-extrabold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`;

  const tabs = [
    { id: 'core', label: 'Core Info', icon: 'fluent:info-24-filled' },
    { id: 'details', label: 'Story & Narrative', icon: 'fluent:book-24-filled' },
    { id: 'tech', label: 'Stack & Links', icon: 'fluent:code-24-filled' },
    { id: 'localization', label: 'Localization', icon: 'fluent:globe-24-filled' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border shadow-2xl flex flex-col ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
      >
        {/* Header */}
        <div className="p-8 border-b border-inherit flex items-center justify-between shrink-0">
          <div>
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {editingProject ? 'Edit Project' : 'Add New Portfolio Piece'}
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-1">Populate your project dashboard with rich data</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all">
            <Icon icon="fluent:dismiss-24-regular" width="24" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 py-2 border-b border-inherit bg-inherit sticky top-0 z-10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon icon={tab.icon} width="18" />
              {tab.label}
              {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {error && <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-sm font-bold flex items-center gap-3">
             <Icon icon="fluent:error-circle-24-filled" width="20" />
             {error}
          </div>}

          <div className="space-y-10">
            {activeTab === 'core' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="col-span-2 flex flex-col items-center sm:flex-row gap-8 mb-4">
                  <div className="relative group">
                    <div className={`w-36 h-36 rounded-[2rem] overflow-hidden border-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'} flex items-center justify-center shadow-inner`}>
                      {form.image ? (
                        <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <Icon icon="fluent:image-24-filled" width="48" className="text-slate-600/30" />
                      )}
                    </div>
                    {editingProject && (
                      <label className="absolute -bottom-2 -right-2 p-3 bg-primary-500 text-white rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                        <Icon icon={uploading ? 'fluent:spinner-24-regular' : 'fluent:camera-24-filled'} width="20" className={uploading ? 'animate-spin' : ''} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className={`font-black uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Cover Image</h4>
                    <p className="text-xs text-slate-500 font-medium max-w-xs">Upload a high-quality 16:9 thumbnail. Recommended size: 1280x720px.</p>
                    {!editingProject && <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest bg-primary-500/10 px-3 py-1 rounded-full inline-block">Create first to upload image</p>}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Project Title</label>
                    <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. IHUZE Mentorship" required />
                  </div>
                  <div>
                    <label className={labelClass}>URL Slug</label>
                    <input name="slug" value={form.slug} onChange={handleChange} className={inputClass} placeholder="ihuze-platform" required disabled={!!editingProject} />
                  </div>
                  <div>
                    <label className={labelClass}>Subtitle</label>
                    <input name="subtitle" value={form.subtitle} onChange={handleChange} className={inputClass} placeholder="Enterprise-Grade Mentorship Ecosystem" />
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Category</label>
                        <input name="category" value={form.category} onChange={handleChange} className={inputClass} placeholder="Web App" />
                      </div>
                      <div>
                        <label className={labelClass}>Year</label>
                        <input name="year" value={form.year} onChange={handleChange} className={inputClass} placeholder="2025" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                          <option value="live">Live</option>
                          <option value="in-progress">In Progress</option>
                          <option value="archived">Archived</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Duration</label>
                        <input name="duration" value={form.duration} onChange={handleChange} className={inputClass} placeholder="6 months" />
                      </div>
                   </div>
                   <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${form.featured ? 'bg-primary-500' : (isDark ? 'bg-white/10' : 'bg-slate-200')}`}>
                           <motion.div animate={{ x: form.featured ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                        <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="hidden" />
                        <span className={`text-xs font-black uppercase tracking-widest ${form.featured ? 'text-primary-500' : 'text-slate-500'}`}>Featured</span>
                      </label>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                   <label className={labelClass}>Short Description (Grid View)</label>
                   <textarea name="description" value={form.description} onChange={handleChange} className={`${inputClass} h-24 resize-none`} placeholder="Visible on project cards..." required />
                </div>
                <div>
                   <label className={labelClass}>Project Overview (Landing Page Intro)</label>
                   <textarea name="overview" value={form.overview} onChange={handleChange} className={`${inputClass} h-40 resize-none`} placeholder="Detailed summary of the mission and goal..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className={labelClass}>The Challenge</label>
                    <textarea name="challenge" value={form.challenge} onChange={handleChange} className={`${inputClass} h-32 resize-none`} placeholder="What problems were we solving?" />
                  </div>
                  <div>
                    <label className={labelClass}>The Solution</label>
                    <textarea name="solution" value={form.solution} onChange={handleChange} className={`${inputClass} h-32 resize-none`} placeholder="How does the tech solve it?" />
                  </div>
                </div>
                <div>
                   <label className={labelClass}>Key Lessons (One per line)</label>
                   <textarea name="lessons" value={form.lessons} onChange={handleChange} className={`${inputClass} h-32 resize-none`} placeholder="What did you learn?" />
                </div>
              </div>
            )}

            {activeTab === 'tech' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className={labelClass}>Technology Stack (Comma Separated)</label>
                      <input name="tech" value={form.tech} onChange={handleChange} className={inputClass} placeholder="React, Node.js, Tailwind..." />
                   </div>
                   <div>
                      <label className={labelClass}>Project Role</label>
                      <input name="role" value={form.role} onChange={handleChange} className={inputClass} placeholder="Lead Frontend Developer" />
                   </div>
                </div>

                <div>
                   <h4 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 ${isDark ? 'text-primary-400' : 'text-primary-500'}`}>
                     <Icon icon="fluent:link-24-filled" width="20" />
                     External Links & Deployment
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { key: 'github', label: 'GitHub Repository', icon: 'mdi:github' },
                        { key: 'live', label: 'Production URL', icon: 'fluent:globe-24-regular' },
                        { key: 'demo', label: 'Demo / Sandbox', icon: 'fluent:box-24-regular' },
                        { key: 'docs', label: 'Documentation', icon: 'fluent:document-24-regular' },
                        { key: 'company', label: 'Company Link', icon: 'fluent:building-24-regular' },
                      ].map(link => (
                        <div key={link.key}>
                           <label className={labelClass}>{link.label}</label>
                           <div className="relative">
                              <input 
                                name={`link_${link.key}`} 
                                value={form.links[link.key] || ''} 
                                onChange={handleChange} 
                                className={`${inputClass} pl-12`} 
                                placeholder="https://..." 
                              />
                              <Icon icon={link.icon} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" width="18" />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
            {activeTab === 'localization' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {['Fr', 'Sw', 'Rw'].map(lang => (
                  <div key={lang} className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className={`text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 ${isDark ? 'text-primary-400' : 'text-primary-500'}`}>
                      <Icon icon="fluent:translate-24-filled" width="20" />
                      {lang === 'Fr' ? 'French (FR)' : lang === 'Sw' ? 'Kiswahili (SW)' : 'Kinyarwanda (RW)'} Content
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div className="space-y-6">
                          <div>
                            <label className={labelClass}>Title ({lang})</label>
                            <input name={`title${lang}`} value={form[`title${lang}`] || ''} onChange={handleChange} className={inputClass} placeholder="Translated title..." />
                          </div>
                          <div>
                            <label className={labelClass}>Subtitle ({lang})</label>
                            <input name={`subtitle${lang}`} value={form[`subtitle${lang}`] || ''} onChange={handleChange} className={inputClass} placeholder="Translated subtitle..." />
                          </div>
                          <div>
                            <label className={labelClass}>Category ({lang})</label>
                            <input name={`category${lang}`} value={form[`category${lang}`] || ''} onChange={handleChange} className={inputClass} placeholder="Translated category..." />
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div>
                            <label className={labelClass}>Short Description ({lang})</label>
                            <textarea name={`description${lang}`} value={form[`description${lang}`] || ''} onChange={handleChange} className={`${inputClass} h-32 resize-none`} placeholder="Translated card description..." />
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-6">
                       <div>
                          <label className={labelClass}>Full Overview ({lang})</label>
                          <textarea name={`overview${lang}`} value={form[`overview${lang}`] || ''} onChange={handleChange} className={`${inputClass} h-40 resize-none`} placeholder="Detailed localized overview..." />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-inherit bg-inherit shrink-0 flex gap-4">
          <button type="button" onClick={onClose} className={`flex-1 py-4 font-black uppercase tracking-widest text-xs rounded-2xl transition-all ${
            isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}>
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading} 
            className="flex-[2] py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary-500/30 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Icon icon="fluent:spinner-24-regular" className="animate-spin" width="20" /> : <Icon icon="fluent:save-24-filled" width="20" />}
            {editingProject ? 'Apply Changes' : 'Publish Project'}
          </button>
        </div>
      </motion.div>
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
  const [editingProject, setEditingProject] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState({ search: '', category: 'all' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProjects(50).then(setProjects).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you absolutely sure you want to delete "${title}"? This action cannot be undone.`)) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      showToast(`Project permanently removed`);
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                          p.category?.toLowerCase().includes(filter.search.toLowerCase());
    const matchesCat = filter.category === 'all' || p.category === filter.category;
    return matchesSearch && matchesCat;
  });

  const categories = ['all', ...new Set(projects.map(p => p.category).filter(Boolean))];

  const statusColors = {
    'live': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'in-progress': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'archived': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    'draft': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      {toast && (
        <div className={`fixed top-4 right-4 z-[110] px-6 py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-300 ${
          toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
        }`}>
          <Icon icon={toast.type === 'error' ? 'fluent:warning-24-filled' : 'fluent:checkmark-24-filled'} width="22" />
          {toast.message}
        </div>
      )}

      {showModal && (
        <ProjectModal 
          editingProject={editingProject}
          onClose={() => { setShowModal(false); setEditingProject(null); }} 
          onSave={(p) => {
            if (editingProject) {
                setProjects(prev => prev.map(item => item._id === p._id ? p : item));
                showToast(`Changes saved successfully`);
            } else {
                setProjects((prev) => [p, ...prev]);
                showToast(`Project published!`);
            }
          }} 
        />
      )}

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4">
        <div>
          <h1 className={`text-5xl font-black tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Project <span className="text-primary-500">Command</span>
          </h1>
          <div className="flex items-center gap-6">
            <div className={`px-4 py-2 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className="text-[10px] font-black uppercase tracking-widest block opacity-50 mb-1">Total Assets</span>
              <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{loading ? '...' : projects.length}</span>
            </div>
            <div className={`px-4 py-2 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <span className="text-[10px] font-black uppercase tracking-widest block opacity-50 mb-1">Featured</span>
              <span className={`text-xl font-black text-primary-500`}>{loading ? '...' : projects.filter(p => p.featured).length}</span>
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => { setEditingProject(null); setShowModal(true); }}
            className="group flex items-center gap-4 px-8 py-5 bg-primary-500 hover:bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-primary-500/40 hover:-translate-y-1 active:translate-y-0"
          >
            <Icon icon="fluent:add-24-filled" width="24" className="transition-transform group-hover:rotate-90" />
            New Workspace
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-[2rem] border backdrop-blur-3xl flex flex-col md:flex-row gap-4 ${
        isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
      }`}>
        <div className="flex-1 relative">
           <input 
             type="text" 
             placeholder="Search projects by title or technology..."
             value={filter.search}
             onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
             className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all ${
               isDark ? 'bg-white/5 text-white focus:bg-white/10' : 'bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 ring-primary-500/10'
             }`}
           />
           <Icon icon="fluent:search-24-regular" className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" width="22" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setFilter(prev => ({ ...prev, category: cat }))}
               className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                 filter.category === cat 
                   ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/30' 
                   : (isDark ? 'bg-white/5 text-slate-500 border-white/5 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-500')
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {error && <div className="p-8 bg-rose-500/10 border-2 border-dashed border-rose-500/30 rounded-[2.5rem] text-rose-500 text-center flex flex-col items-center gap-4">
        <Icon icon="fluent:error-circle-24-filled" width="48" />
        <p className="font-black uppercase tracking-widest text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold">Retry Connection</button>
      </div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-[480px] rounded-[3rem] animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-center opacity-40">
            <Icon icon="fluent:box-24-regular" width="120" className="mb-8" />
            <h3 className="text-3xl font-black uppercase tracking-tighter">No Segments Found</h3>
            <p className="font-bold text-sm mt-4">Adjust your filters or initiate a new project</p>
          </div>
        ) : filteredProjects.map((p) => (
          <motion.div 
            layout
            key={p._id} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex flex-col rounded-[3rem] border group overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-24px_rgba(0,0,0,0.5)] ${
              isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/30'
            }`}
          >
            {/* Visual Container */}
            <div className="relative h-64 overflow-hidden shrink-0">
               <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10`} />
               {p.image ? (
                 <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.title} />
               ) : (
                 <div className={`w-full h-full bg-gradient-to-br ${p.gradient || 'from-slate-700 to-slate-900'} flex items-center justify-center`}>
                    <Icon icon={p.image || 'fluent:box-24-filled'} width="80" className="text-white/10" />
                 </div>
               )}
               
               <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg ${statusColors[p.status] || 'bg-white/10 text-white border-white/20'}`}>
                    {p.status || 'system'}
                  </span>
                  {p.featured && (
                    <span className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg border-2 border-white/20">
                       <Icon icon="fluent:star-24-filled" width="16" />
                    </span>
                  )}
               </div>

               <div className="absolute bottom-6 left-8 right-8 z-20">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">{p.category}</p>
                  <h3 className="text-2xl font-black text-white tracking-tight truncate leading-none">{p.title}</h3>
               </div>
            </div>

            {/* Content Container */}
            <div className="p-8 flex-1 flex flex-col">
              <p className={`text-sm font-medium leading-relaxed mb-6 flex-1 line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {p.description}
              </p>

              {p.tech?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {p.tech.slice(0, 5).map((t) => (
                    <span key={t} className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                      isDark ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>{t}</span>
                  ))}
                  {p.tech.length > 5 && <span className="text-[10px] font-black text-primary-500">+{p.tech.length - 5}</span>}
                </div>
              )}

              {/* Action Bar */}
              <div className={`flex items-center gap-2 pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  {p.links?.live && (
                    <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all">
                      <Icon icon="fluent:globe-24-regular" width="18" />
                    </a>
                  )}
                  {p.links?.github && (
                    <a href={p.links.github} target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-xl transition-all ${
                      isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white'
                    }`}>
                      <Icon icon="mdi:github" width="18" />
                    </a>
                  )}
                </div>

                {isAdmin && (
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => { setEditingProject(p); setShowModal(true); }}
                      className={`p-3 rounded-2xl transition-all ${isDark ? 'hover:bg-indigo-500/20 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'}`}
                      title="Edit Specs"
                    >
                      <Icon icon="fluent:edit-24-filled" width="20" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.title)}
                      className={`p-3 rounded-2xl transition-all ${isDark ? 'hover:bg-rose-500/20 text-rose-400' : 'hover:bg-rose-50 text-rose-500'}`}
                      title="Terminate Project"
                    >
                      <Icon icon="fluent:delete-24-filled" width="20" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardProjects;
