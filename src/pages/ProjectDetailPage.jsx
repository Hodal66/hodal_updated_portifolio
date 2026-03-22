import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { projects as staticProjects } from '../data/config';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchProjects } from '../services/api';
import { Footer } from '../components';

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [allProjects, setAllProjects] = useState(staticProjects);
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  
  const getLocalizedField = (obj, field) => {
    if (!obj || !field) return '';
    if (language === 'en') return obj[field] || '';
    
    const langSuffix = language.charAt(0).toUpperCase() + language.slice(1); // 'Fr', 'Sw', 'Rw'
    const localizedKey = field + langSuffix;
    return obj[localizedKey] || obj[field] || '';
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        if (data && data.length > 0) {
          setAllProjects(data);
        }
      } catch (error) {
        console.warn('Backend connection failed, falling back to static config.');
      } finally {
        setIsLoadingContent(false);
      }
    };
    loadProjects();
  }, []);

  const project = allProjects.find((p) => p.slug === slug);
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  useEffect(() => {
    setIsLoaded(false);
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [slug]);

  if (isLoadingContent) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-dark-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
         <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] opacity-50 animate-pulse">Initializing Interface...</p>
         </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={`min-h-screen flex items-center justify-center flex-col gap-6 ${isDark ? 'bg-dark-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <Icon icon="fluent:search-24-regular" width="80" className="opacity-20" />
        <h1 className="text-4xl font-black tracking-tighter">{t('projects.notFound')}</h1>
        <p className={`max-w-md text-center font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t('projects.notFoundDesc')}</p>
        <button onClick={() => navigate('/')} className="px-8 py-4 bg-primary-500 text-white rounded-[2rem] font-extrabold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">
          {t('projects.backHome')}
        </button>
      </div>
    );
  }

  const getStatusClasses = () => {
    switch (project.status?.toLowerCase()) {
      case 'production':
      case 'live': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'development':
      case 'in-progress': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case 'Production': return t('status.production');
      case 'Development': return t('status.development');
      case 'Academic Project': return t('status.academic');
      default: return project.status || t('status.completed');
    }
  };

  const featuredImage = project.images?.find(img => img.isFeatured)?.url || project.image || 'https://res.cloudinary.com/dqd87p5cz/image/upload/v1774208280/TimtomAviation_sx1mrm.png';

  const renderVisual = (imgUrl = featuredImage) => {
    if (imgUrl?.startsWith('http') || imgUrl?.startsWith('/')) {
        return <img src={imgUrl} alt={project.title} className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl" />;
    }
    return (
      <div className="w-full h-full bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-5xl border border-white/20 shadow-2xl">
         {(imgUrl?.includes(':') || !imgUrl) ? <Icon icon={imgUrl || 'fluent:image-24-filled'} width="64" /> : imgUrl}
      </div>
    );
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-primary-500/30 ${isDark ? 'bg-dark-950 text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[5%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[150px] animate-pulse ${isDark ? 'bg-primary-500/5' : 'bg-primary-500/10'}`} />
        <div className={`absolute bottom-[5%] -right-[10%] w-[800px] h-[800px] rounded-full blur-[150px] animate-pulse ${isDark ? 'bg-violet-500/5' : 'bg-violet-500/10'}`} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b transition-all duration-300 ${
        isDark ? 'bg-dark-950/80 border-white/5' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          <Link to="/" className={`group flex items-center gap-3 transition-colors text-xs font-extrabold uppercase tracking-widest ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            <Icon icon="fluent:arrow-left-24-filled" width="18" className="transition-transform group-hover:-translate-x-1" />
            {t('nav.backToPortfolio')}
          </Link>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
             <span className="text-sm font-black tracking-tight">{getLocalizedField(project, 'title')}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={`relative z-10 pt-20 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <section className={`relative px-4 sm:px-8 py-20 lg:py-32 overflow-hidden`}>
           {/* Dynamic Gradient Background */}
           <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-95 transition-all outline outline-1 outline-white/5`} />
           <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
           
           <div className="max-w-7xl mx-auto relative flex flex-col lg:flex-row gap-12 lg:items-center">
              <div className="flex-1 space-y-8">
                 <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
                    <span className="px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white border border-white/20">{getLocalizedField(project, 'category')}</span>
                    <span className={`px-5 py-2 backdrop-blur-xl rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${getStatusClasses()}`}>{getStatusText()}</span>
                 </div>

                  <h1 className="text-4xl sm:text-5xl md:text-hero font-display font-bold text-white leading-tight tracking-tighter drop-shadow-2xl">
                     {getLocalizedField(project, 'title')}
                  </h1>
                 
                 <p className="text-lg sm:text-xl text-white/80 max-w-2xl font-medium leading-relaxed">
                    {getLocalizedField(project, 'subtitle')}
                 </p>

                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-4">
                    <div>
                       <span className="text-white/40 text-[10px] font-extrabold uppercase tracking-widest block mb-2">{t('projects.role')}</span>
                       <span className="text-white font-bold text-lg">{getLocalizedField(project, 'role')}</span>
                    </div>
                    <div>
                       <span className="text-white/40 text-[10px] font-extrabold uppercase tracking-widest block mb-2">{t('projects.duration')}</span>
                       <span className="text-white font-bold text-lg">{project.duration}</span>
                    </div>
                    <div className="hidden sm:block">
                       <span className="text-white/40 text-[10px] font-extrabold uppercase tracking-widest block mb-2">{t('projects.team')}</span>
                       <span className="text-white font-bold text-lg">{project.team}</span>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-4 pt-6">
                    {project.links?.live && (
                       <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-2xl font-extrabold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">
                          <Icon icon="fluent:globe-24-filled" width="20" />
                          Launch Application
                       </a>
                    )}
                    {project.links?.github && (
                       <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-8 py-4 bg-black/30 backdrop-blur-md text-white border border-white/20 rounded-2xl font-extrabold uppercase tracking-widest text-[10px] hover:bg-black/50 transition-all">
                          <Icon icon="mdi:github" width="20" />
                          Source Code
                       </a>
                    )}
                 </div>
              </div>

              <div className="flex-1 max-w-2xl w-full aspect-[16/10] animate-in zoom-in fade-in duration-1000 delay-300">
                 {renderVisual()}
              </div>
           </div>
        </section>

        {/* Content Section */}
        <section className="px-4 sm:px-8 py-20 mt-[-4rem]">
          <div className="max-w-7xl mx-auto">
             {/* Dynamic Metrics */}
            {project.metrics && Object.keys(project.metrics).length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24 relative z-20">
                {Object.entries(project.metrics).map(([key, data], i) => {
                  const itemValue = typeof data === 'object' ? data.value : data;
                  const itemLabel = typeof data === 'object' ? data.label : key;
                  return (
                    <div key={i} className={`group p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center transition-all duration-500 border ${
                      isDark 
                        ? 'bg-slate-900/50 backdrop-blur-3xl border-white/5 hover:border-primary-500/30' 
                        : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-primary-500/10'
                    }`}>
                      <div className="text-4xl font-black tracking-tighter text-primary-500 mb-2 group-hover:scale-110 transition-transform">
                        {itemValue}
                      </div>
                      <div className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {itemLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-16">
                {/* Overview Card */}
                {project.overview && (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
                         <Icon icon="fluent:document-text-24-filled" width="24" />
                      </div>
                      <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('projects.projectOverview')}</h2>
                    </div>
                    <div className={`p-10 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
                      <p className={`text-lg leading-relaxed whitespace-pre-line font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {getLocalizedField(project, 'overview')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Challenge & Solution Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {project.challenge && (
                    <div className="space-y-6">
                       <h3 className={`text-xl font-black uppercase tracking-widest flex items-center gap-3 ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>
                          <Icon icon="fluent:alert-urgent-24-filled" width="20" />
                          {t('projects.theChallenge')}
                       </h3>
                       <div className={`p-8 rounded-[2rem] border h-full ${isDark ? 'bg-rose-500/5 border-rose-500/10 text-slate-400' : 'bg-rose-50/50 border-rose-100 text-slate-600'}`}>
                          <p className="font-medium leading-relaxed">{getLocalizedField(project, 'challenge')}</p>
                       </div>
                    </div>
                  )}
                  {project.solution && (
                    <div className="space-y-6">
                       <h3 className={`text-xl font-black uppercase tracking-widest flex items-center gap-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`}>
                          <Icon icon="fluent:checkmark-starburst-24-filled" width="20" />
                          {t('projects.theSolution')}
                       </h3>
                       <div className={`p-8 rounded-[2rem] border h-full ${isDark ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-400' : 'bg-emerald-50/50 border-emerald-100 text-slate-600'}`}>
                          <p className="font-medium leading-relaxed">{getLocalizedField(project, 'solution')}</p>
                       </div>
                    </div>
                  )}
                </div>

                {/* Gallery Section */}
                {project.images && project.images.length > 1 && (
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
                          <Icon icon="fluent:image-multiple-24-filled" width="24" />
                       </div>
                       <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Visual Gallery</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {project.images.filter(img => !img.isFeatured).map((img, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="group relative aspect-[16/10] rounded-[2rem] overflow-hidden border border-inherit shadow-lg"
                        >
                           <img src={img.url} alt={img.caption || project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           {img.caption && (
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                               <p className="text-white text-xs font-bold uppercase tracking-widest">{img.caption}</p>
                             </div>
                           )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features Section */}
                {project.features && project.features.length > 0 && (
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500">
                          <Icon icon="fluent:flash-24-filled" width="24" />
                       </div>
                       <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('projects.keyFeatures')}</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {project.features.map((feature, i) => (
                        <div key={i} className={`group p-8 rounded-[2rem] border transition-all duration-500 ${
                          isDark ? 'bg-white/5 border-white/5 hover:border-violet-500/30' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50 hover:border-violet-500/50'
                        }`}>
                          <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500 mb-6 group-hover:scale-110 transition-transform">
                             <span className="font-black text-xs">{i+1}</span>
                          </div>
                          <h4 className={`text-lg font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h4>
                          <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Specifications */}
              <div className="lg:col-span-4 lg:pl-4">
                <div className="sticky top-28 space-y-8">
                  {/* Tech Stack */}
                  {project.tech && project.tech.length > 0 && (
                    <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                      <h3 className={`text-[11px] font-extrabold uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Engineering Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech, i) => (
                          <span key={i} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                            isDark ? 'bg-white/5 border-white/5 text-slate-400 hover:text-primary-400 hover:border-primary-500/30' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-primary-600 hover:border-primary-500'
                          }`}>{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Architecture */}
                  {project.architecture && project.architecture.length > 0 && (
                    <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                      <h3 className={`text-[11px] font-extrabold uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>System Architecture</h3>
                      <div className="space-y-4">
                        {project.architecture.map((layer, i) => (
                          <div key={i} className="group">
                            <span className="block text-primary-500 text-[9px] font-black uppercase tracking-widest mb-1">{layer.layer}</span>
                            <span className={`text-xs font-bold leading-relaxed block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{layer.tech}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resource Access */}
                  {project.links && Object.keys(project.links).length > 0 && (
                    <div className={`p-8 rounded-[2.5rem] border bg-gradient-to-br transition-all duration-500 ${
                       isDark ? 'from-primary-500/10 to-violet-500/10 border-primary-500/20 shadow-2xl shadow-primary-500/5' : 'from-primary-50 to-violet-50 border-primary-100 shadow-xl'
                    }`}>
                      <h3 className={`text-[11px] font-extrabold uppercase tracking-widest mb-6 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>Repository & Docs</h3>
                      <div className="space-y-3">
                        {Object.entries(project.links).map(([key, url], i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[9px] border ${
                               isDark ? 'bg-black/20 border-white/5 text-white hover:bg-primary-500 hover:border-primary-500' : 'bg-white border-slate-200 text-slate-600 hover:border-primary-500 hover:text-primary-600'
                            }`}>
                            <span>
                               {key === 'github' ? 'GitHub' : key === 'live' ? 'View Live' : key === 'demo' ? 'Live Demo' : key === 'docs' ? 'Documentation' : key}
                            </span>
                            <Icon icon="fluent:chevron-right-24-filled" width="14" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination / Next Project */}
            <div className={`mt-32 pt-16 border-t flex flex-col md:flex-row gap-8 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
               <div className="flex-1">
                  {prevProject && (
                     <Link to={`/project/${prevProject.slug}`} className="group block">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 block ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Backwards</span>
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:-translate-x-2 ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                              <Icon icon="fluent:arrow-left-24-filled" width="24" />
                           </div>
                           <div>
                              <h4 className={`text-xl font-black transition-colors ${isDark ? 'text-white group-hover:text-primary-400' : 'text-slate-900 group-hover:text-primary-600'}`}>{prevProject.title}</h4>
                              <p className="text-xs font-bold opacity-40">Previous Segment</p>
                           </div>
                        </div>
                     </Link>
                  )}
               </div>
               <div className="flex-1 md:text-right">
                  {nextProject && (
                     <Link to={`/project/${nextProject.slug}`} className="group block">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 block ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Forward Sequence</span>
                        <div className="flex items-center md:flex-row-reverse gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-primary-500 text-white shadow-xl shadow-primary-500/20 transition-all group-hover:translate-x-2`}>
                              <Icon icon="fluent:arrow-right-24-filled" width="24" />
                           </div>
                           <div>
                              <h4 className={`text-xl font-black transition-colors ${isDark ? 'text-white group-hover:text-primary-400' : 'text-slate-900 group-hover:text-primary-600'}`}>{nextProject.title}</h4>
                              <p className="text-xs font-bold opacity-40">Next Evolution</p>
                           </div>
                        </div>
                     </Link>
                  )}
               </div>
            </div>
          </div>
        </section>

        {/* Standardized Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default ProjectDetailPage;
