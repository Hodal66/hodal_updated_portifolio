import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { getDashboardStats, getActivityLogs } from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

const StatCard = ({ title, value, icon, trend, loading }) => {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
    } hover:shadow-xl hover:shadow-primary-500/5`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isDark ? 'bg-primary-500/10 text-primary-400' : 'bg-primary-50 text-primary-500'
        }`}>
          <Icon icon={icon} width="24" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
            trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
      {loading ? (
        <div className="h-8 w-24 rounded-lg bg-white/10 animate-pulse" />
      ) : (
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
      )}
    </div>
  );
};

// Placeholder weekly data for chart — replace with real analytics endpoint when available
const weeklyData = [
  { name: 'Mon', users: 0, value: 0 },
  { name: 'Tue', users: 0, value: 0 },
  { name: 'Wed', users: 0, value: 0 },
  { name: 'Thu', users: 0, value: 0 },
  { name: 'Fri', users: 0, value: 0 },
  { name: 'Sat', users: 0, value: 0 },
  { name: 'Sun', users: 0, value: 0 },
];

const DashboardOverview = () => {
  const { user } = useOutletContext();
  const { isDark } = useTheme();
  const isAdmin = user?.roles?.includes('admin');

  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const [statsData, activityData] = await Promise.all([
            getDashboardStats(),
            getActivityLogs(5),
          ]);
          setStats(statsData);
          setActivities(activityData || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const statCards = isAdmin ? [
    { title: 'Total Users', value: stats?.totalUsers ?? '—', icon: 'fluent:people-24-regular' },
    { title: 'New Today', value: stats?.newUsersToday ?? '—', icon: 'fluent:person-add-24-regular' },
    { title: 'Total Projects', value: stats?.totalProjects ?? '—', icon: 'fluent:briefcase-24-regular' },
    { title: 'Unread Alerts', value: stats?.totalNotifications ?? '—', icon: 'fluent:alert-24-regular' },
  ] : [
    { title: 'Your Projects', value: '—', icon: 'fluent:briefcase-24-regular' },
    { title: 'Messages', value: '—', icon: 'fluent:chat-24-regular' },
    { title: 'Files', value: '—', icon: 'fluent:folder-24-regular' },
    { title: 'Notifications', value: stats?.totalNotifications ?? '—', icon: 'fluent:alert-24-regular' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isAdmin ? "Here's what's happening across the platform." : "Here's an overview of your activity."}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center gap-2">
          <Icon icon="fluent:warning-24-filled" width="20" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} isDark={isDark} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Growth</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <Icon icon="fluent:timeline-24-regular" width="40" className="mb-2 opacity-40" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((log) => (
                <div key={log._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon icon="fluent:person-24-regular" width="16" className="text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {log.user?.name || 'Unknown'} — {log.action}
                    </p>
                    <p className="text-xs text-slate-500">{log.module}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
