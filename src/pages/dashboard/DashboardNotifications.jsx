import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from '../../contexts/ThemeContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api';

const ICONS = {
  newUser: { icon: 'fluent:person-add-24-regular', color: 'text-primary-500 bg-primary-500/10' },
  broadcast: { icon: 'fluent:megaphone-24-regular', color: 'text-amber-500 bg-amber-500/10' },
  system: { icon: 'fluent:settings-24-regular', color: 'text-slate-400 bg-white/5' },
};

const DashboardNotifications = () => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getNotifications()
      .then((data) => {
        setNotifications(data?.notifications || []);
        setUnreadCount(data?.unreadCount || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkOne = async (id) => {
    await markNotificationRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-xl font-semibold text-sm transition-all"
          >
            <Icon icon="fluent:checkmark-24-regular" width="18" />
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">{error}</div>
      )}

      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`p-4 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-slate-100'} animate-pulse`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded w-1/3 bg-white/10" />
                  <div className="h-3 rounded w-2/3 bg-white/5" />
                </div>
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
            <Icon icon="fluent:alert-off-24-regular" width="56" className="text-slate-400 mb-4 opacity-40" />
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No notifications yet</p>
          </div>
        ) : notifications.map((n) => {
          const iconConfig = ICONS[n.type] || ICONS.system;
          return (
            <div
              key={n._id}
              className={`flex items-start gap-4 p-4 border-b last:border-0 transition-colors cursor-pointer ${
                isDark ? 'border-white/5' : 'border-slate-100'
              } ${!n.isRead
                ? isDark ? 'bg-primary-500/5 hover:bg-primary-500/10' : 'bg-primary-50 hover:bg-primary-100/50'
                : isDark ? 'bg-slate-900 hover:bg-white/5' : 'bg-white hover:bg-slate-50'
              }`}
              onClick={() => !n.isRead && handleMarkOne(n._id)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconConfig.color}`}>
                <Icon icon={iconConfig.icon} width="20" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{n.title}</p>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} line-clamp-2`}>{n.message}</p>
                <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleMarkOne(n._id); }}
                  aria-label="Mark as read"
                  className="p-2 rounded-lg hover:bg-primary-500/10 text-slate-400 hover:text-primary-500 transition-colors flex-shrink-0"
                >
                  <Icon icon="fluent:checkmark-24-regular" width="16" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardNotifications;
