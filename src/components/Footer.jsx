import React from 'react';
import { config } from '../data/config';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const socialLinks = [
    { icon: '🐙', link: `https://${config.github}`, label: 'GitHub' },
    { icon: '💼', link: `https://${config.linkedin}`, label: 'LinkedIn' },
    { icon: '🌐', link: `https://${config.website}`, label: 'Website' },
  ];

  return (
    <footer className={`relative py-8 ${isDark ? 'border-t border-white/5 bg-dark-950/50' : 'border-t border-gray-200 bg-gray-50/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <span className="text-xl font-black gradient-text">{config.name}</span>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('footer.role')}</p>
          </div>

          <div>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>© 2025 {config.name}. {t('footer.rights')}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{t('nav.studentId')}: {config.studentId} | {t('about.domain')}: {config.domain}</p>
          </div>

          <div className="flex gap-3">
            {socialLinks.map((social, i) => (
              <a
                key={i}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isDark ? 'bg-white/5 hover:bg-primary-500/20' : 'bg-gray-100 hover:bg-primary-500/20'
                }`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
