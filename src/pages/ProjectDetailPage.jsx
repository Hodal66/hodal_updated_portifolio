import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projects, config } from '../data/config';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const project = projects.find((p) => p.slug === slug);
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  useEffect(() => {
    setIsLoaded(false);
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [slug]);

  if (!project) {
    return (
      <div className={`min-h-screen flex items-center justify-center flex-col gap-6 ${isDark ? 'bg-dark-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <span className="text-6xl">🔍</span>
        <h1 className="text-3xl font-bold">{t('projects.notFound')}</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('projects.notFoundDesc')}</p>
        <button onClick={() => navigate('/')} className="btn-primary">{t('projects.backHome')}</button>
      </div>
    );
  }

  const getStatusClasses = () => {
    switch (project.status) {
      case 'Production': return 'bg-green-500/30';
      case 'Development': return 'bg-yellow-500/30';
      default: return 'bg-blue-500/30';
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case 'Production': return t('status.production');
      case 'Development': return t('status.development');
      case 'Academic Project': return t('status.academic');
      default: return t('status.completed');
    }
  };

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-dark-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-30 bg-grid" />
        <div className={`absolute top-[10%] -left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] ${isDark ? 'bg-primary-500/10' : 'bg-primary-500/20'}`} />
        <div className={`absolute bottom-[20%] -right-[20%] w-[600px] h-[600px] rounded-full blur-[120px] ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/15'}`} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b ${isDark ? 'bg-dark-950/90 border-white/5' : 'bg-white/90 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link to="/" className={`flex items-center gap-2 transition-colors text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <span className="text-xl">←</span> {t('nav.backToPortfolio')}
          </Link>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black gradient-text">{config.studentId}</span>
            <span className={`font-light ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>.f25</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`relative z-10 pt-20 transition-all duration-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        {/* Hero */}
        <section className={`relative px-4 sm:px-6 py-16 sm:py-20 overflow-hidden bg-gradient-to-br ${project.gradient}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="max-w-5xl mx-auto relative">
            <div className="flex items-center gap-2 mb-8 text-sm flex-wrap">
              <Link to="/" className="text-white/70 hover:text-white">{t('nav.home')}</Link>
              <span className="text-white/50">/</span>
              <Link to="/" className="text-white/70 hover:text-white">{t('nav.projects')}</Link>
              <span className="text-white/50">/</span>
              <span className="text-white">{project.title}</span>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <span className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl border border-white/20">{project.image}</span>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm text-white font-medium">{project.category}</span>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm text-white font-medium">{project.year}</span>
                  <span className={`px-4 py-2 rounded-full text-sm text-white font-semibold ${getStatusClasses()}`}>{getStatusText()}</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">{project.title}</h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/85 max-w-3xl leading-relaxed">{project.subtitle}</p>

              <div className="flex flex-wrap gap-6 sm:gap-8 mt-2">
                <div><span className="text-white/60 text-sm block">{t('projects.role')}</span><span className="text-white font-semibold">{project.role}</span></div>
                <div><span className="text-white/60 text-sm block">{t('projects.duration')}</span><span className="text-white font-semibold">{project.duration}</span></div>
                <div><span className="text-white/60 text-sm block">{t('projects.team')}</span><span className="text-white font-semibold">{project.team}</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 sm:-mt-16 mb-12 sm:mb-16">
              {Object.entries(project.metrics).map(([key, data], i) => (
                <div key={i} className={`p-5 sm:p-6 rounded-2xl text-center backdrop-blur-md ${isDark ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10' : 'bg-white border border-gray-200 shadow-md'}`}>
                  <span className="block text-2xl sm:text-3xl font-extrabold gradient-text mb-1">{data.value}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{data.label}</span>
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Overview */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-12 h-12 bg-primary-500/15 rounded-xl flex items-center justify-center text-xl">📋</span>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('projects.projectOverview')}</h2>
                  </div>
                  <div className="card p-6">
                    <p className={`leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{project.overview}</p>
                  </div>
                </div>

                {/* Challenge */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center text-xl">🎯</span>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('projects.theChallenge')}</h2>
                  </div>
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-red-500/5 border border-red-500/15' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{project.challenge}</p>
                  </div>
                </div>

                {/* Solution */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-12 h-12 bg-green-500/15 rounded-xl flex items-center justify-center text-xl">💡</span>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('projects.theSolution')}</h2>
                  </div>
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-green-500/5 border border-green-500/15' : 'bg-green-50 border border-green-200'}`}>
                    <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{project.solution}</p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-12 h-12 bg-violet-500/15 rounded-xl flex items-center justify-center text-xl">✨</span>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('projects.keyFeatures')}</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {project.features.map((feature, i) => (
                      <div key={i} className={`p-5 rounded-xl transition-colors ${isDark ? 'card hover:border-primary-500/30' : 'bg-white border border-gray-200 hover:border-primary-500/50'}`}>
                        <h4 className="text-primary-400 font-semibold mb-2 flex items-center gap-2">
                          <span className="text-primary-500">▹</span>{feature.title}
                        </h4>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lessons */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-12 h-12 bg-yellow-500/15 rounded-xl flex items-center justify-center text-xl">📚</span>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('projects.lessonsLearned')}</h2>
                  </div>
                  <div className="card p-6">
                    <ul className="space-y-4">
                      {project.lessons.map((lesson, i) => (
                        <li key={i} className={`flex items-start gap-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center text-xs text-primary-400 font-bold shrink-0 mt-0.5">{i + 1}</span>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className={`sticky top-24 p-6 rounded-2xl space-y-8 ${isDark ? 'card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                  {/* Tech Stack */}
                  <div>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <span className="w-9 h-9 bg-blue-500/15 rounded-lg flex items-center justify-center">🛠️</span>
                      {t('projects.techStack')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, i) => (
                        <span key={i} className="tech-badge">{tech}</span>
                      ))}
                    </div>
                  </div>

                  {/* Architecture */}
                  <div>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <span className="w-9 h-9 bg-violet-500/15 rounded-lg flex items-center justify-center">🏗️</span>
                      {t('projects.architecture')}
                    </h3>
                    <div className="space-y-3">
                      {project.architecture.map((layer, i) => (
                        <div key={i} className={`p-3 rounded-lg border-l-[3px] border-primary-500 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                          <span className="block text-primary-400 text-xs font-semibold uppercase tracking-wider mb-1">{layer.layer}</span>
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{layer.tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  {project.links && Object.keys(project.links).length > 0 && (
                    <div>
                      <h3 className={`text-lg font-bold mb-4 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <span className="w-9 h-9 bg-emerald-500/15 rounded-lg flex items-center justify-center">🔗</span>
                        {t('projects.links')}
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(project.links).map(([key, url], i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center justify-between p-3 rounded-lg transition-all ${isDark ? 'bg-white/[0.03] text-gray-300 hover:bg-primary-500/10 hover:text-primary-400' : 'bg-gray-50 text-gray-600 hover:bg-primary-500/10 hover:text-primary-600'}`}>
                            <span className="font-medium capitalize">
                              {key === 'github' ? '🐙 GitHub' : key === 'live' ? '🌐 Live Demo' : key === 'demo' ? '🎮 Demo' : key === 'docs' ? '📄 Documentation' : `🔗 ${key}`}
                            </span>
                            <span>→</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className={`flex justify-between items-stretch gap-4 sm:gap-6 mt-12 sm:mt-16 pt-8 border-t flex-wrap ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              {prevProject ? (
                <Link to={`/project/${prevProject.slug}`} className={`flex-1 min-w-[250px] p-5 rounded-xl transition-colors ${isDark ? 'card hover:border-primary-500/30' : 'bg-white border border-gray-200 hover:border-primary-500/50'}`}>
                  <span className={`text-sm block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>← {t('projects.previousProject')}</span>
                  <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{prevProject.title}</span>
                </Link>
              ) : <div className="flex-1" />}

              {nextProject ? (
                <Link to={`/project/${nextProject.slug}`} className={`flex-1 min-w-[250px] p-5 rounded-xl text-right transition-colors ${isDark ? 'card hover:border-primary-500/30' : 'bg-white border border-gray-200 hover:border-primary-500/50'}`}>
                  <span className={`text-sm block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('projects.nextProject')} →</span>
                  <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{nextProject.title}</span>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-6 text-center ${isDark ? 'border-t border-white/5' : 'border-t border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>© 2025 {config.name} • {t('nav.studentId')}: {config.studentId}</p>
        </footer>
      </main>
    </div>
  );
};

export default ProjectDetailPage;
