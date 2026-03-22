import { Icon } from '@iconify/react';
import React from 'react';
import { config } from '../data/config';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const socialLinks = [
    { icon: 'simple-icons:github', link: `https://${config.github}`, label: 'GitHub' },
    { icon: 'simple-icons:linkedin', link: `https://${config.linkedin}`, label: 'LinkedIn' },
    { icon: 'fluent:globe-24-filled', link: `https://${config.website}`, label: 'Website' },
  ];

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HodalTech",
    "url": "https://hodaltech.space/",
    "logo": "https://res.cloudinary.com/dqd87p5cz/image/upload/v1774207737/HodalTechLogo_xrm8ah.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hodalmuheto1@gmail.com",
      "contactType": "Customer Support"
    }
  };

  return (
    <footer className={`relative py-8 ${isDark ? 'border-t border-white/5 bg-dark-950/50' : 'border-t border-slate-200 bg-slate-50/50'}`}>
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <span className="text-xl font-black gradient-text">{config.name}</span>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{t('footer.role')}</p>
          </div>

          <div>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>© {new Date().getFullYear()} {config.name}. {t('footer.rights')}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>{t('about.domain')}: {config.domain}</p>
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
                  isDark ? 'bg-white/5 hover:bg-primary-500/20 text-gray-400 hover:text-primary-400' : 'bg-slate-100 hover:bg-primary-500/20 text-slate-600 hover:text-primary-600'
                }`}
              >
                <Icon icon={social.icon} className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
