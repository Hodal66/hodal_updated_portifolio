import React from 'react';
import { config, techStack, stats } from '../data/config';
import { useIsLoaded } from '../hooks/usePortfolio';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const HeroSection = ({ setActiveSection }) => {
  const isLoaded = useIsLoaded();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const statLabels = ['yearsExp', 'projects', 'technologies', 'clients'];

  return (
    <section className={`min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div className="max-w-4xl mx-auto text-center w-full">
        <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-8 ${isDark ? 'bg-gradient-to-r from-primary-500/10 to-cyan-500/10 border border-primary-500/20' : 'bg-gradient-to-r from-primary-500/10 to-cyan-500/10 border border-primary-500/30'}`}>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-primary-400 text-sm font-medium">{t('hero.available')}</span>
          <span className={isDark ? 'text-gray-600' : 'text-slate-400'}>•</span>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{t('Tel: +25078 2439 775')}</span>
        </div>

        <div className="mb-8">
          <div className="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-br from-primary-400 via-cyan-400 to-violet-500">
            <div className={`w-full h-full rounded-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-dark-800 to-dark-900' : 'bg-gradient-to-br from-slate-100 to-white'}`}>
              <span className="text-4xl font-black gradient-text">MH</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4">
          <span className={`bg-clip-text text-transparent ${isDark ? 'bg-gradient-to-r from-white via-gray-100 to-gray-300' : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700'}`}>
            {config.name}
          </span>
        </h1>

        <p className={`text-lg sm:text-xl md:text-2xl mb-3 font-light ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{config.title}</p>
        <p className="text-lg text-primary-400 font-medium mb-8">{t('hero.tagline')}</p>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {techStack.map((tech, i) => (
            <span key={i} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-default ${isDark ? 'bg-white/5 border border-white/10 text-gray-300 hover:border-primary-500/50 hover:bg-primary-500/5' : 'bg-slate-100 border border-slate-200 text-slate-700 hover:border-primary-500 hover:bg-primary-500/5'}`}>
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button onClick={() => setActiveSection('projects')} className="btn-primary flex items-center gap-2 group">
            {t('hero.viewWork')}
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
          <button onClick={() => setActiveSection('contact')} className="btn-secondary">
            {t('hero.getInTouch')}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="card p-4 sm:p-6 text-center group">
              <span className="block text-2xl sm:text-3xl font-black gradient-text mb-1">{stat.value}</span>
              <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{t(`hero.${statLabels[i]}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
