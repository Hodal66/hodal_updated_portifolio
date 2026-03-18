import { Icon } from '@iconify/react';
import React from 'react';
import { config, education, certifications } from '../data/config';
import { useIsLoaded } from '../hooks/usePortfolio';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const AboutSection = () => {
  const isLoaded = useIsLoaded();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <section className={`min-h-screen px-4 sm:px-6 pt-28 pb-16 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-subtitle">{t('about.subtitle')}</span>
          <h2 className="section-title mt-2 mb-4">{t('about.title')}</h2>
          <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>{t('about.description')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="card p-6 sm:p-8">
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Icon icon="fluent:person-24-filled" className="w-6 h-6 text-primary-500" />
                </span>
                {t('about.whoIAm')}
              </h3>
              <p className={`leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{t('about.bio1')}</p>
              <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t('about.bio2')}</p>
            </div>

            <div className="card p-6 sm:p-8">
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                  <Icon icon="fluent:trophy-24-filled" className="w-6 h-6 text-violet-500" />
                </span>
                {t('about.certifications')}
              </h3>
              <div className="space-y-3">
                {certifications.map((cert, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        <Icon icon={cert.icon} className="w-5 h-5" />
                      </span>
                      <div>
                        <span className={`font-medium block text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{cert.name}</span>
                        <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{cert.issuer}</span>
                      </div>
                    </div>
                    <span className="text-primary-400 text-sm">{cert.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-6 sm:p-8 rounded-2xl ${isDark ? 'bg-gradient-to-br from-primary-500/10 to-cyan-500/5 border border-primary-500/20' : 'bg-gradient-to-br from-primary-500/10 to-cyan-500/5 border border-primary-500/30'}`}>
              <h3 className="text-primary-400 text-xl font-bold mb-4">{t('about.quickInfo')}</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('about.location'), value: config.location },
                  { label: t('about.email'), value: config.email },
                  { label: t('about.domain'), value: config.domain },
                ].map((item, i) => (
                  <div key={i}>
                    <span className={`text-sm block ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{item.label}</span>
                    <span className={`font-medium text-sm break-all ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 sm:p-8">
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Icon icon="fluent:hat-graduation-24-filled" className="w-6 h-6 text-blue-500" />
                </span>
                {t('about.education')}
              </h3>
              <div className="space-y-6">
                {education.map((edu, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-primary-500/30">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-primary-500 rounded-full border-4 border-dark-950" />
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${edu.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {edu.status === 'In Progress' ? t('about.inProgress') : t('about.completed')}
                    </span>
                    <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{edu.degree}</h4>
                    <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{edu.institution}</p>
                    <p className="text-primary-400 text-sm mb-1">{edu.period}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{t('about.focus')}: {edu.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
