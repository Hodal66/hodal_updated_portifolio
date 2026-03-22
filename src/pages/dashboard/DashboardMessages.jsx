import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { 
  getInboxes, 
  getConversationDetails, 
  sendNewMessage, 
  markConversationAsRead,
  startConversation,
  getUsers,
  uploadFile,
  scheduleMeeting,
  startCall
} from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';

const DashboardMessages = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const { isDark } = useTheme();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(null); // { userId, conversationId }
  const [attachments, setAttachments] = useState([]); // Array of file background objects
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingData, setMeetingData] = useState({ title: '', description: '', startTime: '', duration: 30 });
  
  // NEW STATES
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [previewImage, setPreviewImage] = useState(null); // For Lightbox
  const [dragActive, setDragActive] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    fetchInboxes();
  }, []);

  const fetchInboxes = async () => {
    try {
      const data = await getInboxes();
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
        handleSelectConversation(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch inboxes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conv) => {
    setActiveConversation(conv);
    setLoading(true);
    setMessages([]);
    try {
      const { messages: msgData } = await getConversationDetails(conv._id);
      setMessages(msgData.reverse());
      
      if (conv.lastMessage && conv.lastMessage.sender !== user._id && !conv.lastMessage.isRead) {
        await markConversationAsRead(conv._id);
        setConversations(prev => prev.map(c => 
          c._id === conv._id ? { ...c, lastMessage: { ...c.lastMessage, isRead: true } } : c
        ));
      }
      
      setTimeout(() => scrollToBottom('auto'), 100);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('message', (data) => {
        if (data.type === 'status_update') {
          setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, status: data.status } : m));
          return;
        }

        if (activeConversation?._id === data.conversationId) {
          setMessages((prev) => [...prev, data]);
          markConversationAsRead(data.conversationId);
          setRemoteTyping(null);
        }

        setConversations(prev => {
          const exists = prev.find(c => c._id === data.conversationId);
          if (exists) {
            return prev.map(c => 
              c._id === data.conversationId 
                ? { ...c, lastMessage: data, updatedAt: new Date().toISOString() }
                : c
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          } else {
            fetchInboxes();
            return prev;
          }
        });
      });

      socket.on('messages-read', (data) => {
        if (activeConversation?._id === data.conversationId) {
          setMessages(prev => prev.map(m => 
            (m.sender === user._id || m.sender?._id === user._id) ? { ...m, status: 'read', isRead: true } : m
          ));
        }
      });

      socket.on('typing', (data) => {
        if (activeConversation?._id === data.conversationId && data.userId !== user._id) {
          setRemoteTyping(data);
        }
      });

      socket.on('stop-typing', (data) => {
        if (activeConversation?._id === data.conversationId) {
          setRemoteTyping(null);
        }
      });

      return () => {
        socket.off('message');
        socket.off('messages-read');
        socket.off('typing');
        socket.off('stop-typing');
      };
    }
  }, [socket, activeConversation, user._id]);

  useEffect(scrollToBottom, [messages, remoteTyping]);

  const handleSearchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUserSearchResults([]);
      return;
    }
    try {
      const { users } = await getUsers(10, 0, query);
      // Filter out self
      setUserSearchResults(users.filter(u => u._id !== user._id));
    } catch (err) {
      console.error('Failed to search users', err);
    }
  };

  const handleStartNewChat = async (recipientId = null) => {
    try {
      // If no ID, admin will try to start a conversation with the primary user (e.g. system bot)
      // but usually recipientId is provided from search
      const conv = await startConversation(recipientId);
      
      // Update local state if not exists
      if (!conversations.find(c => c._id === conv._id)) {
        setConversations(prev => [conv, ...prev]);
      }
      
      handleSelectConversation(conv);
      setShowSearch(false);
    } catch (err) {
      console.error('Failed to start conversation', err);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleTyping = () => {
    if (!socket || !activeConversation) return;

    const recipient = activeConversation.participants.find(p => p._id !== user._id);
    if (!recipient) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { 
        conversationId: activeConversation._id, 
        userId: user._id,
        recipientId: recipient._id 
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop-typing', { 
        conversationId: activeConversation._id, 
        userId: user._id, 
        recipientId: recipient._id 
      });
    }, 3000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/webm', 'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];

    if (file.size > MAX_SIZE) {
      alert('File is too large. Max limit is 50MB.');
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('File type not supported.');
      return;
    }

    setUploading(true);
    try {
      const uploadedFile = await uploadFile(file);
      setAttachments(prev => [...prev, uploadedFile]);
    } catch (err) {
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !activeConversation || sending) return;

    const recipient = activeConversation.participants.find(p => p._id !== user._id);
    const content = newMessage;
    const attachmentIds = attachments.map(a => a._id);
    
    setNewMessage('');
    setAttachments([]);
    setSending(true);
    setShowEmojiPicker(false);

    try {
      const sentMsg = await sendNewMessage(activeConversation._id, content, null, attachmentIds);
      setMessages((prev) => [...prev, sentMsg]);
      
      setConversations(prev => prev.map(c => 
        c._id === activeConversation._id ? { ...c, lastMessage: sentMsg, updatedAt: new Date().toISOString() } : c
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      
      setIsTyping(false);
      if (recipient) {
        socket.emit('stop-typing', { conversationId: activeConversation._id, userId: user._id, recipientId: recipient._id });
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploading(true);
      try {
        const uploadedFile = await uploadFile(file);
        setAttachments(prev => [...prev, uploadedFile]);
      } catch (err) {
        alert('Failed to upload dropped file.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleStartCallRequest = async (type = 'voice') => {
    if (!activeConversation) return;
    const otherUser = activeConversation.participants.find(p => p._id !== user._id);
    if (!otherUser) return;

    try {
      const call = await startCall(otherUser._id, type);
      navigate(`/dashboard/meeting/${call._id}`);
      
      // Optional: keep tel: for phone dialing if voice
      if (otherUser.phoneNumber && type === 'voice') {
        // window.location.href = `tel:${otherUser.phoneNumber}`;
      }
    } catch (err) {
      console.error('Failed to initiate call', err);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    const otherUser = activeConversation.participants.find(p => p._id !== user._id);
    
    try {
      const data = {
        title: meetingData.title,
        description: meetingData.description,
        startTime: meetingData.startTime,
        endTime: new Date(new Date(meetingData.startTime).getTime() + meetingData.duration * 60000),
        participants: [otherUser._id],
      };
      await scheduleMeeting(data);
      setShowMeetingModal(false);
      
      // Notify in chat
      const msgContent = `📅 New meeting scheduled: ${data.title}\nTime: ${new Date(data.startTime).toLocaleString()}`;
      await sendNewMessage(activeConversation._id, msgContent);
      alert('Meeting scheduled successfully!');
    } catch (err) {
      alert('Failed to schedule meeting: ' + err.message);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        setUploading(true);
        try {
          const uploadedFile = await uploadFile(file);
          setAttachments(prev => [...prev, uploadedFile]);
        } catch (err) {
          alert('Failed to upload voice note');
        } finally {
          setUploading(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or unavailable.');
    }
  };

  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      video.onloadedmetadata = () => {
        setTimeout(async () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob(async (blob) => {
            const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
            setUploading(true);
            try {
              const uploadedFile = await uploadFile(file);
              setAttachments(prev => [...prev, uploadedFile]);
            } catch (err) {
              alert('Failed to upload screenshot');
            } finally {
              setUploading(false);
            }
          }, 'image/png');
          
          stream.getTracks().forEach(track => track.stop());
        }, 500); // Small delay to ensuring stream is ready
      };
    } catch (err) {
      console.error('Screenshot cancelled or failed:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Icon icon="fluent:checkmark-12-regular" width="14" className="text-slate-400" />;
      case 'delivered': return <Icon icon="fluent:checkmark-12-filled" width="14" className="text-slate-400" />;
      case 'read': return <Icon icon="fluent:checkmark-12-filled" width="14" className="text-primary-400" />;
      default: return null;
    }
  };

  const renderAttachments = (files) => {
    if (!files || files.length === 0) return null;
    return (
      <div className="flex flex-col gap-3 mt-3">
        {files.map(file => (
          <div key={file._id} className="relative">
            {file.category === 'image' ? (
              <div 
                onClick={() => setPreviewImage(file.url)}
                className="relative group/img cursor-pointer max-w-[400px] overflow-hidden rounded-[1.5rem] border border-white/10"
              >
                <img src={file.url} alt="" className="w-full h-auto object-cover transition-transform duration-500 group-hover/img:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                   <Icon icon="fluent:zoom-in-24-filled" width="32" className="text-white" />
                </div>
              </div>
            ) : file.category === 'audio' ? (
              <div className={`flex flex-col gap-2 p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                   <Icon icon="fluent:mic-sparkle-24-filled" width="24" className="text-primary-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Voice Note</span>
                </div>
                <audio controls src={file.url} className="w-full h-8" />
              </div>
            ) : (
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-4 p-4 rounded-2xl text-xs font-bold transition-all border ${
                  isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Icon icon={file.category === 'document' ? 'fluent:document-pdf-24-filled' : 'fluent:document-24-filled'} width="24" className="text-primary-500" />
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm">{file.originalName}</p>
                  <p className="opacity-50 text-[10px]">{(file.size / 1024).toFixed(1)} KB • {file.format?.toUpperCase()}</p>
                </div>
                <Icon icon="fluent:arrow-download-24-regular" width="20" className="opacity-50 group-hover:opacity-100" />
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        <p className="font-bold opacity-50">Synchronizing communications...</p>
      </div>
    );
  }

  return (
    <div className={`flex h-[calc(100vh-4rem)] overflow-hidden border-t ${
      isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200'
    }`}>
      {/* Sidebar - Conversations */}
      <aside className={`w-72 lg:w-[320px] border-r flex flex-col ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-100 bg-slate-50/30'}`}>
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`font-black text-3xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Chat</h2>
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={`p-3 rounded-2xl transition-all ${
                showSearch ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 rotate-45' : (isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-white border border-slate-200 text-slate-600 hover:shadow-lg')
              }`}
            >
              <Icon icon="fluent:add-24-filled" width="22" />
            </button>
          </div>
          
          <div className="relative group">
            <input 
              type="text"
              placeholder={showSearch ? "Find people..." : "Search messages..."}
              onChange={(e) => showSearch ? handleSearchUsers(e.target.value) : null}
              className={`w-full pl-12 pr-4 py-4 rounded-[1.25rem] text-sm font-medium outline-none transition-all ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-primary-500/50' : 'bg-white border-slate-200 focus:bg-white focus:border-primary-500/30 focus:shadow-xl'
              } border`}
            />
            <Icon icon="fluent:search-24-regular" className="absolute left-4 top-4 text-slate-500 group-focus-within:text-primary-500 transition-colors" width="20" />
            
            {showSearch && userSearchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-4 rounded-3xl border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] z-50 overflow-hidden ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}>
                {userSearchResults.map(u => (
                  <button
                    key={u._id}
                    onClick={() => { handleStartNewChat(u._id); setShowSearch(false); }}
                    className={`w-full p-4 flex items-center gap-4 text-left transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-black">
                      {u.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.name}</p>
                      <p className="text-[11px] text-slate-500 font-bold truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((conv) => {
            const other = conv.participants.find(p => p._id !== user._id);
            const isActive = activeConversation?._id === conv._id;
            const hasUnread = conv.lastMessage && conv.lastMessage.sender !== user._id && !conv.lastMessage.isRead;
            
            return (
              <button
                key={conv._id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all duration-300 group ${
                  isActive 
                    ? 'bg-primary-500 shadow-2xl shadow-primary-500/40 text-white' 
                    : (isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-white hover:shadow-xl text-slate-500')
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-transform group-hover:scale-105 border-2 ${
                    isActive ? 'bg-white/20 text-white border-white/20' : (isDark ? 'bg-primary-500/10 text-primary-500 border-white/5' : 'bg-primary-500/10 text-primary-500 border-slate-200')
                  }`}>
                    {other?.avatar ? <img src={other.avatar} className="w-full h-full object-cover rounded-2xl" /> : (other?.name?.[0] || 'U')}
                  </div>
                  {hasUnread && !isActive && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-inherit flex items-center justify-center px-1 text-[9px] text-white font-black shadow-lg">
                      {conv.unreadCount || 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-black text-[15px] truncate ${isActive ? 'text-white' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                      {other?.name || 'User'}
                    </h3>
                    <span className={`text-[10px] font-black opacity-50`}>
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className={`text-xs truncate font-bold ${isActive ? 'text-white/80' : 'text-slate-500/70'}`}>
                    {conv.lastMessage?.content || 'Started a new encryption'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className={`flex-1 flex flex-col relative ${isDark ? 'bg-slate-950/50' : 'bg-slate-50/50'}`}>
        <AnimatePresence mode="wait">
          {activeConversation ? (
            <motion.div 
              key={activeConversation._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Header */}
              <header className={`px-6 py-4 border-b flex items-center justify-between backdrop-blur-3xl sticky top-0 z-20 ${
                isDark ? 'border-white/10 bg-black/40' : 'border-slate-100 bg-white/60'
              }`}>
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {activeConversation.participants.find(p => p._id !== user._id)?.name?.[0]}
                  </div>
                  <div>
                    <h3 className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {activeConversation.participants.find(p => p._id !== user._id)?.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <p className="text-[11px] text-green-500 font-black uppercase tracking-widest">Active Connection</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowMeetingModal(true)}
                    className={`p-3 rounded-2xl border transition-all ${isDark ? 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-500 hover:text-primary-500 hover:shadow-lg'}`}
                    title="Schedule Video Meeting"
                  >
                    <Icon icon="fluent:video-24-filled" width="22" />
                  </button>
                  <button 
                    onClick={() => handleStartCallRequest('voice')}
                    className={`p-3 rounded-2xl border transition-all ${isDark ? 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-500 hover:text-primary-500 hover:shadow-lg'}`}
                    title="Start Voice Call"
                  >
                    <Icon icon="fluent:call-24-filled" width="22" />
                  </button>
                   <button className={`p-3 rounded-2xl border transition-all ${isDark ? 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-500 hover:text-primary-500 hover:shadow-lg'}`}>
                    <Icon icon="fluent:settings-24-regular" width="22" />
                  </button>
                </div>
              </header>

              {/* Messages Flow */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scroll-smooth">
                {messages.map((msg, i) => {
                  const isMine = msg.sender === user._id || msg.sender?._id === user._id;
                  const showDate = i === 0 || new Date(messages[i-1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
                  
                  return (
                    <React.Fragment key={msg._id || i}>
                      {showDate && (
                        <div className="flex justify-center py-6">
                          <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                            isDark ? 'bg-white/5 text-slate-500 border border-white/5' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] group relative ${isMine ? 'text-right' : 'text-left'}`}>
                          <div className={`p-5 rounded-[2rem] text-[15px] font-medium leading-relaxed shadow-sm transition-all hover:shadow-md ${
                            isMine 
                              ? 'bg-primary-500 text-white rounded-tr-none' 
                              : (isDark ? 'bg-slate-900 border border-white/10 text-slate-100 rounded-tl-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none')
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {renderAttachments(msg.attachments)}
                          </div>
                          
                          <div className={`flex items-center gap-2 mt-2 opacity-50 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && getStatusIcon(msg.status)}
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
                
                {remoteTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className={`px-5 py-3 rounded-full flex items-center gap-3 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Other user is typing</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className={`p-8 border-t backdrop-blur-3xl relative ${isDark ? 'border-white/10 bg-black/40' : 'border-slate-100 bg-white/60'}`}>
                {/* Emoji Picker Overlay */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-10 z-50 mb-4 shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
                    <EmojiPicker 
                      theme={isDark ? 'dark' : 'light'} 
                      onEmojiClick={(emojiData) => {
                        setNewMessage(prev => prev + emojiData.emoji);
                        // Optional: close after click or keep open
                      }} 
                    />
                  </div>
                )}

                {/* Files Preview */}
                {attachments.length > 0 && (
                   <div className="flex flex-wrap gap-2 mb-4 bg-primary-500/5 p-3 rounded-2xl border border-primary-500/20">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="relative group/file">
                           <div className={`h-16 px-4 py-2 rounded-xl flex items-center gap-3 border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                             {file.category === 'image' ? (
                               <img src={file.url} className="w-10 h-10 rounded-lg object-cover" />
                             ) : file.category === 'audio' ? (
                               <Icon icon="fluent:mic-24-filled" className="text-primary-500" width="24" />
                             ) : (
                               <Icon icon="fluent:document-24-filled" className="text-primary-500" width="24" />
                             )}
                             <span className="text-xs font-bold truncate max-w-[120px]">{file.originalName}</span>
                             <button 
                                type="button"
                                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1 rounded-lg bg-red-500 text-white opacity-0 group-hover/file:opacity-100 transition-opacity"
                             >
                                <Icon icon="fluent:dismiss-16-filled" />
                             </button>
                           </div>
                        </div>
                      ))}
                   </div>
                )}

                {isRecording ? (
                  <div className={`flex items-center justify-between p-5 rounded-[2rem] border-2 border-primary-500 animate-pulse ${isDark ? 'bg-primary-500/10' : 'bg-primary-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      <span className="font-black text-primary-500 uppercase tracking-widest text-xs">Recording Audio... {formatTime(recordingTime)}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={stopRecording}
                      className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                      Stop & Attach
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={handleSendMessage} 
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative group transition-all ${dragActive ? 'scale-[1.02] ring-4 ring-primary-500/20 rounded-[2rem]' : ''}`}
                  >
                    <input
                      ref={inputRef}
                      disabled={sending}
                      type="text"
                      value={newMessage}
                      onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                      placeholder={dragActive ? "Drop files now!" : "Whisper something professional..."}
                      className={`w-full pl-8 pr-32 py-5 rounded-[2rem] text-sm font-semibold outline-none transition-all shadow-inner ${
                        isDark 
                          ? 'bg-black/40 border-white/5 text-white focus:border-primary-500/50 focus:bg-black/60' 
                          : 'bg-slate-100 border-transparent focus:bg-white focus:border-primary-500/30 focus:shadow-2xl'
                      } border`}
                    />
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-primary-400' : 'bg-white text-slate-500 hover:text-primary-500 shadow-sm'}`}
                      >
                        {uploading ? (
                           <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                           <Icon icon="fluent:attach-24-filled" width="24" />
                        )}
                      </button>
                      <button
                        type="submit"
                        disabled={(!newMessage.trim() && attachments.length === 0) || sending}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          (newMessage.trim() || attachments.length > 0) && !sending
                            ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/40 hover:scale-110 active:scale-95' 
                            : 'bg-slate-400/20 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                          <Icon icon="fluent:send-24-filled" width="24" />
                        )}
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                  </form>
                )}
                
                {!isRecording && (
                  <div className="mt-4 flex gap-6 pl-6">
                    <button 
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${showEmojiPicker ? 'text-primary-500' : 'text-slate-500 hover:text-primary-500'}`}
                    >
                        <Icon icon="fluent:emoji-24-regular" width="18" />
                        Emojis
                    </button>
                    <button 
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-colors"
                    >
                        <Icon icon="fluent:mic-24-regular" width="18" />
                        Voice Note
                    </button>
                    <button 
                      type="button"
                      onClick={handleScreenshot}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-colors"
                    >
                        <Icon icon="fluent:screenshot-24-regular" width="18" />
                        Screenshot
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-20"
            >
              <div className={`w-40 h-40 rounded-[3rem] flex items-center justify-center mb-10 rotate-12 ${isDark ? 'bg-white/5' : 'bg-primary-500/5'}`}>
                 <Icon icon="fluent:chat-bubbles-question-24-filled" width="80" className="text-primary-500/30" />
              </div>
              <h3 className={`text-4xl font-black mb-4 tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Secure Communication</h3>
              <p className="max-w-md mx-auto text-base font-medium opacity-50 mb-10 leading-relaxed">Select a thread to begin transmitting data. Our platform supports encrypted messaging, high-fidelity video meetings, and secure file exchanges.</p>
              {!user.roles.includes('admin') && conversations.length === 0 && (
                 <button 
                  onClick={() => handleStartNewChat()}
                  className="px-10 py-4 bg-primary-500 text-white rounded-[1.5rem] font-black shadow-[0_20px_40px_-5px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 transition-all"
                 >
                   Establish Connection
                 </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meeting Scheduler Modal */}
        <AnimatePresence>
          {showMeetingModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className={`w-full max-w-lg rounded-[2.5rem] border shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className="p-10">
                  <div className="flex justify-between items-center mb-8">
                     <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Schedule Meeting</h2>
                     <button onClick={() => setShowMeetingModal(false)} className="p-2 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all">
                        <Icon icon="fluent:dismiss-24-filled" width="24" />
                     </button>
                  </div>
                  
                  <form onSubmit={handleScheduleMeeting} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Topic</label>
                      <input 
                        required
                        type="text" 
                        value={meetingData.title}
                        onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                        placeholder="e.g. Portfolio Review / Strategy Session"
                        className={`w-full px-6 py-4 rounded-2xl text-sm font-bold outline-none border transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white focus:border-primary-500/50' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500/30'
                        }`}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Start Time</label>
                        <input 
                          required
                          type="datetime-local" 
                          value={meetingData.startTime}
                          onChange={(e) => setMeetingData({...meetingData, startTime: e.target.value})}
                          className={`w-full px-6 py-4 rounded-2xl text-sm font-bold outline-none border transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white focus:border-primary-500/50' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500/30'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Duration (Min)</label>
                        <select 
                          value={meetingData.duration}
                          onChange={(e) => setMeetingData({...meetingData, duration: parseInt(e.target.value)})}
                          className={`w-full px-6 py-4 rounded-2xl text-sm font-bold outline-none border transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white focus:border-primary-500/50' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500/30'
                          }`}
                        >
                          <option value={15}>15 Minutes</option>
                          <option value={30}>30 Minutes</option>
                          <option value={45}>45 Minutes</option>
                          <option value={60}>1 Hour</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Agenda (Optional)</label>
                      <textarea 
                        rows={3}
                        value={meetingData.description}
                        onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
                        placeholder="What will you discuss?"
                        className={`w-full px-6 py-4 rounded-2xl text-sm font-bold outline-none border transition-all ${
                          isDark ? 'bg-white/5 border-white/10 text-white focus:border-primary-500/50' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500/30'
                        }`}
                      />
                    </div>

                    <div className="pt-4 flex gap-4">
                       <button 
                        type="button"
                        onClick={() => setShowMeetingModal(false)}
                        className={`flex-1 py-4 rounded-2xl font-black text-sm border transition-all ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                       >
                         Cancel
                       </button>
                       <button 
                        type="submit"
                        className="flex-1 py-4 rounded-2xl font-black text-sm bg-primary-500 text-white shadow-xl shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                       >
                         Schedule & Invite
                       </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Image Lightbox */}
        <AnimatePresence>
          {previewImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-black/95 backdrop-blur-xl cursor-zoom-out"
            >
               <motion.button 
                className="absolute top-10 right-10 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                onClick={() => setPreviewImage(null)}
               >
                  <Icon icon="fluent:dismiss-24-filled" width="32" />
               </motion.button>
               
               <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={previewImage} 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
               />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardMessages;
