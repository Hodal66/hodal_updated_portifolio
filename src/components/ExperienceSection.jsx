import React from 'react';
import { experience } from '../data/config';
import { useIsLoaded } from '../hooks/usePortfolio';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const ExperienceSection = () => {
  const isLoaded = useIsLoaded();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <section className={`min-h-screen px-4 sm:px-6 pt-28 pb-16 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-subtitle">{t('experience.subtitle')}</span>
          <h2 className="section-title mt-2 mb-4">{t('experience.title')}</h2>
          <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('experience.description')}</p>
        </div>

        <div className="space-y-8">
          {experience.map((exp, idx) => (
            <div key={idx} className="relative pl-8">
              <div className={`absolute left-0 top-0 w-0.5 bg-gradient-to-b from-primary-500 to-transparent ${idx === experience.length - 1 ? 'h-1/2' : 'h-full'}`} />
              <div className={`absolute -left-2 top-0 w-[18px] h-[18px] bg-primary-500 rounded-full border-4 shadow-lg shadow-primary-500/50 ${isDark ? 'border-dark-950' : 'border-gray-50'}`} />

              <div className={`ml-4 p-6 sm:p-8 rounded-2xl transition-all ${isDark ? 'card hover:border-primary-500/20' : 'bg-white border border-gray-200 shadow-sm hover:border-primary-500/30 hover:shadow-md'}`}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${isDark ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400' : 'bg-primary-50 border border-primary-200 text-primary-600'}`}>
                    {exp.period}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-sm ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    {exp.type}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>📍 {exp.location}</span>
                </div>

                <h3 className={`text-xl sm:text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{exp.role}</h3>
                <p className="text-primary-400 font-medium mb-4">{exp.company}</p>
                <p className={`leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exp.description}</p>

                <div>
                  <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('experience.keyAchievements')}:</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {exp.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary-400 mt-0.5">✓</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
