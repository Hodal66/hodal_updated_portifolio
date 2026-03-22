import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const IncomingCallModal = () => {
  const socket = useSocket();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null); // { caller, type, callId }
  const [ringingAudio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

  useEffect(() => {
    if (socket) {
      socket.on('incoming-call', (data) => {
        setIncomingCall(data);
        ringingAudio.loop = true;
        ringingAudio.play().catch(e => console.log('Audio play failed', e));
      });

      return () => {
        socket.off('incoming-call');
        ringingAudio.pause();
      };
    }
  }, [socket, ringingAudio]);

  const handleAccept = () => {
    ringingAudio.pause();
    // Redirect to a meeting room with the callId or a new meetingId
    // For now, let's assume we use the callId as the meetingId for the "room"
    navigate(`/dashboard/meeting/${incomingCall.callId}`);
    setIncomingCall(null);
  };

  const handleDecline = () => {
    ringingAudio.pause();
    // Optional: emit 'call-rejected' back to sender
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="fixed bottom-8 right-8 z-[100] w-full max-w-sm"
      >
        <div className={`p-6 rounded-[2.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] border-4 ${
          isDark ? 'bg-slate-900 border-primary-500/30' : 'bg-white border-primary-500/20'
        }`}>
          <div className="flex flex-col items-center gap-6 text-center">
             <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-primary-500/10 flex items-center justify-center border-4 border-primary-500 animate-pulse">
                   {incomingCall.caller?.avatar ? (
                     <img src={incomingCall.caller.avatar} className="w-full h-full object-cover rounded-[1.75rem]" />
                   ) : (
                     <span className="text-3xl font-black text-primary-500">{incomingCall.caller?.name?.[0]}</span>
                   )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-inherit">
                   <Icon icon={incomingCall.type === 'video' ? 'fluent:video-24-filled' : 'fluent:call-24-filled'} width="20" />
                </div>
             </div>

             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-1">Incoming {incomingCall.type} Call</p>
                <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {incomingCall.caller?.name || 'Unknown User'}
                </h3>
             </div>

             <div className="flex gap-4 w-full">
                <button 
                  onClick={handleDecline}
                  className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95"
                >
                  Decline
                </button>
                <button 
                  onClick={handleAccept}
                  className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icon icon="fluent:call-24-filled" width="20" />
                  Accept
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallModal;
