import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

const Sidebar = ({ isDark, userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: 'fluent:grid-24-regular', roles: ['user', 'admin'] },
    { name: 'Users', path: '/dashboard/users', icon: 'fluent:people-24-regular', roles: ['admin'] },
    { name: 'Analytics', path: '/dashboard/analytics', icon: 'fluent:chart-area-24-regular', roles: ['admin'] },
    { name: 'Projects', path: '/dashboard/projects', icon: 'fluent:briefcase-24-regular', roles: ['user', 'admin'] },
    { name: 'Messages', path: '/dashboard/messages', icon: 'fluent:chat-24-regular', roles: ['user', 'admin'] },
    { name: 'Files', path: '/dashboard/files', icon: 'fluent:folder-24-regular', roles: ['user', 'admin'] },
    { name: 'Settings', path: '/dashboard/settings', icon: 'fluent:settings-24-regular', roles: ['user', 'admin'] },
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
      <div className="p-6 flex items-center justify-between overflow-hidden">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white">
              <Icon icon="fluent:flash-24-filled" width="20" />
            </div>
            <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>HodalTech</span>
          </motion.div>
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
                    {item.name}
                  </motion.span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="p-6 border-t border-white/10 mx-4 mb-4">
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className={`text-xs font-semibold uppercase mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Pro Plan</p>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>92% Usage</span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Update soon</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 w-[92%]" />
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
