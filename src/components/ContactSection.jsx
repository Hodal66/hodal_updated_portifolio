import { Icon } from '@iconify/react';
import React, { useState } from 'react';
import { config, contactItems } from '../data/config';
import { useIsLoaded } from '../hooks/usePortfolio';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const ContactForm = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('contact.required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.invalidEmail');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.required');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('contact.messageTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', formData);
      
      setSubmitStatus('success');
      setFormData({ fullName: '', email: '', message: '' });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitStatus(null);
    setErrors({});
  };

  if (submitStatus === 'success') {
    return (
      <div className={`p-8 sm:p-10 rounded-2xl text-center ${
        isDark
          ? 'bg-gradient-to-br from-green-500/10 to-primary-500/10 border border-green-500/20'
          : 'bg-gradient-to-br from-green-50 to-primary-50 border border-green-200'
      }`}>
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-primary-500 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('contact.successTitle')}
        </h3>
        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          {t('contact.successMessage')}
        </p>
        <button
          onClick={resetForm}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
        >
          {t('contact.sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
          {t('contact.fullName')} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder={t('contact.fullNamePlaceholder')}
          className={`w-full px-4 py-3 rounded-xl transition-all duration-300 outline-none ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500/50 focus:bg-white/10'
              : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:bg-white'
          } ${errors.fullName ? 'border-red-500/50' : ''}`}
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
          {t('contact.emailAddress')} <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t('contact.emailPlaceholder')}
          className={`w-full px-4 py-3 rounded-xl transition-all duration-300 outline-none ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500/50 focus:bg-white/10'
              : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:bg-white'
          } ${errors.email ? 'border-red-500/50' : ''}`}
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
      </div>
      {/* Message */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
          {t('contact.message')} <span className="text-red-400">*</span>
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          placeholder={t('contact.messagePlaceholder')}
          className={`w-full px-4 py-3 rounded-xl transition-all duration-300 outline-none resize-none ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500/50 focus:bg-white/10'
              : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:bg-white'
          } ${errors.message ? 'border-red-500/50' : ''}`}
        />
        {errors.message && <p className="mt-1 text-sm text-red-400">{errors.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
          isSubmitting
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary-500 to-cyan-500 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5'
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t('contact.sending')}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {t('contact.sendMessage')}
          </>
        )}
      </button>

      {submitStatus === 'error' && (
        <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
          <p className="text-red-400 text-center text-sm">{t('contact.errorMessage')}</p>
        </div>
      )}
    </form>
  );
};

const ContactSection = () => {
  const isLoaded = useIsLoaded();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <section className={`min-h-screen px-4 sm:px-6 pt-28 pb-16 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="section-subtitle">{t('contact.subtitle')}</span>
          <h2 className="section-title mt-2 mb-4">{t('contact.title')}</h2>
          <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{t('contact.description')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info Column */}
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {contactItems.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 p-5 rounded-xl group transition-all ${
                    isDark
                      ? 'bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-primary-500/30'
                      : 'bg-white border border-slate-200 shadow-sm hover:border-primary-500/50 hover:shadow-md'
                  }`}
                >
                  <span className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    <Icon icon={item.icon} className="w-8 h-8 text-primary-500" />
                  </span>
                  <div>
                    <span className={`text-sm block ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{item.label}</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className={`p-8 rounded-2xl text-center ${
              isDark
                ? 'bg-gradient-to-br from-primary-500/10 to-violet-500/10 border border-primary-500/20'
                : 'bg-gradient-to-br from-primary-500/10 to-violet-500/10 border border-primary-500/30'
            }`}>
              <span className={`text-sm block mb-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{t('Contact Number')}</span>
              <span className="block text-3xl sm:text-4xl font-black gradient-text mb-2">{t('Tel : +250 782 439 775')}</span>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className={`p-6 sm:p-8 rounded-2xl ${
            isDark
              ? 'bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5'
              : 'bg-white border border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('contact.formTitle')}
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              {t('contact.formDescription')}
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
