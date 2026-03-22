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

/** ──────────────────────── Project Editor Component ──────────────────────── */

const ProjectEditor = ({ project, onSave, onCancel }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('core');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(getInitialForm());

  function getInitialForm() {
    return {
      title: '', slug: '', subtitle: '', category: 'Web Ecosystem', year: new Date().getFullYear().toString(),
      duration: '', status: 'live', role: '', team: 'Solitary',
      description: '', overview: '', challenge: '', solution: '',
      image: 'https://res.cloudinary.com/dqd87p5cz/image/upload/v1774208280/TimtomAviation_sx1mrm.png', 
      gradient: 'from-primary-600 to-cyan-600',
      featured: false, order: 0,
      tech: [], tags: [],
      links: { github: '', live: '', demo: '', docs: '', company: '' },
      metrics: [], features: [], architecture: [], lessons: [],
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
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'title' && !project) {
        // Auto-generate slug for new projects
        const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setForm(prev => ({ ...prev, title: value, slug }));
    } else if (name.includes('.')) {
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
      alert('Upload failed. Current rule: Save details first for new projects, then upload images.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (publicId) => {
    if (!project?._id || !window.confirm('Executing removal protocol. Confirm?')) return;
    try {
      const res = await deleteProjectImage(project._id, publicId);
      setForm(prev => ({ 
        ...prev, 
        images: prev.images.filter(img => img.publicId !== publicId),
        image: prev.image === res.deletedUrl ? '' : prev.image
      }));
    } catch (err) { alert('Operation failed'); }
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
    
    const payload = { 
      ...form, 
      metrics: form.metrics.reduce((acc, curr) => {
        if (curr.label && curr.value) acc[curr.label.replace(/\s+/g, '_')] = { label: curr.label, value: curr.value };
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
    } catch (err) {
      setErrors(err.errors || { message: err.message });
      // Scroll to top to see error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'core', label: 'Identity', icon: 'fluent:fingerprint-24-filled' },
    { id: 'narrative', label: 'Story', icon: 'fluent:book-letter-24-filled' },
    { id: 'tech', label: 'Stack', icon: 'fluent:laptop-code-24-filled' },
    { id: 'media', label: 'Media', icon: 'fluent:image-multiple-24-filled' },
    { id: 'trans', label: 'Localized', icon: 'fluent:localize-24-filled' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className={`rounded-[2.5rem] overflow-hidden border ${isDark ? 'bg-slate-950/40 border-white/10' : 'bg-white border-slate-200'} shadow-2xl`}
    >
      <div className="flex flex-col h-full min-h-[70vh]">
        {/* Editor Ribbon */}
        <div className="px-8 py-6 border-b border-inherit flex items-center justify-between bg-primary-500/5">
          <div className="flex items-center gap-4">
            <button onClick={onCancel} className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Icon icon="fluent:chevron-left-24-filled" width="24" />
            </button>
            <div>
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{project ? 'Refine Project' : 'Initiate New Project'}</h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-primary-500' : 'text-primary-600'}`}>HodalTech CMS Active Session</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onCancel} className={`px-4 py-2 rounded-xl text-xs font-bold ${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50'}`}>Cancel</button>
             <button 
                type="submit" form="project-editor-form" disabled={loading}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all"
             >
                {loading ? 'Propagating...' : (project ? 'Commit' : 'Initialize')}
             </button>
          </div>
        </div>

        {errors.message && (
            <div className="mx-8 mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold animate-shake">
               ⚠️ Integrity Error: {errors.message}
            </div>
        )}

        <div className="flex flex-1 flex-col md:flex-row divide-x divide-inherit min-h-[600px]">
          {/* Navigation Tabs */}
          <div className={`w-full md:w-64 p-4 flex md:flex-col gap-2 overflow-x-auto ${isDark ? 'bg-black/20' : 'bg-slate-50/50'}`}>
            {tabs.map(tab => (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-primary-500 text-white shadow-xl translate-x-1' : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-white shadow-sm'
                }`}
              >
                <Icon icon={tab.icon} width="18" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form id="project-editor-form" onSubmit={handleSubmit} className="flex-1 p-8 space-y-10 custom-scrollbar overflow-y-auto">
             <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-8">
                   
                   {activeTab === 'core' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Field label="Title" name="title" value={form.title} onChange={handleChange} required placeholder="Project Name" error={errors.title} />
                        <Field label="URL Slug" name="slug" value={form.slug} onChange={handleChange} required placeholder="project-slug" error={errors.slug} />
                        <Field label="Brief Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} colSpan="2" />
                        <div className="grid grid-cols-2 gap-6 col-span-2">
                           <Select label="Category" name="category" value={form.category} onChange={handleChange} options={['Web Ecosystem', 'Mobile Innovation', 'AI / ML', 'Cloud Arch', 'Enterprise', 'UI/UX Design']} />
                           <Field label="Year" name="year" value={form.year} onChange={handleChange} />
                           <Select label="Status" name="status" value={form.status} onChange={handleChange} options={['live', 'development', 'planned', 'archived']} />
                           <Field label="Role" name="role" value={form.role} onChange={handleChange} placeholder="e.g. Lead Developer" />
                           <Field label="Team" name="team" value={form.team} onChange={handleChange} />
                           <Field label="Rank Order" type="number" name="order" value={form.order} onChange={handleChange} />
                        </div>
                        <div className="col-span-2 p-6 rounded-3xl bg-primary-500/5 border border-primary-500/10 flex items-center justify-between">
                            <div>
                               <p className="font-black text-[10px] uppercase text-primary-500 mb-1">Feature Profile</p>
                               <p className="text-xs opacity-60 font-medium">Prioritize this project on the homepage frontline.</p>
                            </div>
                            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-6 h-6 rounded-lg text-primary-500 border-inherit outline-none focus:ring-primary-500" />
                        </div>
                     </div>
                   )}

                   {activeTab === 'narrative' && (
                     <div className="space-y-10">
                        <Area label="Listing Excerpt (Short)" name="description" value={form.description} onChange={handleChange} required rows={3} error={errors.description} />
                        <Area label="Deep Overview (Full Story)" name="overview" value={form.overview} onChange={handleChange} rows={6} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <Area label="The Obstacles" name="challenge" value={form.challenge} onChange={handleChange} rows={4} />
                           <Area label="The Resolution" name="solution" value={form.solution} onChange={handleChange} rows={4} />
                        </div>
                        
                        <div className="space-y-6">
                           <div className="flex items-center justify-between bg-primary-500/5 p-4 rounded-2xl">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-500">Value Features</h4>
                              <button type="button" onClick={() => addArrayItem('features', { title: '', description: '' })} className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-[9px] font-black uppercase"><Icon icon="fluent:add-24-filled" /> Add Feature</button>
                           </div>
                           <div className="grid gap-4">
                              {form.features.map((f, i) => (
                                 <div key={i} className="group flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary-500/20 transition-all">
                                    <div className="flex-1 space-y-3">
                                       <input className="w-full bg-transparent border-b border-white/10 py-2 outline-none text-sm font-black" placeholder="Feature Title" value={f.title} onChange={e => handleArrayChange('features', i, 'title', e.target.value)} />
                                       <textarea className="w-full bg-transparent outline-none text-xs opacity-60 leading-relaxed" placeholder="Detailed description..." rows={2} value={f.description} onChange={e => handleArrayChange('features', i, 'description', e.target.value)} />
                                    </div>
                                    <button type="button" onClick={() => removeArrayItem('features', i)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Icon icon="fluent:delete-24-regular" width="18" /></button>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}

                   {activeTab === 'tech' && (
                     <div className="space-y-10">
                        <Field label="Tech Landscape (Comma separated)" value={form.tech.join(', ')} onChange={e => setForm(prev => ({ ...prev, tech: e.target.value.split(',').map(s => s.trim()) }))} placeholder="React, Node.js, Three.js" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <Field label="GitHub Sanctuary" name="links.github" value={form.links.github} onChange={handleChange} icon="mdi:github" />
                           <Field label="Live Projection" name="links.live" value={form.links.live} onChange={handleChange} icon="fluent:globe-24-regular" />
                           <Field label="Production Demo" name="links.demo" value={form.links.demo} onChange={handleChange} icon="fluent:play-24-regular" />
                           <Field label="System Docs" name="links.docs" value={form.links.docs} onChange={handleChange} icon="fluent:book-24-regular" />
                        </div>

                        {/* Architecture Layers */}
                        <div className="space-y-6">
                           <div className="flex items-center justify-between bg-primary-500/5 p-4 rounded-2xl">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-500">Architecture Layers</h4>
                              <button type="button" onClick={() => addArrayItem('architecture', { layer: '', tech: '' })} className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-[9px] font-black uppercase"><Icon icon="fluent:add-24-filled" /> Add Layer</button>
                           </div>
                           <div className="grid gap-3">
                              {form.architecture.map((a, i) => (
                                 <div key={i} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                                    <input className="flex-1 p-3 rounded-xl bg-black/20 outline-none text-xs font-bold" placeholder="Layer (e.g. Engine)" value={a.layer} onChange={e => handleArrayChange('architecture', i, 'layer', e.target.value)} />
                                    <input className="flex-1 p-3 rounded-xl bg-black/20 outline-none text-xs font-bold" placeholder="Tech Blueprint" value={a.tech} onChange={e => handleArrayChange('architecture', i, 'tech', e.target.value)} />
                                    <button type="button" onClick={() => removeArrayItem('architecture', i)} className="text-rose-500 p-2"><Icon icon="fluent:delete-24-regular" /></button>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="space-y-6">
                           <div className="flex items-center justify-between bg-emerald-500/5 p-4 rounded-2xl">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Success Metrics</h4>
                              <button type="button" onClick={() => addArrayItem('metrics', { label: '', value: '' })} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase"><Icon icon="fluent:add-24-filled" /> Add Metric</button>
                           </div>
                           <div className="grid gap-3">
                              {form.metrics.map((m, i) => (
                                 <div key={i} className="flex gap-4 items-center bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10">
                                    <input className="flex-1 p-3 rounded-xl bg-black/20 outline-none text-xs font-bold" placeholder="Metric Label (e.g. Speed)" value={m.label} onChange={e => handleArrayChange('metrics', i, 'label', e.target.value)} />
                                    <input className="flex-1 p-3 rounded-xl bg-black/20 outline-none text-xs font-bold" placeholder="Value (e.g. 150ms)" value={m.value} onChange={e => handleArrayChange('metrics', i, 'value', e.target.value)} />
                                    <button type="button" onClick={() => removeArrayItem('metrics', i)} className="text-rose-500 p-2"><Icon icon="fluent:delete-24-regular" /></button>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}

                   {activeTab === 'media' && (
                     <div className="space-y-10">
                        <div className="p-16 border-4 border-dashed border-primary-500/20 rounded-[3rem] text-center bg-primary-500/5 hover:bg-primary-500/10 transition-all group relative">
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading || !project?._id} />
                           <div className="relative z-10">
                              <Icon icon="fluent:cloud-arrow-up-24-filled" width="60" className="mx-auto text-primary-500 mb-4 group-hover:-translate-y-2 transition-transform" />
                              <p className="font-black text-primary-500 uppercase tracking-[0.2em] text-sm mb-2">{uploading ? 'Synching with Cloudinary...' : 'Ingest New Visuals'}</p>
                              <p className="max-w-xs mx-auto text-[10px] opacity-40 font-bold uppercase leading-relaxed">
                                 {project?._id ? 'Click or drop to propagate images to the content delivery network.' : 'Identity sync required. Save project details first to enable media propagation.'}
                              </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                           {form.images.map((img, i) => (
                              <div key={i} className={`relative group aspect-video rounded-[2.5rem] overflow-hidden border shadow-lg ${img.isFeatured ? 'border-primary-500 ring-4 ring-primary-500/20' : 'border-white/10'}`}>
                                 <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Vault Asset" />
                                 <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button type="button" onClick={() => handleSetFeatured(img.publicId)} className={`p-3 rounded-2xl ${img.isFeatured ? 'bg-primary-500' : 'bg-white/10 hover:bg-white/20'} text-white transition-all`} title="Define Core Visual">
                                       <Icon icon="fluent:star-24-filled" width="20" />
                                    </button>
                                    <button type="button" onClick={() => handleDeleteImage(img.publicId)} className="p-3 rounded-2xl bg-rose-500/90 hover:bg-rose-600 text-white transition-all" title="Execute Removal">
                                       <Icon icon="fluent:delete-24-filled" width="20" />
                                    </button>
                                 </div>
                                 {img.isFeatured && (
                                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-primary-500 rounded-full text-[8px] font-black uppercase text-white">
                                       <Icon icon="fluent:star-24-filled" /> Core Visual
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeTab === 'trans' && (
                     <div className="space-y-12">
                        <SectionHeader title="French Translation Layer" color="text-primary-500" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <Field label="Titre (FR)" name="titleFr" value={form.titleFr} onChange={handleChange} />
                           <Field label="Sous-titre (FR)" name="subtitleFr" value={form.subtitleFr} onChange={handleChange} />
                           <Area label="Résumé (FR)" name="descriptionFr" value={form.descriptionFr} onChange={handleChange} colSpan="2" />
                           <Area label="Aperçu Complet (FR)" name="overviewFr" value={form.overviewFr} onChange={handleChange} colSpan="2" rows={4} />
                        </div>
                        
                        <SectionHeader title="Swahili & Kinyarwanda Layer" color="text-cyan-500" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <Field label="Title (Swahili)" name="titleSw" value={form.titleSw} onChange={handleChange} />
                              <Area label="Summary (Swahili)" name="descriptionSw" value={form.descriptionSw} onChange={handleChange} />
                           </div>
                           <div className="space-y-6">
                              <Field label="Title (Kinyarwanda)" name="titleRw" value={form.titleRw} onChange={handleChange} />
                              <Area label="Summary (Kinyarwanda)" name="descriptionRw" value={form.descriptionRw} onChange={handleChange} />
                           </div>
                        </div>
                     </div>
                   )}
                </motion.div>
             </AnimatePresence>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

/** ──────────────────────── Main Dashboard Component ──────────────────────── */

const DashboardProjects = () => {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [selectedProject, setSelectedProject] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data?.projects || []);
    } catch (err) {
      console.error('Vault Retrieval Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Permanent execution sequence. Proceed with deletion?')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) { alert('Deletion intercepted'); }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'All' || p.category === filter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen space-y-10 animate-in fade-in duration-1000">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div>
                  <h1 className={`text-5xl font-black tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Master Project Vault</h1>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {loading ? 'Decrypting vault contents...' : (projects.length === 0 ? 'Vault currently unoccupied.' : `System online. ${projects.length} core entities managed.`)}
                  </p>
               </div>
               <button 
                onClick={() => { setSelectedProject(null); setView('editor'); }}
                className="group flex items-center gap-4 px-8 py-4 bg-primary-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all"
               >
                 <Icon icon="fluent:add-24-filled" width="24" className="group-hover:rotate-90 transition-transform" />
                 Initialize Entity
               </button>
            </div>

            {/* Filtering Deck */}
            <div className={`p-4 rounded-[2.5rem] border flex flex-col md:flex-row items-center gap-6 ${isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'} shadow-xl`}>
               <div className="relative flex-1 w-full flex items-center">
                  <Icon icon="fluent:search-24-regular" className={`absolute left-6 text-2xl ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input 
                    type="text" placeholder="Scan vault records..." value={search} onChange={e => setSearch(e.target.value)}
                    className={`w-full pl-16 pr-6 py-5 rounded-3xl outline-none font-bold text-sm transition-all ${isDark ? 'bg-black/30 text-white border border-white/5 focus:border-primary-500' : 'bg-slate-50 text-slate-900 border border-slate-100 focus:border-primary-500'}`}
                  />
               </div>
               <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {categories.map(cat => (
                    <button 
                        key={cat} onClick={() => setFilter(cat)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filter === cat ? 'bg-primary-500 text-white shadow-lg translate-y-[-2px]' : isDark ? 'bg-white/5 text-slate-500 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                  ))}
               </div>
            </div>

            {/* Content Display */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {[1,2,3,4,5,6].map(i => <div key={i} className={`aspect-[16/11] rounded-[3rem] animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />)}
                </div>
            ) : projects.length === 0 ? (
                <div className={`py-40 rounded-[4rem] border-4 border-dashed flex flex-col items-center justify-center gap-8 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'}`}>
                   <Icon icon="fluent:box-24-regular" width="100" className="opacity-10" />
                   <div className="text-center">
                      <p className="font-black opacity-20 uppercase tracking-[0.5em] text-sm mb-4">Vault Session Inactive</p>
                      <button onClick={() => setView('editor')} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Begin First Initialization</button>
                   </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
                    {filteredProjects.map(p => (
                        <motion.div 
                            key={p._id} layoutId={p._id}
                            className={`group relative flex flex-col rounded-[3.5rem] border overflow-hidden transition-all duration-700 ${
                                isDark ? 'bg-slate-900/40 border-white/5 hover:border-primary-500/40' : 'bg-white border-slate-200 hover:shadow-3xl hover:shadow-primary-500/10'
                            }`}
                        >
                            <div className="aspect-[16/10] relative overflow-hidden">
                                <img 
                                    src={p.images?.find(i => i.isFeatured)?.url || p.image || 'https://res.cloudinary.com/dqd87p5cz/image/upload/v1774208280/TimtomAviation_sx1mrm.png'} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={p.title} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                                
                                <div className="absolute top-6 right-6 flex gap-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                   <button onClick={() => { setSelectedProject(p); setView('editor'); }} className="p-3 bg-white text-slate-900 rounded-2xl shadow-2xl hover:bg-primary-500 hover:text-white transition-all transform hover:scale-110">
                                      <Icon icon="fluent:edit-24-filled" width="22" />
                                   </button>
                                   <button onClick={() => handleDelete(p._id)} className="p-3 bg-white text-slate-900 rounded-2xl shadow-2xl hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110">
                                      <Icon icon="fluent:delete-24-filled" width="22" />
                                   </button>
                                </div>
                                <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                                    {(p.tech || []).slice(0, 3).map((t, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[8px] font-black uppercase text-white tracking-widest border border-white/10">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">{p.category}</span>
                                   <div className={`w-2 h-2 rounded-full ${p.status === 'live' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
                                </div>
                                <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.title}</h3>
                                <p className={`text-xs line-clamp-3 leading-relaxed font-medium mb-6 flex-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.description}</p>
                                
                                <button 
                                    onClick={() => { setSelectedProject(p); setView('editor'); }}
                                    className={`w-full py-4 rounded-2xl border flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-100 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    Access Record <Icon icon="fluent:arrow-right-24-filled" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <ProjectEditor 
                project={selectedProject} 
                onSave={() => { setView('list'); loadProjects(); }}
                onCancel={() => setView('list')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ──────────────────────── Helper Components ────────────────────────

const SectionHeader = ({ title, color }) => (
    <div className="flex items-center gap-4 mb-6">
       <div className={`w-1 h-6 ${color.replace('text-', 'bg-')} rounded-full`} />
       <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${color}`}>{title}</h3>
    </div>
);

const Field = ({ label, name, value, onChange, type = 'text', required = false, colSpan = '1', placeholder = '', icon = null, error = null }) => {
  const { isDark } = useTheme();
  return (
    <div className={colSpan === '2' ? 'col-span-1 md:col-span-2' : ''}>
      <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <div className="relative group">
        {icon && <Icon icon={icon} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />}
        <input
          type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
          className={`w-full px-6 py-4 rounded-2xl outline-none transition-all font-bold text-sm ${icon ? 'pl-16' : ''} ${
            isDark 
              ? 'bg-white/5 border border-white/5 text-white focus:bg-white/10 focus:border-primary-500' 
              : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white focus:border-primary-500'
          } ${error ? 'border-rose-500 bg-rose-500/5' : ''}`}
        />
        {error && <p className="absolute -bottom-5 left-1 text-[9px] font-bold text-rose-500 uppercase">{error}</p>}
      </div>
    </div>
  );
};

const Area = ({ label, name, value, onChange, required = false, rows = 4, colSpan = '1', placeholder = '', error = null }) => {
  const { isDark } = useTheme();
  return (
    <div className={colSpan === '2' ? 'col-span-1 md:col-span-2' : ''}>
      <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <textarea
        name={name} value={value} onChange={onChange} required={required} rows={rows} placeholder={placeholder}
        className={`w-full px-6 py-5 rounded-[2rem] outline-none transition-all font-medium text-sm leading-relaxed ${
          isDark 
            ? 'bg-white/5 border border-white/5 text-slate-200 focus:bg-white/10 focus:border-primary-500' 
            : 'bg-slate-50 border border-slate-100 text-slate-900 focus:bg-white focus:border-primary-500'
        } ${error ? 'border-rose-500 bg-rose-500/5' : ''}`}
      />
      {error && <p className="mt-1 text-[9px] font-bold text-rose-500 uppercase">{error}</p>}
    </div>
  );
};

const Select = ({ label, name, value, onChange, options }) => {
  const { isDark } = useTheme();
  return (
    <div>
      <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
      <div className="relative">
         <select
            name={name} value={value} onChange={onChange}
            className={`w-full px-6 py-4 rounded-2xl outline-none font-black uppercase tracking-widest text-[10px] appearance-none cursor-pointer pr-12 ${
            isDark ? 'bg-white/5 border border-white/5 text-primary-400' : 'bg-slate-50 border border-slate-100 text-slate-600'
            }`}
         >
            {options.map(opt => <option key={opt} value={opt} className={isDark ? 'bg-slate-900' : ''}>{opt}</option>)}
         </select>
         <Icon icon="fluent:chevron-down-24-filled" className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
      </div>
    </div>
  );
};

export default DashboardProjects;
