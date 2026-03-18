import { Icon } from '@iconify/react';
import React from 'react';
import { skills } from '../data/config';
import { useIsLoaded } from '../hooks/usePortfolio';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const SkillsSection = () => {
  const isLoaded = useIsLoaded();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const skillKeys = ['frontend', 'backend', 'database', 'devops'];

  return (
    <section className={`min-h-screen px-4 sm:px-6 pt-28 pb-16 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-subtitle">{t('skills.subtitle')}</span>
          <h2 className="section-title mt-2 mb-4">{t('skills.title')}</h2>
          <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t('skills.description')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(skills).map(([category, data], idx) => (
            <div key={idx} className="card card-hover p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className={`w-14 h-14 bg-gradient-to-br ${data.gradient} rounded-xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                  <Icon icon={data.icon} className="w-8 h-8" />
                </span>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t(`skills.${skillKeys[idx]}`)}</h3>
              </div>

              <div className="space-y-4">
                {data.items.map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{skill.name}</span>
                      <span className="text-primary-400 text-sm">{skill.level}%</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                      <div className={`h-full bg-gradient-to-r ${data.gradient} rounded-full transition-all duration-1000`} style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
