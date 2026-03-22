import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const languages = [
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'sw', name: 'Kiswahili', flag: 'https://flagcdn.com/w40/tz.png' },
  { code: 'rw', name: 'Kinyarwanda', flag: 'https://flagcdn.com/w40/rw.png' },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio-language');
      if (saved && translations[saved]) return saved;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('portfolio-language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || translations['en']?.[key] || key;
  };

  const changeLanguage = (code) => {
    if (translations[code]) {
      setLanguage(code);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
