import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTheme } from '../../contexts/ThemeContext';
import { getUsers, deleteUserAPI, updateUserRole } from '../../services/api';

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  Inactive: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
  Pending: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
};

const ConfirmModal = ({ user, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
        <Icon icon="fluent:delete-24-regular" width="24" className="text-rose-400" />
      </div>
      <h3 className="text-lg font-bold text-white text-center mb-2">Delete User?</h3>
      <p className="text-slate-400 text-sm text-center mb-6">
        Are you sure you want to delete <strong className="text-white">{user?.name}</strong>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all text-sm">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition-all text-sm">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const DashboardUsers = () => {
  const { user } = useOutletContext();
  const { isDark } = useTheme();
  const isAdmin = user?.roles?.includes('admin');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data?.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) fetchUsers(); }, [isAdmin]);

  const handleToggleRole = async (u) => {
    setActionLoading(u._id);
    const newRoles = u.roles?.includes('admin') ? ['user'] : ['admin'];
    try {
      await updateUserRole(u._id, newRoles);
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, roles: newRoles } : x));
      showToast(`Role updated for ${u.name}`);
    } catch (err) {
      showToast(err.message || 'Failed to update role', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget._id);
    try {
      await deleteUserAPI(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      showToast(`${deleteTarget.name} has been deleted`);
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteTarget(null);
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Icon icon="fluent:lock-closed-24-regular" width="60" className="text-rose-400 mb-4" />
        <h2 className="text-2xl font-bold dark:text-white">Access Restricted</h2>
        <p className="text-slate-500 max-w-md mt-2">You don't have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-lg flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
        }`}>
          <Icon icon={toast.type === 'error' ? 'fluent:warning-24-filled' : 'fluent:checkmark-24-filled'} width="18" />
          {toast.message}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal user={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">{loading ? 'Loading...' : `${users.length} registered users`}</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition-all text-sm">
          <Icon icon="fluent:arrow-sync-24-regular" width="18" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">{error}</div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
        <table className="w-full text-left bg-white dark:bg-white/5 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 uppercase tracking-wider text-[11px] font-bold text-slate-500">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Verified</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 rounded-lg bg-white/5 animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">No users found</td>
              </tr>
            ) : users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-sm">
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase ${
                    u.roles?.includes('admin') ? 'bg-violet-500/10 text-violet-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                  }`}>
                    {u.roles?.[0] || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Icon
                    icon={u.isEmailVerified ? 'fluent:checkmark-circle-24-filled' : 'fluent:dismiss-circle-24-regular'}
                    width="20"
                    className={u.isEmailVerified ? 'text-emerald-500' : 'text-slate-400'}
                  />
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleToggleRole(u)}
                      disabled={actionLoading === u._id || u._id === user._id}
                      aria-label={`Toggle role for ${u.name}`}
                      title={u.roles?.includes('admin') ? 'Demote to User' : 'Promote to Admin'}
                      className="p-2 rounded-lg hover:bg-violet-500/10 text-slate-400 hover:text-violet-500 transition-colors disabled:opacity-30"
                    >
                      <Icon icon="fluent:shield-person-24-regular" width="20" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      disabled={actionLoading === u._id || u._id === user._id}
                      aria-label={`Delete ${u.name}`}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-30"
                    >
                      <Icon icon="fluent:delete-24-regular" width="20" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardUsers;
