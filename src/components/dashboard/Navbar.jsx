import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api';

const Navbar = ({ user }) => {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    getNotifications()
      .then((data) => {
        setNotifications(data?.notifications || []);
        setUnreadCount(data?.unreadCount || 0);
      })
      .catch(() => {}); // silent fail for UI
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkOneRead = async (id) => {
    await markNotificationRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <header className={`h-16 sticky top-0 border-b z-30 transition-colors backdrop-blur-lg ${
      isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-slate-200'
    } px-8 flex items-center justify-between`}>
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Icon icon="fluent:search-24-regular" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" width="20" />
          <input
            type="text"
            placeholder="Search operations, users, projects..."
            aria-label="Search dashboard"
            className={`w-full pl-12 pr-4 py-2 rounded-xl outline-none transition-all ${
              isDark ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500' : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary-500'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`p-2.5 rounded-xl hover:bg-primary-500/10 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
        >
          <Icon icon={isDark ? 'fluent:weather-sunny-24-regular' : 'fluent:weather-moon-16-regular'} width="24" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            aria-label={`Notifications (${unreadCount} unread)`}
            className={`p-2.5 rounded-xl hover:bg-primary-500/10 transition-colors relative ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <Icon icon="fluent:alert-24-regular" width="24" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                  isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-primary-500 hover:underline font-medium">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className={`p-4 text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <button
                        key={n._id}
                        onClick={() => handleMarkOneRead(n._id)}
                        className={`w-full text-left px-4 py-3 border-b last:border-0 transition-colors ${
                          !n.isRead
                            ? isDark ? 'bg-primary-500/5 border-white/5' : 'bg-primary-50 border-slate-100'
                            : isDark ? 'border-white/5' : 'border-slate-100'
                        } hover:bg-primary-500/10`}
                      >
                        <p className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{n.title}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} line-clamp-2`}>{n.message}</p>
                        {!n.isRead && <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-primary-500" />}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            aria-label="User profile menu"
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-primary-500/10 transition-all ml-2"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary-500/20 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Icon icon="fluent:person-24-regular" width="24" className="text-primary-500" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'User'}</p>
              <p className={`text-[10px] font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.roles?.[0] || 'User'}</p>
            </div>
            <Icon icon="fluent:chevron-down-24-regular" className={`transition-transform duration-300 ${isDark ? 'text-slate-400' : 'text-slate-500'} ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className={`absolute right-0 mt-2 w-52 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                  isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className={`p-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => navigate('/dashboard/settings')}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <Icon icon="fluent:settings-24-regular" width="18" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                  >
                    <Icon icon="fluent:sign-out-24-regular" width="18" />
                    {loggingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
