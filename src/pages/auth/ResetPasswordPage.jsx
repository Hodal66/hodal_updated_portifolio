import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '@iconify/react';
import logo from '../../assets/HodalTechLogo.png';
import { resetPasswordUser } from '../../services/api';

const ResetPasswordPage = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Get reset token and email from navigation state (from OTP verification)
  const resetToken = location.state?.resetToken || '';
  const email = location.state?.email || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength meter
  const passwordStrength = useMemo(() => {
    const pw = password;
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
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!resetToken || !email) {
      setError('Reset session is invalid. Please start the reset process again.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must include an uppercase letter, lowercase letter, and a number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordUser(email, resetToken, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Password reset failed. The session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-11 pr-11 py-3 rounded-xl outline-none transition-all ${
    isDark
      ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500'
      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary-500'
  }`;

  if (success) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Icon icon="fluent:checkmark-circle-24-filled" width="48" className="text-emerald-500" />
        </div>
        <h1 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Password Reset! 🎉
        </h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          Your password has been reset successfully. Redirecting to login...
        </p>
        <div className="flex justify-center mb-4">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium text-sm">
          Go to Login →
        </Link>
      </div>
    );
  }

  // If no token, show error state
  if (!resetToken || !email) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <Icon icon="fluent:warning-24-filled" width="36" className="text-red-500" />
        </div>
        <h1 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Invalid Reset Session
        </h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          Your password reset session is invalid or expired. Please start the process again.
        </p>
        <Link
          to="/forgot-password"
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg transition-all hover:-translate-y-0.5"
        >
          Start Over
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link to="/" className="inline-block mb-6">
          <img src={logo} alt="Logo" className="h-12 w-auto mx-auto rounded-xl" />
        </Link>
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
          <Icon icon="fluent:lock-open-24-filled" width="36" className="text-primary-500" />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Set New Password
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          Create a strong new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div role="alert" className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm flex items-center gap-2">
            <Icon icon="fluent:warning-24-filled" width="18" className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label htmlFor="reset-password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            New Password
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon icon="fluent:lock-closed-24-regular" className="w-5 h-5" />
            </span>
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Min 8 chars, uppercase + number"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Icon icon={showPassword ? 'fluent:eye-off-24-regular' : 'fluent:eye-24-regular'} className="w-5 h-5" />
            </button>
          </div>
          {/* Password Strength Indicator */}
          {password && (
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
        </div>

        <div>
          <label htmlFor="reset-confirm" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            Confirm New Password
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon icon="fluent:lock-closed-key-24-regular" className="w-5 h-5" />
            </span>
            <input
              id="reset-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>
          {/* Match indicator */}
          {confirmPassword && (
            <div className="flex items-center gap-1 mt-1">
              <Icon
                icon={password === confirmPassword ? 'fluent:checkmark-12-filled' : 'fluent:dismiss-12-filled'}
                className={`w-3 h-3 ${password === confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}
              />
              <span className={`text-xs ${password === confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Resetting Password...
            </span>
          ) : 'Reset Password'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/login" className={`text-sm font-medium flex items-center justify-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
          <Icon icon="fluent:arrow-left-24-regular" className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </>
  );
};

export default ResetPasswordPage;
