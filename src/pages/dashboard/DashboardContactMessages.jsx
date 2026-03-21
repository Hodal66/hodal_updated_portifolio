import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getAdminContactMessages, updateContactStatus } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardContactMessages = () => {
  const { user } = useOutletContext();
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getAdminContactMessages(20, 0, statusFilter);
      setMessages(data.messages);
      if (data.messages.length > 0 && !activeMessage) {
        setActiveMessage(data.messages[0]);
      }
    } catch (err) {
      console.error('Failed to fetch contact messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updated = await updateContactStatus(id, newStatus);
      setMessages(messages.map(m => m._id === id ? updated : m));
      setActiveMessage(updated);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading && messages.length === 0) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;

  return (
    <div className={`flex flex-col h-[calc(100vh-12rem)] rounded-2xl overflow-hidden border ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white border-slate-200'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} flex items-center justify-between`}>
        <h2 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Contact Inquiries</h2>
        <div className="flex gap-2">
          {['', 'unread', 'read', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === status 
                  ? 'bg-primary-500 text-white' 
                  : (isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages List Area */}
        <div className={`w-1/3 border-r overflow-y-auto ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {messages.length === 0 ? (
            <p className="p-8 text-sm text-slate-500 text-center">No inquiries found</p>
          ) : (
            messages.map((msg) => (
              <button
                key={msg._id}
                onClick={() => setActiveMessage(msg)}
                className={`w-full p-5 text-left transition-all border-b ${
                  isDark ? 'border-white/5' : 'border-slate-100'
                } ${activeMessage?._id === msg._id 
                  ? (isDark ? 'bg-primary-500/20' : 'bg-primary-50') 
                  : (isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50')}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold truncate pr-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {msg.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                    msg.status === 'unread' ? 'bg-red-500/20 text-red-500' : 'bg-slate-500/20 text-slate-500'
                  }`}>
                    {msg.status}
                  </span>
                </div>
                <p className={`text-xs truncate mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{msg.email}</p>
                <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
              </button>
            ))
          )}
        </div>

        {/* Message Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {activeMessage ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMessage._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {activeMessage.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                      {activeMessage.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {activeMessage.status === 'unread' && (
                      <button 
                        onClick={() => handleStatusUpdate(activeMessage._id, 'read')}
                        className="p-2 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                        title="Mark as Read"
                      >
                        <Icon icon="fluent:checkmark-24-regular" width="20" />
                      </button>
                    )}
                    <button 
                       onClick={() => handleStatusUpdate(activeMessage._id, 'archived')}
                       className="p-2 rounded-xl bg-slate-500/10 text-slate-500 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                       title="Archive"
                    >
                      <Icon icon="fluent:archive-24-regular" width="20" />
                    </button>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl mb-8 ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-700'} leading-relaxed`}>
                  <p className="whitespace-pre-wrap">{activeMessage.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-5 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                    <span className="text-xs text-slate-500 block mb-1">Subject</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {activeMessage.subject || 'Website Inquiry'}
                    </span>
                  </div>
                  <div className={`p-5 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                    <span className="text-xs text-slate-500 block mb-1">Sent At</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {new Date(activeMessage.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
              <Icon icon="fluent:mail-read-24-regular" width="64" />
              <p className="mt-4 font-medium">Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContactMessages;
