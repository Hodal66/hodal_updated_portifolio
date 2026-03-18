import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateMe } from '../../services/api';

const DashboardSettings = () => {
  const { user } = useOutletContext();
  const { isDark, toggleTheme } = useTheme();
  const { updateUser } = useAuth();

  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateMe({ name: form.name });
      updateUser(updated);
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all text-sm ${
    isDark ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500' : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-primary-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="space-y-8 max-w-2xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-lg flex items-center gap-2 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          <Icon icon={toast.type === 'error' ? 'fluent:warning-24-filled' : 'fluent:checkmark-24-filled'} width="18" />
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account preferences</p>
      </div>

      {/* Profile Section */}
      <section className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span className="flex items-center gap-2">
            <Icon icon="fluent:person-24-regular" width="22" />
            Profile Information
          </span>
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="settings-name" className={labelClass}>Full Name</label>
            <input id="settings-name" name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="settings-email" className={labelClass}>Email Address</label>
            <input id="settings-email" name="email" value={form.email} className={`${inputClass} opacity-60 cursor-not-allowed`} disabled aria-disabled="true" />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed directly. Contact support.</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className={`w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center ${isDark ? 'text-primary-400' : 'text-primary-500'}`}>
              <Icon icon="fluent:person-24-regular" width="24" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} capitalize`}>{user?.roles?.[0]} account</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      {/* Appearance Section */}
      <section className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span className="flex items-center gap-2">
            <Icon icon="fluent:paint-brush-24-regular" width="22" />
            Appearance
          </span>
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Dark Mode</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Toggle between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none ${isDark ? 'bg-primary-500' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      {/* Account Info */}
      <section className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span className="flex items-center gap-2">
            <Icon icon="fluent:info-24-regular" width="22" />
            Account Details
          </span>
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Account ID', value: user?._id },
            { label: 'Role', value: user?.roles?.join(', ') },
            { label: 'Auth Provider', value: user?.provider || 'local' },
            { label: 'Email Verified', value: user?.isEmailVerified ? 'Yes ✓' : 'No ✗' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b last:border-0 border-white/5">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'} truncate max-w-xs`}>{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardSettings;
