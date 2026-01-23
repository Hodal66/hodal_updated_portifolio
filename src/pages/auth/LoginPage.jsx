import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Icon } from '@iconify/react';
import logo from '../../assets/HodalTechLogo.jpeg';
import authBg from '../../assets/auth-side-bg.png';

const LoginPage = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
    // Handle login logic here
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Left Side - Form */}
      <div className={`flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 relative ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
        
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className={`absolute top-8 left-8 flex items-center gap-2 text-sm font-medium transition-colors ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Icon icon="fluent:arrow-left-24-regular" className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <img src={logo} alt="Logo" className="h-12 w-auto mx-auto rounded-xl" />
            </Link>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('auth.loginTitle')}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('auth.loginSubtitle')}</p>
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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

            <div>
              <div className="flex justify-between mb-2">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('auth.passwordLabel')}
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-400 font-medium">
                  {t('nav.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon icon="fluent:lock-closed-24-regular" className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${
                    isDark 
                      ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-primary-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="rememberMe" className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('auth.rememberMe')}
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {t('auth.submitLogin')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('auth.needAccount')} {' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium ml-1">
                {t('auth.submitRegister')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={authBg}
          alt="Authentication Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/50 to-transparent mix-blend-multiply"></div>
      </div>
    </div>
  );
};

export default LoginPage;
