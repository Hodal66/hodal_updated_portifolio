import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { resendOtp } from '../../services/api';
import { Icon } from '@iconify/react';
import logo from '../../assets/HodalTechLogo.png';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

const OtpVerificationPage = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { verifyOtp, pendingEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from auth context or route state
  const email = pendingEmail || location.state?.email || '';

  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  const inputRefs = useRef([]);

  // Redirect if no email, and handle devOtp auto-fill
  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Dev optimization: if devOtp is passed in navigation state, pre-fill it
    if (location.state?.devOtp && /^\d{6}$/.test(location.state.devOtp)) {
      setOtpValues(location.state.devOtp.split(''));
    }
  }, [email, navigate, location.state]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);
    setError(null);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpValues(digits);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const otpCode = otpValues.join('');
  const isComplete = otpCode.length === OTP_LENGTH;

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!isComplete || loading) return;

    setLoading(true);
    setError(null);
    try {
      await verifyOtp(email, otpCode);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      // Clear OTP on failure
      setOtpValues(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [isComplete, loading, email, otpCode, verifyOtp, navigate]);

  // Auto-submit when all digits entered
  useEffect(() => {
    if (isComplete && !loading && !success) {
      handleSubmit();
    }
  }, [isComplete, loading, success, handleSubmit]);

  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    setResendMessage(null);
    setError(null);
    try {
      await resendOtp(email, 'emailVerification');
      setResendMessage('A new verification code has been sent to your email.');
      setResendTimer(RESEND_COOLDOWN_SECONDS);
      setOtpValues(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Icon icon="fluent:checkmark-circle-24-filled" width="48" className="text-emerald-500" />
        </div>
        <h1 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Email Verified! 🎉
        </h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          Your account is now active. Redirecting to dashboard...
        </p>
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link to="/" className="inline-block mb-6" aria-label="Go to home">
          <img src={logo} alt="Hodaltech Logo" className="h-12 w-auto mx-auto rounded-xl" />
        </Link>
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
          <Icon icon="fluent:mail-checkmark-24-filled" width="36" className="text-primary-500" />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Verify Your Email
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          We've sent a 6-digit verification code to
        </p>
        <p className="text-primary-500 font-medium text-sm mt-1">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <div role="alert" className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm flex items-center gap-2">
            <Icon icon="fluent:warning-24-filled" width="18" className="flex-shrink-0" />
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm flex items-center gap-2">
            <Icon icon="fluent:checkmark-circle-24-filled" width="18" className="flex-shrink-0" />
            {resendMessage}
          </div>
        )}

        {/* OTP Input Fields */}
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {otpValues.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all duration-200 ${
                digit
                  ? 'border-2 border-primary-500 shadow-lg shadow-primary-500/20'
                  : isDark
                    ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary-500'
              } ${isDark ? 'text-white' : 'text-slate-900'}`}
              autoFocus={index === 0}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Expiry info */}
        <p className={`text-center text-xs ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
          Code expires in 5 minutes
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          id="verify-otp-submit"
          disabled={!isComplete || loading}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying...
            </span>
          ) : 'Verify Email'}
        </button>

        {/* Resend */}
        <div className="text-center">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || resendLoading}
            className={`mt-2 text-sm font-medium transition-colors ${
              resendTimer > 0 || resendLoading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-primary-500 hover:text-primary-400 cursor-pointer'
            }`}
          >
            {resendLoading
              ? 'Sending...'
              : resendTimer > 0
                ? `Resend code in ${formatTime(resendTimer)}`
                : 'Resend Code'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/register"
          className={`text-sm font-medium flex items-center justify-center gap-2 ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Icon icon="fluent:arrow-left-24-regular" className="w-4 h-4" />
          Back to Registration
        </Link>
      </div>
    </>
  );
};

export default OtpVerificationPage;
