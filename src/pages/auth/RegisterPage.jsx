import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '@iconify/react';
import logo from '../../assets/HodalTechLogo.png';

const RegisterPage = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ────────────── Password Strength Meter ──────────────
  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 5) return { score: 3, label: 'Good', color: 'bg-emerald-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name || formData.name.length < 2) errors.name = 'Name must be at least 2 characters';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password || formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(formData.password)) errors.password = 'Must include an uppercase letter';
    else if (!/[a-z]/.test(formData.password)) errors.password = 'Must include a lowercase letter';
    else if (!/[0-9]/.test(formData.password)) errors.password = 'Must include a number';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const data = await register(formData.name, formData.email, formData.password, formData.confirmPassword);
      // Redirect to OTP verification page
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => `w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all ${
    fieldErrors[field]
      ? 'border border-red-400 bg-red-50 dark:bg-red-500/10 text-slate-900 dark:text-white'
      : isDark
        ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500'
        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary-500'
  }`;

  return (
    <>
      <div className="text-center mb-8">
        <Link to="/" className="inline-block mb-6" aria-label="Go to home">
          <img src={logo} alt="Hodaltech Logo" className="h-12 w-auto mx-auto rounded-xl" />
        </Link>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('auth.registerTitle')}
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          {t('auth.registerSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div role="alert" className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm flex items-center gap-2">
            <Icon icon="fluent:warning-24-filled" width="18" className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label htmlFor="reg-name" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            {t('auth.fullNameLabel')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon icon="fluent:person-24-regular" className="w-5 h-5" />
            </span>
            <input
              id="reg-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass('name')}
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>
          {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            {t('auth.emailLabel')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon icon="fluent:mail-24-regular" className="w-5 h-5" />
            </span>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass('email')}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            {t('auth.passwordLabel')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon icon="fluent:lock-closed-24-regular" className="w-5 h-5" />
            </span>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${inputClass('password')} pr-11`}
              placeholder="Min 8 chars, uppercase + number"
              autoComplete="new-password"
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
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1.5 mb-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      level <= passwordStrength.score
                        ? passwordStrength.color
                        : isDark ? 'bg-white/10' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                passwordStrength.score <= 1 ? 'text-red-500' :
                passwordStrength.score <= 2 ? 'text-amber-500' :
                'text-emerald-500'
              }`}>
                {passwordStrength.label}
              </p>
            </div>
          )}
          {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="reg-confirm" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            {t('auth.confirmPasswordLabel')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon icon="fluent:lock-closed-key-24-regular" className="w-5 h-5" />
            </span>
            <input
              id="reg-confirm"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputClass('confirmPassword')}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          {/* Match indicator */}
          {formData.confirmPassword && (
            <div className="flex items-center gap-1 mt-1">
              <Icon
                icon={formData.password === formData.confirmPassword ? 'fluent:checkmark-12-filled' : 'fluent:dismiss-12-filled'}
                className={`w-3 h-3 ${formData.password === formData.confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}
              />
              <span className={`text-xs ${formData.password === formData.confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </span>
            </div>
          )}
          {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          id="register-submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-0.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : t('auth.submitRegister')}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium ml-1">
            {t('auth.submitLogin')}
          </Link>
        </p>
      </div>
    </>
  );
};

export default RegisterPage;
