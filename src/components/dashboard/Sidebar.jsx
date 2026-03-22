import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
const logo = "https://res.cloudinary.com/dqd87p5cz/image/upload/v1774207737/HodalTechLogo_xrm8ah.png";

const Sidebar = ({ isDark, userRole }) => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { key: 'backToWebsite', path: '/', icon: 'fluent:home-24-regular', roles: ['user', 'admin'] },
    { key: 'overview', path: '/dashboard', icon: 'fluent:grid-24-regular', roles: ['user', 'admin'] },
    { key: 'users', path: '/dashboard/users', icon: 'fluent:people-24-regular', roles: ['admin'] },
    { key: 'analytics', path: '/dashboard/analytics', icon: 'fluent:chart-area-24-regular', roles: ['admin'] },
    { key: 'projects', path: '/dashboard/projects', icon: 'fluent:briefcase-24-regular', roles: ['user', 'admin'] },
    { key: 'messages', path: '/dashboard/messages', icon: 'fluent:chat-24-regular', roles: ['user', 'admin'] },
    { key: 'meetings', path: '/dashboard/meetings', icon: 'fluent:video-24-regular', roles: ['user', 'admin'] },
    { key: 'contactMessages', path: '/dashboard/contact-messages', icon: 'fluent:mail-24-regular', roles: ['admin'] },
    { key: 'files', path: '/dashboard/files', icon: 'fluent:folder-24-regular', roles: ['user', 'admin'] },
    { key: 'settings', path: '/dashboard/settings', icon: 'fluent:settings-24-regular', roles: ['user', 'admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className={`h-screen sticky top-0 border-r transition-colors ${
        isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
      } flex flex-col`}
    >
      <div className="p-3 flex items-center justify-between overflow-hidden">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-4 group">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                <img src={logo} alt="HodalTech" className="w-full h-full object-contain" />
              </div>
              <span className={`font-black text-2xl tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-primary-500 transition-colors`}>HodalTech</span>
            </motion.div>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-primary-500/10 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <Icon icon={isCollapsed ? 'fluent:navigation-24-regular' : 'fluent:chevron-left-24-regular'} width="20" />
        </button>
      </div>

      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : isDark 
                      ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                      : 'text-slate-600 hover:text-primary-500 hover:bg-slate-50'
                }`}
              >
                <Icon icon={item.icon} width="24" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {t('nav.' + item.key)}
                  </motion.span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </motion.aside>
  );
};

export default Sidebar;
