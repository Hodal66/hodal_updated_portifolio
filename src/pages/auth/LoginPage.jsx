import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '@iconify/react';
const logo = "https://res.cloudinary.com/dqd87p5cz/image/upload/v1774207737/HodalTechLogo_xrm8ah.png";

const LoginPage = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      // If account requires OTP verification, redirect to verification page
      if (err.requiresVerification) {
        navigate('/verify-otp', { state: { email: err.email } });
        return;
      }
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${
    isDark
      ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:bg-white/8'
      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary-500 focus:bg-white'
  }`;

  return (
    <>
      <div className="text-center mb-8">
        <Link to="/" className="inline-block mb-6" aria-label="Go to home">
          <img src={logo} alt="Hodaltech Logo" className="h-12 w-auto mx-auto rounded-xl" />
        </Link>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('auth.loginTitle')}
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <div role="alert" className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm flex items-center gap-2">
            <Icon icon="fluent:warning-24-filled" width="18" className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            {t('auth.emailLabel')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon icon="fluent:mail-24-regular" className="w-5 h-5" />
            </span>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="login-password" className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
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
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${inputClass} pr-11`}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Icon icon={showPassword ? 'fluent:eye-off-24-regular' : 'fluent:eye-24-regular'} className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="rememberMe" className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            {t('auth.rememberMe')}
          </label>
        </div>

        <button
          type="submit"
          id="login-submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </span>
          ) : t('auth.submitLogin')}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          {t('auth.needAccount')}{' '}
          <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium ml-1">
            {t('auth.submitRegister')}
          </Link>
        </p>
      </div>
    </>
  );
};

export default LoginPage;
