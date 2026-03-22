import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '../components';
import authBg from '../assets/auth-side-logo.png';

const AuthLayout = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-dark-950' : 'bg-slate-50'}`}>
      {/* Left Side - Form Container */}
      <div className={`flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 relative ${isDark ? 'bg-dark-950' : 'bg-white'} overflow-hidden`}>
        
        {/* Back to Home Button (Shared) */}
        <Link 
          to="/" 
          className={`absolute top-8 left-8 flex items-center gap-2 text-sm font-medium transition-colors z-10 ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Icon icon="fluent:arrow-left-24-regular" className="w-5 h-5" />
          {t('auth.backToHome')}
        </Link>
        
        {/* Animated Outlet */}
        <div className="mx-auto w-full max-w-sm lg:w-96 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.8 }}
          className="absolute inset-0 h-full w-full"
        >
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={authBg}
            alt="Authentication Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/50 to-transparent mix-blend-multiply"></div>
          
          {/* Optional: Add some floating elements or overlay text here if desired */}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
