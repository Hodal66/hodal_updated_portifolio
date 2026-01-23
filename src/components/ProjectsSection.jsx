import { Icon } from '@iconify/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../data/config';
import { useIsLoaded } from '../hooks/usePortfolio';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const getStatusClasses = () => {
    switch (project.status) {
      case 'Production':
        return 'bg-green-500/15 text-green-400 border-green-500/30';
      case 'Development':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
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
    <article
      onClick={() => navigate(`/project/${project.slug}`)}
      className={`group relative p-6 sm:p-8 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-primary-500/40'
          : 'bg-white border border-gray-200 hover:border-primary-500/50 shadow-sm hover:shadow-lg'
      } hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/10`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${project.gradient}`} />

      <div className="flex items-start justify-between mb-5">
        <div className={`w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br ${project.gradient} rounded-xl flex items-center justify-center text-white text-2xl sm:text-3xl shadow-lg`}>
          <Icon icon={project.image} className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusClasses()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className={`px-3 py-1 rounded-md text-xs font-medium ${isDark ? 'bg-primary-500/10 text-primary-300' : 'bg-primary-500/10 text-primary-600'}`}>
          {project.category}
        </span>
        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{project.year}</span>
        {project.duration && (
          <>
            <span className={isDark ? 'text-gray-700' : 'text-gray-300'}>•</span>
            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{project.duration}</span>
          </>
        )}
      </div>

      <h3 className={`text-xl sm:text-2xl font-bold mb-2 leading-tight group-hover:text-primary-400 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {project.title}
      </h3>

      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{project.subtitle}</p>
      <p className={`text-sm mb-5 line-clamp-2 leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{project.description}</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {project.tech.slice(0, 4).map((t, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-md text-xs font-medium ${isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
            {t}
          </span>
        ))}
        {project.tech.length > 4 && (
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${isDark ? 'bg-primary-500/10 border border-primary-500/20 text-primary-400' : 'bg-primary-50 border border-primary-200 text-primary-600'}`}>
            +{project.tech.length - 4} {t('projects.more')}
          </span>
        )}
      </div>

      <div className={`flex items-center justify-between pt-5 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{project.role}</span>
        <span className="text-primary-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          {t('projects.viewCaseStudy')} <span>→</span>
        </span>
      </div>
    </article>
  );
};

const ProjectsSection = () => {
  const isLoaded = useIsLoaded();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <section className={`min-h-screen px-4 sm:px-6 pt-28 pb-16 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-subtitle">{t('projects.subtitle')}</span>
          <h2 className="section-title mt-2 mb-4">{t('projects.title')}</h2>
          <p className={`max-w-xl mx-auto text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('projects.description')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
