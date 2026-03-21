import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getMyMeetings, updateMeetingStatus, scheduleMeeting, getUsers } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardMeetings = () => {
  const { user } = useOutletContext();
  const { isDark } = useTheme();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('scheduled');

  // ─── Schedule Modal State ───
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participants: [],
  });
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const data = await getMyMeetings();
      setMeetings(data);
    } catch (err) {
      console.error('Failed to fetch meetings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateMeetingStatus(id, status);
      setMeetings(prev => prev.map(m => m._id === id ? { ...m, status } : m));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filteredMeetings = meetings.filter(m => {
    if (filter === 'scheduled') return ['scheduled', 'active'].includes(m.status);
    return m.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-slate-400 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  // ─── Schedule Meeting Logic ───
  const openScheduleModal = async () => {
    setShowScheduleModal(true);
    try {
      const data = await getUsers(100, 0);
      const usersList = data.results || data || [];
      setAllUsers(usersList.filter(u => u._id !== user._id));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleError('');
    if (!scheduleForm.title || !scheduleForm.startTime || !scheduleForm.endTime) {
      setScheduleError('Please fill in all required fields.');
      return;
    }
    if (new Date(scheduleForm.endTime) <= new Date(scheduleForm.startTime)) {
      setScheduleError('End time must be after start time.');
      return;
    }
    setScheduleLoading(true);
    try {
      const newMeeting = await scheduleMeeting({
        title: scheduleForm.title,
        description: scheduleForm.description,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        participants: scheduleForm.participants,
      });
      setMeetings(prev => [newMeeting, ...prev]);
      setShowScheduleModal(false);
      setScheduleForm({ title: '', description: '', startTime: '', endTime: '', participants: [] });
    } catch (err) {
      setScheduleError(err.message || 'Failed to schedule meeting.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const toggleParticipant = (userId) => {
    setScheduleForm(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId],
    }));
  };

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ─── Join Meeting in-app ───
  const handleJoinMeeting = (meeting) => {
    navigate(`/dashboard/meeting/${meeting.meetingId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        <p className="font-bold opacity-50 uppercase tracking-widest text-[10px]">Loading meetings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className={`text-5xl font-black tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Meetings</h1>
          <p className="font-bold opacity-50 uppercase tracking-[0.2em] text-[10px]">Secure communication & collaboration</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Schedule Button */}
          <button
            onClick={openScheduleModal}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-600 transition-all"
          >
            <Icon icon="fluent:calendar-add-24-filled" width="18" />
            Schedule
          </button>

          <div className={`p-1 rounded-2xl flex gap-1 ${isDark ? 'bg-white/5' : 'bg-slate-100 shadow-inner'}`}>
            {['scheduled', 'completed', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {filteredMeetings.length === 0 ? (
        <div className={`p-20 border-[3px] border-dashed rounded-[3rem] text-center flex flex-col items-center gap-6 transition-all ${
           isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'
        }`}>
           <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white shadow-xl'}`}>
              <Icon icon="fluent:calendar-cancel-24-filled" width="40" className="opacity-20" />
           </div>
           <div>
              <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No {filter} meetings</h3>
              <p className="max-w-xs mx-auto text-sm font-medium opacity-50 leading-relaxed">
                {filter === 'scheduled'
                  ? 'No upcoming meetings. Click "Schedule" to create one.'
                  : 'No meeting records for this filter.'}
              </p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMeetings.map((meeting) => (
              <motion.div
                key={meeting._id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`group relative p-8 rounded-[2.5rem] border shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] ${
                  isDark ? 'bg-slate-900 border-white/10 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-blue-500/20 shadow-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(meeting.status)} shadow-lg`}>
                      {meeting.status}
                   </div>
                   <div className="flex -space-x-3">
                      {meeting.participants?.map((p, idx) => (
                         <div key={idx} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center text-[10px] font-black shadow-lg ${
                            isDark ? 'bg-slate-800 border-slate-950' : 'bg-slate-100 border-white text-blue-500'
                         }`} title={p.name}>
                            {p.name?.[0]}
                         </div>
                      ))}
                   </div>
                </div>

                <h3 className={`text-xl font-black mb-3 line-clamp-2 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {meeting.title}
                </h3>
                
                <p className="text-sm font-medium opacity-50 mb-6 line-clamp-2 leading-relaxed h-10">
                  {meeting.description || 'Scheduled meeting session.'}
                </p>

                <div className={`p-5 rounded-3xl mb-8 flex flex-col gap-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                   <div className="flex items-center gap-3">
                      <Icon icon="fluent:calendar-24-regular" width="20" className="text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-wider">{new Date(meeting.startTime).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Icon icon="fluent:clock-24-regular" width="20" className="text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-wider">{new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Icon icon="fluent:people-24-regular" width="20" className="text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-wider">{(meeting.participants?.length || 0) + 1} participants</span>
                   </div>
                </div>

                <div className="flex gap-3">
                   {meeting.status === 'scheduled' || meeting.status === 'active' ? (
                      <>
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="flex-1 bg-blue-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Icon icon="fluent:video-24-filled" width="18" />
                          Join Meeting
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(meeting._id, 'cancelled')}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isDark ? 'border-white/10 text-red-400 hover:bg-red-400/10' : 'border-slate-200 text-slate-400 hover:bg-red-50/50 hover:text-red-500 hover:border-red-500/20'
                          }`}
                          title="Cancel Meeting"
                        >
                           <Icon icon="fluent:dismiss-24-filled" width="18" />
                        </button>
                      </>
                   ) : (
                      <button
                         disabled
                         className={`w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-30 cursor-not-allowed ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-500'}`}
                      >
                         {meeting.status === 'completed' ? 'Meeting Completed' : 'Meeting Cancelled'}
                      </button>
                   )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ─── SCHEDULE MEETING MODAL ─── */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowScheduleModal(false)} />

            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className={`relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-[2rem] border shadow-2xl p-8 ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Schedule Meeting</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Create a new meeting room</p>
                </div>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <Icon icon="fluent:dismiss-24-filled" width="20" className={isDark ? 'text-white/50' : 'text-slate-400'} />
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-5">
                {scheduleError && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                    {scheduleError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.title}
                    onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    placeholder="e.g. Sprint Review"
                    className={`w-full px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    Description
                  </label>
                  <textarea
                    value={scheduleForm.description}
                    onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    placeholder="Meeting agenda or notes..."
                    rows={3}
                    className={`w-full px-5 py-3.5 rounded-2xl border text-sm font-medium outline-none resize-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Date/Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleForm.startTime}
                      onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleForm.endTime}
                      onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Invite Participants */}
                <div>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    Invite Participants ({scheduleForm.participants.length} selected)
                  </label>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className={`w-full px-5 py-3 rounded-2xl border text-sm font-medium outline-none mb-3 transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar">
                    {filteredUsers.map(u => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => toggleParticipant(u._id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          scheduleForm.participants.includes(u._id)
                            ? 'bg-blue-500/20 border border-blue-500/30'
                            : isDark ? 'bg-white/5 hover:bg-white/8 border border-transparent' : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                          scheduleForm.participants.includes(u._id)
                            ? 'bg-blue-500 text-white'
                            : isDark ? 'bg-white/10 text-white/60' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {scheduleForm.participants.includes(u._id) ? (
                            <Icon icon="fluent:checkmark-24-filled" width="16" />
                          ) : (
                            u.name?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.name}</p>
                          <p className={`text-[10px] truncate ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{u.email}</p>
                        </div>
                      </button>
                    ))}
                    {filteredUsers.length === 0 && (
                      <p className="text-center text-sm opacity-40 py-4">No users found</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={scheduleLoading}
                  className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                >
                  {scheduleLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Icon icon="fluent:calendar-add-24-filled" width="18" />
                      Schedule Meeting
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardMeetings;
