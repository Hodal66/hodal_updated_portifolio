import React from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const weeklyData = [
  { name: 'Mon', users: 12, projects: 3 },
  { name: 'Tue', users: 19, projects: 5 },
  { name: 'Wed', users: 8, projects: 2 },
  { name: 'Thu', users: 25, projects: 7 },
  { name: 'Fri', users: 31, projects: 9 },
  { name: 'Sat', users: 14, projects: 4 },
  { name: 'Sun', users: 22, projects: 6 },
];

const roleData = [
  { name: 'Users', value: 85 },
  { name: 'Admins', value: 15 },
];

const COLORS = ['#3b82f6', '#8b5cf6'];

const Card = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} ${className}`}>
      {children}
    </div>
  );
};

const DashboardAnalytics = () => {
  const { isDark } = useTheme();
  const tooltipStyle = { backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' };
  const tickStyle = { fill: '#94a3b8', fontSize: 12 };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Platform performance overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth */}
        <Card>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Weekly User Activity</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} />
                <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#grad1)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Project Creation */}
        <Card>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Projects Created (Weekly)</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} />
                <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="projects" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Role Distribution */}
        <Card>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>User Role Distribution</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                  {roleData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Key Metrics */}
        <Card>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Key Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Avg. Session Duration', value: '4m 32s', icon: 'fluent:clock-24-regular', color: 'text-blue-400' },
              { label: 'Bounce Rate', value: '34.2%', icon: 'fluent:arrow-exit-24-regular', color: 'text-amber-400' },
              { label: 'Page Views / User', value: '7.4', icon: 'fluent:eye-24-regular', color: 'text-violet-400' },
              { label: 'New vs Returning', value: '68% / 32%', icon: 'fluent:people-swap-24-regular', color: 'text-emerald-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>
                    <Icon icon={icon} width="18" />
                  </div>
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
