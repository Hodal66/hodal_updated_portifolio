import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  uploadProjectImage,
  deleteProjectImage,
  setFeaturedProjectImage
} from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

/** ──────────────────────── Project Modal Component ──────────────────────── */

const ProjectModal = ({ project, isOpen, onClose, onSave }) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('core');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(getInitialForm());

  function getInitialForm() {
    return {
      title: '', slug: '', subtitle: '', category: '', year: new Date().getFullYear().toString(),
      duration: '', status: 'live', role: '', team: 'Solitary',
      description: '', overview: '', challenge: '', solution: '',
      image: 'https://res.cloudinary.com/dqd87p5cz/image/upload/v1774208280/TimtomAviation_sx1mrm.png', 
      gradient: 'from-primary-600 to-cyan-600',
      featured: false, order: 0,
      tech: [], tags: [],
      links: { github: '', live: '', demo: '', docs: '', company: '' },
      metrics: [], features: [], architecture: [], lessons: [],
      // Localized
      titleFr: '', titleSw: '', titleRw: '',
      subtitleFr: '', subtitleSw: '', subtitleRw: '',
      descriptionFr: '', descriptionSw: '', descriptionRw: '',
      overviewFr: '', overviewSw: '', overviewRw: '',
      challengeFr: '', challengeSw: '', challengeRw: '',
      solutionFr: '', solutionSw: '', solutionRw: '',
      images: []
    };
  }

  useEffect(() => {
    if (project) {
      setForm({
        ...getInitialForm(),
        ...project,
        tech: project.tech || [],
        tags: project.tags || [],
        links: { ...getInitialForm().links, ...(project.links || {}) },
        metrics: project.metrics ? Object.entries(project.metrics).map(([k, v]) => ({ label: v.label || k, value: v.value || v })) : [],
        features: project.features || [],
        architecture: project.architecture || [],
        lessons: project.lessons || [],
        images: project.images || []
      });
    } else {
      setForm(getInitialForm());
    }
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleArrayChange = (field, index, subfield, value) => {
    setForm(prev => {
      const arr = [...prev[field]];
      if (subfield) arr[index] = { ...arr[index], [subfield]: value };
      else arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field, defaultValue) => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], defaultValue] }));
  };

  const removeArrayItem = (field, index) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !project?._id) return;
    
    setUploading(true);
    try {
      const res = await uploadProjectImage(project._id, file);
      setForm(prev => ({ ...prev, images: res.project.images, image: res.project.image }));
    } catch (err) {
      console.error(err);
      alert('Upload failed. Note: You can only upload images to existing projects. For new projects, save first, then upload images.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (publicId) => {
    if (!project?._id || !window.confirm('Are you sure you want to remove this image?')) return;
    try {
      const res = await deleteProjectImage(project._id, publicId);
      setForm(prev => ({ 
        ...prev, 
        images: prev.images.filter(img => img.publicId !== publicId),
        image: prev.image === res.deletedUrl ? '' : prev.image
      }));
    } catch (err) { alert('Delete failed'); }
  };

  const handleSetFeatured = async (publicId) => {
    if (!project?._id) return;
    try {
      const res = await setFeaturedProjectImage(project._id, publicId);
      setForm(prev => ({ ...prev, images: res.project.images, image: res.project.image }));
    } catch (err) { alert('Update failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Transform metrics array back to map if needed by backend (the logic here handles both)
    const payload = { 
      ...form, 
      metrics: form.metrics.reduce((acc, curr) => {
        acc[curr.label.replace(/\s+/g, '_')] = { label: curr.label, value: curr.value };
        return acc;
      }, {})
    };

    try {
      if (project?._id) {
        await updateProject(project._id, payload);
      } else {
        await createProject(payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setErrors(err.errors || { message: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'core', label: 'Identity & Info', icon: 'fluent:fingerprint-24-filled' },
    { id: 'narrative', label: 'Story & Description', icon: 'fluent:book-letter-24-filled' },
    { id: 'tech', label: 'Engineering Stack', icon: 'fluent:laptop-code-24-filled' },
    { id: 'media', label: 'Galleries & Media', icon: 'fluent:image-multiple-24-filled' },
    { id: 'trans', label: 'Localization', icon: 'fluent:localize-24-filled' }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl border ${
          isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-8 py-6 border-b border-inherit flex items-center justify-between bg-primary-500/5">
            <div>
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{project ? 'Refine Project' : 'Initiate New Project'}</h2>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>CMS Operations Center</p>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Icon icon="fluent:dismiss-24-filled" width="24" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className={`w-64 border-r border-inherit hidden md:flex flex-col p-4 gap-2 ${isDark ? 'bg-slate-950/30' : 'bg-slate-50'}`}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105' 
                      : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Icon icon={tab.icon} width="20" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Content Area */}
            <form onSubmit={handleSubmit} id="project-form" className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* TAB: CORE */}
                  {activeTab === 'core' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="Project Title" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Horizon AI Engine" />
                      <Field label="URL Selector (Slug)" name="slug" value={form.slug} onChange={handleChange} required placeholder="horizon-ai-engine" />
                      <Field label="Subtitle / Brief" name="subtitle" value={form.subtitle} onChange={handleChange} colSpan="2" placeholder="The core intelligence behind Hodal's next gen apps" />
                      <div className="grid grid-cols-2 gap-4 col-span-2">
                        <Select label="Category" name="category" value={form.category} onChange={handleChange} options={['Web Ecosystem', 'Mobile Innovation', 'AI / ML', 'Cloud Arch', 'Enterprise']} />
                        <Field label="Project Year" name="year" value={form.year} onChange={handleChange} />
                        <Field label="Status" name="status" value={form.status} onChange={handleChange} placeholder="e.g. Live, Development" />
                        <Field label="Execution Role" name="role" value={form.role} onChange={handleChange} placeholder="Lead Engineer" />
                        <Field label="Team Dynamic" name="team" value={form.team} onChange={handleChange} placeholder="Solitary or Team name" />
                        <Field label="Render Order" type="number" name="order" value={form.order} onChange={handleChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 col-span-2">
                         <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20">
                            <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} className="w-5 h-5 rounded border-inherit text-primary-500" />
                            <label htmlFor="featured" className="text-sm font-black uppercase text-primary-500">Feature on Frontline</label>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: NARRATIVE */}
                  {activeTab === 'narrative' && (
                    <div className="space-y-8">
                       <Area label="Short Description (Listing)" name="description" value={form.description} onChange={handleChange} required rows={3} />
                       <Area label="Project Overview (Full)" name="overview" value={form.overview} onChange={handleChange} rows={6} />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Area label="The Challenge" name="challenge" value={form.challenge} onChange={handleChange} rows={4} />
                          <Area label="The Solution" name="solution" value={form.solution} onChange={handleChange} rows={4} />
                       </div>
                       
                       {/* Features list */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <h4 className="text-sm font-black uppercase tracking-widest text-primary-500">Key Features</h4>
                             <button type="button" onClick={() => addArrayItem('features', { title: '', description: '' })} className="p-2 bg-primary-500/10 rounded-lg text-primary-500 hover:bg-primary-500/20 transition-all">
                                <Icon icon="fluent:add-24-filled" />
                             </button>
                          </div>
                          <div className="grid gap-4">
                             {form.features.map((f, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                   <div className="flex-1 space-y-2">
                                      <input className="w-full bg-transparent border-b border-white/10 py-1 outline-none text-sm font-bold" placeholder="Feature Title" value={f.title} onChange={e => handleArrayChange('features', i, 'title', e.target.value)} />
                                      <textarea className="w-full bg-transparent py-1 outline-none text-xs opacity-70" placeholder="Feature Description" rows={2} value={f.description} onChange={e => handleArrayChange('features', i, 'description', e.target.value)} />
                                   </div>
                                   <button type="button" onClick={() => removeArrayItem('features', i)} className="text-rose-500 mt-2"><Icon icon="fluent:delete-24-regular" /></button>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}

                  {/* TAB: TECH & LINKS */}
                  {activeTab === 'tech' && (
                    <div className="space-y-8">
                       <Field label="Main Tech Stack (Comma separated)" value={form.tech.join(', ')} onChange={e => setForm(prev => ({ ...prev, tech: e.target.value.split(',').map(s => s.trim()) }))} placeholder="React, Node.js, MongoDB" />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Field label="GitHub Repo" name="links.github" value={form.links.github} onChange={handleChange} icon="mdi:github" placeholder="https://github.com..." />
                          <Field label="Live URL" name="links.live" value={form.links.live} onChange={handleChange} icon="fluent:globe-24-regular" placeholder="https://..." />
                          <Field label="Demo Video" name="links.demo" value={form.links.demo} onChange={handleChange} icon="fluent:play-24-regular" />
                          <Field label="Documentation" name="links.docs" value={form.links.docs} onChange={handleChange} icon="fluent:book-24-regular" />
                       </div>

                       {/* Architecture */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <h4 className="text-sm font-black uppercase tracking-widest text-primary-500">System Architecture</h4>
                             <button type="button" onClick={() => addArrayItem('architecture', { layer: '', tech: '' })} className="p-2 bg-primary-500/10 rounded-lg"><Icon icon="fluent:add-24-filled" /></button>
                          </div>
                          {form.architecture.map((a, i) => (
                             <div key={i} className="flex gap-4 items-center">
                                <input className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none text-xs" placeholder="Layer (e.g. Frontend)" value={a.layer} onChange={e => handleArrayChange('architecture', i, 'layer', e.target.value)} />
                                <input className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none text-xs" placeholder="Tech Used" value={a.tech} onChange={e => handleArrayChange('architecture', i, 'tech', e.target.value)} />
                                <button type="button" onClick={() => removeArrayItem('architecture', i)} className="text-rose-500"><Icon icon="fluent:delete-24-regular" /></button>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* TAB: MEDIA */}
                  {activeTab === 'media' && (
                    <div className="space-y-8">
                       <div className="p-10 border-2 border-dashed border-primary-500/20 rounded-3xl text-center bg-primary-500/5 hover:bg-primary-500/10 transition-all group relative">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading || !project?._id} />
                          <Icon icon="fluent:cloud-arrow-up-24-filled" width="48" className="mx-auto text-primary-500 mb-4 group-hover:scale-110 transition-transform" />
                          <p className="font-black text-primary-500 uppercase tracking-widest text-xs mb-2">{uploading ? 'Processing Image Pipeline...' : 'Propagate Images to Cloudinary'}</p>
                          <p className="text-[10px] opacity-40 uppercase font-black">{project?._id ? 'Click or Drag images here' : 'Save project details first to enable image upload'}</p>
                       </div>

                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                          {form.images.map((img, i) => (
                             <div key={i} className={`relative group aspect-[16/10] rounded-[2rem] overflow-hidden border ${img.isFeatured ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-white/10'}`}>
                                <img src={img.url} className="w-full h-full object-cover" alt="Gallery" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                   <button type="button" onClick={() => handleSetFeatured(img.publicId)} className={`p-2 rounded-lg ${img.isFeatured ? 'bg-primary-500' : 'bg-white/10'} hover:scale-110`} title="Set Featured">
                                      <Icon icon="fluent:star-24-filled" className="text-white" />
                                   </button>
                                   <button type="button" onClick={() => handleDeleteImage(img.publicId)} className="p-2 rounded-lg bg-rose-500 hover:scale-110" title="Delete">
                                      <Icon icon="fluent:delete-24-filled" className="text-white" />
                                   </button>
                                </div>
                                {img.isFeatured && <span className="absolute top-3 left-3 px-2 py-0.5 bg-primary-500 text-[8px] font-black text-white rounded-md uppercase">Core Visual</span>}
                             </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* TAB: LOCALIZATION */}
                  {activeTab === 'trans' && (
                    <div className="space-y-12">
                       <h3 className="text-xs font-black uppercase tracking-widest text-primary-500 border-l-4 border-primary-500 pl-4 py-1">French Translations</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                          <Field label="Titre Français" name="titleFr" value={form.titleFr} onChange={handleChange} />
                          <Field label="Sous-titre" name="subtitleFr" value={form.subtitleFr} onChange={handleChange} />
                          <Area label="Description Courte" name="descriptionFr" value={form.descriptionFr} onChange={handleChange} colSpan="2" />
                       </div>
                       
                       <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500 border-l-4 border-cyan-500 pl-4 py-1">Swahili & Kinyarwanda</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                          <Field label="Title (Swahili)" name="titleSw" value={form.titleSw} onChange={handleChange} />
                          <Field label="Title (Kinyarwanda)" name="titleRw" value={form.titleRw} onChange={handleChange} />
                          <Area label="Summary (Swahili)" name="descriptionSw" value={form.descriptionSw} onChange={handleChange} />
                          <Area label="Summary (Kinyarwanda)" name="descriptionRw" value={form.descriptionRw} onChange={handleChange} />
                       </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </form>
          </div>

          {/* Footer Persistence */}
          <div className={`px-8 py-6 border-t border-inherit flex items-center justify-between ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Integrity Check: {errors.message ? 'Fail' : 'Passed'}</span>
               {errors.message && <p className="text-xs text-rose-500 font-bold">{errors.message}</p>}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={onClose} className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`}>Exit Session</button>
              <button 
                type="submit" 
                form="project-form" 
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-violet-500 rounded-xl font-black uppercase tracking-widest text-xs text-white shadow-xl shadow-primary-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Propagating...' : (project ? 'Commit Changes' : 'Initialize Project')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/** ──────────────────────── Main Dashboard Component ──────────────────────── */

const DashboardProjects = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data?.projects || []);
      console.log(`Loaded ${data?.total || 0} projects into the vault.`);
    } catch (err) {
      console.error('Failed to retrieve project vault:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Executing permanent deletion sequence. Proceed?')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) { alert('Deletion intercepted/failed'); }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'All' || p.category === filter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Master Project Vault</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {loading ? 'Consulting the records...' : `${projects.length} entities secured in the vault.`}
          </p>
        </div>
        <button 
          onClick={() => { setSelectedProject(null); setIsModalOpen(true); }}
          className="flex items-center gap-3 px-6 py-3 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-500/25 hover:scale-105 active:scale-95 transition-all"
        >
          <Icon icon="fluent:add-24-filled" width="20" />
          Manifest New Project
        </button>
      </div>

      {/* Control Panel */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center gap-4 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="relative flex-1 group">
          <Icon icon="fluent:search-24-regular" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" width="20" />
          <input 
            type="text" 
            placeholder="Search the vault..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl outline-none text-sm font-medium transition-all ${isDark ? 'bg-white/5 border border-white/5 text-white focus:border-primary-500' : 'bg-slate-50 border border-slate-100 text-slate-900 focus:border-primary-500'}`}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
           {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === cat 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
           ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className={`aspect-[16/11] rounded-[2.5rem] animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
           ))}
        </div>
      ) : projects.length === 0 ? (
        <div className={`py-32 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'}`}>
           <Icon icon="fluent:box-24-regular" width="80" className="opacity-10" />
           <p className="font-black opacity-30 uppercase tracking-[0.3em] text-xs">Project Vault Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
           {filteredProjects.map(p => (
             <motion.div 
               key={p._id} 
               layoutId={p._id}
               className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${
                 isDark ? 'bg-slate-900 border-white/5 hover:border-primary-500/30' : 'bg-white border-slate-200 hover:shadow-2xl hover:shadow-primary-500/10'
               }`}
             >
                {/* ID Header Overlay */}
                <div className="absolute top-4 left-4 z-10">
                   <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black uppercase text-white tracking-widest border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">ID: {p.slug}</span>
                </div>

                <div className="aspect-[16/10] relative overflow-hidden">
                   <img 
                    src={p.images?.find(img => img.isFeatured)?.url || p.image || 'https://res.cloudinary.com/dqd87p5cz/image/upload/v1774208280/TimtomAviation_sx1mrm.png'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={p.title} 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="absolute top-4 right-4 flex gap-2">
                       <button onClick={() => { setSelectedProject(p); setIsModalOpen(true); }} className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-primary-500 hover:border-primary-500 transition-all shadow-xl">
                          <Icon icon="fluent:edit-24-filled" width="18" />
                       </button>
                       <button onClick={() => handleDelete(p._id)} className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-rose-500 hover:border-rose-500 transition-all shadow-xl">
                          <Icon icon="fluent:delete-24-filled" width="18" />
                       </button>
                   </div>
                </div>

                <div className="p-6 space-y-3">
                   <div className="flex items-center justify-between gap-4">
                      <span className="px-2.5 py-1 bg-primary-500/10 text-primary-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                      <span className={`text-[9px] font-black uppercase opacity-60 flex items-center gap-1`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${p.status?.toLowerCase().includes('live') ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                         {p.status}
                      </span>
                   </div>
                   <h3 className={`text-xl font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.title}</h3>
                   <p className={`text-xs line-clamp-2 leading-relaxed opacity-60 font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{p.description}</p>
                   
                   <div className="flex flex-wrap gap-2 pt-2">
                      {(p.tech || []).slice(0, 3).map((t, i) => (
                         <span key={i} className="text-[8px] font-black uppercase tracking-widest opacity-40">{t}{i < 2 && ' /'}</span>
                      ))}
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      )}

      {/* Persistence Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <ProjectModal 
            project={selectedProject} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSave={loadProjects}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ──────────────────────── Helper Components ────────────────────────

const Field = ({ label, name, value, onChange, type = 'text', required = false, colSpan = '1', placeholder = '', icon = null }) => {
  const { isDark } = useTheme();
  return (
    <div className={colSpan === '2' ? 'col-span-1 md:col-span-2' : ''}>
      <label className={`block text-[10px] font-extrabold uppercase tracking-widest mb-2 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group">
        {icon && <Icon icon={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width="18" />}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-2xl outline-none transition-all font-bold text-sm ${icon ? 'pl-12' : ''} ${
            isDark 
              ? 'bg-slate-800/50 border border-white/5 text-white focus:border-primary-500 focus:bg-slate-800' 
              : 'bg-slate-50 border border-slate-100 text-slate-900 focus:border-primary-500 focus:bg-white'
          }`}
        />
      </div>
    </div>
  );
};

const Area = ({ label, name, value, onChange, required = false, rows = 4, colSpan = '1', placeholder = '' }) => {
  const { isDark } = useTheme();
  return (
    <div className={colSpan === '2' ? 'col-span-1 md:col-span-2' : ''}>
      <label className={`block text-[10px] font-extrabold uppercase tracking-widest mb-2 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-5 py-4 rounded-3xl outline-none transition-all font-medium text-sm leading-relaxed ${
          isDark 
            ? 'bg-primary-500/5 border border-white/5 text-white focus:border-primary-500 focus:bg-slate-800' 
            : 'bg-slate-50 border border-slate-100 text-slate-900 focus:border-primary-500 focus:bg-white'
        }`}
      />
    </div>
  );
};

const Select = ({ label, name, value, onChange, options }) => {
  const { isDark } = useTheme();
  return (
    <div>
      <label className={`block text-[10px] font-extrabold uppercase tracking-widest mb-2 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-2xl outline-none font-black uppercase tracking-widest text-[10px] appearance-none cursor-pointer ${
          isDark ? 'bg-slate-800/50 border border-white/5 text-slate-300' : 'bg-slate-50 border border-slate-100 text-slate-600'
        }`}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
};

export default DashboardProjects;
