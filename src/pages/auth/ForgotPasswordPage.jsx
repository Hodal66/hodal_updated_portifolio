import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Icon } from '@iconify/react';
import logo from '../../assets/HodalTechLogo.jpeg';

const ForgotPasswordPage = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Reset password for:', email);
    // Handle reset password logic here
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl ${isDark ? 'bg-dark-900 border border-white/5' : 'bg-white border border-gray-100 shadow-xl'}`}>
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={logo} alt="Logo" className="h-12 w-auto mx-auto rounded-xl" />
          </Link>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('auth.forgotPasswordTitle')}</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('auth.forgotPasswordSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('auth.emailLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon icon="fluent:mail-24-regular" className="w-5 h-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${
                  isDark 
                    ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-primary-500'
                }`}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {t('auth.submitReset')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className={`text-sm font-medium flex items-center justify-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <Icon icon="fluent:arrow-left-24-regular" className="w-4 h-4" />
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
