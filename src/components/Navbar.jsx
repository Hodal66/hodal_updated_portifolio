import React, { useState, useEffect, useRef } from 'react';
import { config, sections } from '../data/config';
import { useScrollPosition } from '../hooks/usePortfolio';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import logo from '../assets/Hodal_Logo_No_Bg.png';
import { Link } from 'react-router-dom';

const Navbar = ({ activeSection, setActiveSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const { isScrolled } = useScrollPosition();
  const { isDark, toggleTheme } = useTheme();
  const { t, language, changeLanguage, languages } = useLanguage();
  const langDropdownRef = useRef(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeSection]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === language);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? isDark
            ? 'bg-dark-950/95 backdrop-blur-xl border-b border-white/5'
            : 'bg-white/95 backdrop-blur-xl border-b border-gray-200'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
         <Link to="/">  
          <div className="flex items-baseline gap-0.5">
           <img src={logo} alt="Muheto Hodal" />
          </div>
         </Link>
          <div className="hidden md:flex items-center gap-1">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`nav-link ${activeSection === section ? 'nav-link-active' : 'nav-link-inactive'}`}
              >
                {t(`nav.${section}`)}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{currentLang?.flag}</span>
                <span className="hidden lg:inline">{currentLang?.name}</span>
                <svg className={`w-4 h-4 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLangDropdownOpen && (
                <div className={`absolute top-full right-0 mt-2 w-44 rounded-xl overflow-hidden shadow-xl z-50 ${
                  isDark ? 'bg-dark-900 border border-white/10' : 'bg-white border border-gray-200'
                }`}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setIsLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                        language === lang.code
                          ? 'bg-primary-500/10 text-primary-400'
                          : isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                      {language === lang.code && <span className="ml-auto text-primary-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <a href={`https://${config.website}`} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300">
              {t('nav.visitPortfolio')}
            </a>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden flex flex-col justify-center items-center w-11 h-11 rounded-xl gap-1.5 p-2 ${
              isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'
            }`}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-primary-400 rounded transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-primary-400 rounded transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-primary-400 rounded transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)} />

      <div className={`fixed top-0 right-0 bottom-0 w-72 max-w-[80vw] z-50 transform transition-transform duration-300 ${
        isDark ? 'bg-dark-950 border-l border-white/10' : 'bg-white border-l border-gray-200'
      } ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full pt-20 px-4 pb-6">
          <div className="flex flex-col gap-2">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 flex items-center gap-3 ${
                  activeSection === section
                    ? 'bg-primary-500/10 text-primary-400'
                    : isDark ? 'text-gray-200 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeSection === section ? 'bg-primary-400' : isDark ? 'bg-white/20' : 'bg-gray-300'}`} />
                {t(`nav.${section}`)}
              </button>
            ))}
          </div>

          <div className={`mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-xs font-semibold mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Language</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    language === lang.code
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30'
                      : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="text-xs">{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isDark ? (
                <>
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {t('theme.light')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  {t('theme.dark')}
                </>
              )}
            </button>
          </div>

          <div className="mt-auto pt-6">
            <a href={`https://${config.website}`} target="_blank" rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl text-center font-semibold text-white">
              {t('nav.visitPortfolio')}
            </a>
            <div className={`mt-4 p-4 rounded-xl text-center ${isDark ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-primary-50 border border-primary-200'}`}>
              <span className={`text-xs block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('nav.studentId')}</span>
              <span className="text-primary-400 font-bold text-xl">{config.studentId}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
