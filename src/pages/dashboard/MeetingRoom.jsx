import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getMeeting, joinMeetingAPI, leaveMeetingAPI, endMeetingAPI, getMeetingMessages as fetchChatHistory } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// ─── ICE Servers for WebRTC ───
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const { isDark } = useTheme();

  // ─── State ───
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [participants, setParticipants] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);

  // ─── Refs ───
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peersRef = useRef({}); // { socketId: { peer, stream, userId, userName } }
  const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: { stream, userId, userName, isMuted, isCameraOff, hasRaisedHand } }
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // ─── Timer ───
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Initialize meeting ───
  useEffect(() => {
    const init = async () => {
      try {
        const data = await getMeeting(meetingId);
        if (!data) {
          setError('Meeting not found');
          setLoading(false);
          return;
        }
        setMeeting(data);

        // Join via API
        await joinMeetingAPI(meetingId);

        // Load chat history
        try {
          const history = await fetchChatHistory(meetingId);
          setChatMessages(history || []);
        } catch (e) { /* no history yet */ }

        // Get media stream
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (mediaErr) {
          console.warn('Could not access media devices:', mediaErr);
          // Still allow joining without media
        }

        // Socket: join room
        if (socket) {
          socket.emit('meeting:join', {
            meetingId,
            userId: user._id,
            userName: user.name,
          });
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to join meeting');
        setLoading(false);
      }
    };

    if (user && meetingId) init();

    return () => {
      // Cleanup on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      // Close all peer connections
      Object.values(peersRef.current).forEach(({ peer }) => {
        if (peer) peer.close();
      });
      peersRef.current = {};

      if (socket) {
        socket.emit('meeting:leave', {
          meetingId,
          userId: user?._id,
          userName: user?.name,
        });
      }

      leaveMeetingAPI(meetingId).catch(() => {});
    };
  }, [meetingId, user]);

  // ─── Create peer connection ───
  const createPeerConnection = useCallback((targetSocketId, targetUserId, targetUserName, isInitiator) => {
    if (peersRef.current[targetSocketId]) return peersRef.current[targetSocketId].peer;

    const peer = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    // ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('meeting:ice-candidate', {
          targetSocketId,
          candidate: event.candidate,
          userId: user._id,
        });
      }
    };

    // Remote stream
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => ({
        ...prev,
        [targetSocketId]: {
          stream: remoteStream,
          userId: targetUserId,
          userName: targetUserName,
          isMuted: false,
          isCameraOff: false,
          hasRaisedHand: false,
        },
      }));
    };

    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed') {
        // Cleanup this peer
        peer.close();
        delete peersRef.current[targetSocketId];
        setRemoteStreams(prev => {
          const updated = { ...prev };
          delete updated[targetSocketId];
          return updated;
        });
      }
    };

    peersRef.current[targetSocketId] = { peer, userId: targetUserId, userName: targetUserName };

    if (isInitiator) {
      peer.createOffer().then(offer => {
        peer.setLocalDescription(offer);
        socket.emit('meeting:offer', {
          targetSocketId,
          offer,
          userId: user._id,
          userName: user.name,
        });
      });
    }

    return peer;
  }, [socket, user]);

  // ─── Socket events for WebRTC ───
  useEffect(() => {
    if (!socket) return;

    // Someone joined — create a new outgoing peer connection
    socket.on('meeting:user-joined', async (data) => {
      setParticipants(prev => {
        if (prev.find(p => p.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, userName: data.userName, socketId: data.socketId }];
      });
      // We are the initiator — create offer
      createPeerConnection(data.socketId, data.userId, data.userName, true);
    });

    // Receive offer — respond with answer
    socket.on('meeting:offer', async (data) => {
      const peer = createPeerConnection(data.senderSocketId, data.userId, data.userName, false);
      await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('meeting:answer', {
        targetSocketId: data.senderSocketId,
        answer,
        userId: user._id,
      });
    });

    // Receive answer
    socket.on('meeting:answer', async (data) => {
      const peerData = peersRef.current[data.senderSocketId];
      if (peerData?.peer) {
        await peerData.peer.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // ICE candidates
    socket.on('meeting:ice-candidate', async (data) => {
      const peerData = peersRef.current[data.senderSocketId];
      if (peerData?.peer) {
        await peerData.peer.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // User left
    socket.on('meeting:user-left', (data) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      const peerData = peersRef.current[data.socketId];
      if (peerData?.peer) {
        peerData.peer.close();
        delete peersRef.current[data.socketId];
      }
      setRemoteStreams(prev => {
        const updated = { ...prev };
        delete updated[data.socketId];
        return updated;
      });
    });

    // Toggle mic broadcast
    socket.on('meeting:user-toggled-mic', (data) => {
      setRemoteStreams(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].userId === data.userId) {
            updated[key] = { ...updated[key], isMuted: data.isMuted };
          }
        });
        return updated;
      });
    });

    // Toggle camera broadcast
    socket.on('meeting:user-toggled-camera', (data) => {
      setRemoteStreams(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].userId === data.userId) {
            updated[key] = { ...updated[key], isCameraOff: data.isCameraOff };
          }
        });
        return updated;
      });
    });

    // Raise hand
    socket.on('meeting:user-raised-hand', (data) => {
      setRemoteStreams(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].userId === data.userId) {
            updated[key] = { ...updated[key], hasRaisedHand: data.raised };
          }
        });
        return updated;
      });
    });

    // Chat message
    socket.on('meeting:chat-message', (data) => {
      setChatMessages(prev => [...prev, {
        sender: { _id: data.userId, name: data.userName },
        content: data.content,
        type: data.type,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        createdAt: data.timestamp,
      }]);
    });

    // Meeting ended
    socket.on('meeting:ended', () => {
      setMeetingEnded(true);
    });

    // Screen share
    socket.on('meeting:user-screen-share', (data) => {
      // Could show an indicator
    });

    return () => {
      socket.off('meeting:user-joined');
      socket.off('meeting:offer');
      socket.off('meeting:answer');
      socket.off('meeting:ice-candidate');
      socket.off('meeting:user-left');
      socket.off('meeting:user-toggled-mic');
      socket.off('meeting:user-toggled-camera');
      socket.off('meeting:user-raised-hand');
      socket.off('meeting:chat-message');
      socket.off('meeting:ended');
      socket.off('meeting:user-screen-share');
    };
  }, [socket, user, createPeerConnection]);

  // ─── Auto-scroll chat ───
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── Controls ───
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        socket?.emit('meeting:toggle-mic', {
          meetingId,
          userId: user._id,
          isMuted: !audioTrack.enabled,
        });
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
        socket?.emit('meeting:toggle-camera', {
          meetingId,
          userId: user._id,
          isCameraOff: !videoTrack.enabled,
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      // Replace screen track with camera track in all peer connections
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(({ peer }) => {
          const sender = peer.getSenders().find(s => s.track?.kind === 'video');
          if (sender && videoTrack) sender.replaceTrack(videoTrack);
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
      socket?.emit('meeting:screen-share', { meetingId, userId: user._id, isSharing: false });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track in all peer connections
        Object.values(peersRef.current).forEach(({ peer }) => {
          const sender = peer.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

        screenTrack.onended = () => {
          toggleScreenShare(); // recursive call to toggle off
        };

        setIsScreenSharing(true);
        socket?.emit('meeting:screen-share', { meetingId, userId: user._id, isSharing: true });
      } catch (err) {
        console.warn('Screen sharing cancelled or failed:', err);
      }
    }
  };

  const toggleRaiseHand = () => {
    const newState = !hasRaisedHand;
    setHasRaisedHand(newState);
    socket?.emit('meeting:raise-hand', {
      meetingId,
      userId: user._id,
      userName: user.name,
      raised: newState,
    });
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording local video+audio
      try {
        const stream = localStreamRef.current;
        if (!stream) return;
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
        recordedChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `meeting_${meetingId}_${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
        };
        recorder.start(1000); // chunks every second
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error('Recording failed:', err);
      }
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    socket?.emit('meeting:chat-message', {
      meetingId,
      userId: user._id,
      userName: user.name,
      content: chatInput.trim(),
      type: 'text',
    });
    setChatInput('');
  };

  const handleLeaveMeeting = async () => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
    Object.values(peersRef.current).forEach(({ peer }) => peer?.close());
    peersRef.current = {};

    socket?.emit('meeting:leave', { meetingId, userId: user._id, userName: user.name });
    await leaveMeetingAPI(meetingId).catch(() => {});
    navigate('/dashboard/meetings');
  };

  const handleEndMeeting = async () => {
    socket?.emit('meeting:end', { meetingId });
    await endMeetingAPI(meetingId).catch(() => {});
    handleLeaveMeeting();
  };

  // ─── Compute video grid columns ───
  const totalVideos = 1 + Object.keys(remoteStreams).length;
  const gridCols = totalVideos <= 1 ? 'grid-cols-1' :
    totalVideos <= 2 ? 'grid-cols-1 lg:grid-cols-2' :
    totalVideos <= 4 ? 'grid-cols-2' :
    totalVideos <= 6 ? 'grid-cols-2 lg:grid-cols-3' :
    'grid-cols-3 lg:grid-cols-4';

  // ─── RENDER ───

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <Icon icon="fluent:video-24-filled" width="28" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
        </div>
        <p className="mt-6 text-white/50 font-bold text-xs uppercase tracking-[0.3em]">Connecting to meeting room...</p>
      </div>
    );
  }

  if (error || meetingEnded) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Icon icon={meetingEnded ? 'fluent:call-end-24-filled' : 'fluent:warning-24-filled'} width="40" className={meetingEnded ? 'text-blue-400' : 'text-red-400'} />
        </div>
        <h2 className="text-white text-2xl font-black mb-2">{meetingEnded ? 'Meeting Ended' : 'Unable to Join'}</h2>
        <p className="text-white/50 text-sm mb-8">{meetingEnded ? 'The host has ended this meeting.' : error}</p>
        <button
          onClick={() => navigate('/dashboard/meetings')}
          className="px-8 py-3 bg-blue-500 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 bg-slate-900/80 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
            <span className="text-white font-black text-sm tracking-tight">{meeting?.title || 'Meeting'}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
            <Icon icon="fluent:timer-24-regular" width="16" className="text-blue-400" />
            <span className="text-blue-400 font-mono text-xs font-bold">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/20 mr-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">REC</span>
            </div>
          )}
          <button
            onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
            className={`p-2.5 rounded-xl transition-all ${showParticipants ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <Icon icon="fluent:people-24-filled" width="18" />
          </button>
          <button
            onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}
            className={`p-2.5 rounded-xl transition-all ${showChat ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <Icon icon="fluent:chat-24-filled" width="18" />
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── Video Grid ─── */}
        <div className={`flex-1 p-3 lg:p-4 overflow-auto transition-all ${(showChat || showParticipants) ? 'lg:mr-0' : ''}`}>
          <div className={`grid ${gridCols} gap-3 h-full auto-rows-fr`}>
            {/* Local video */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 group">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`}
              />
              {isCameraOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-black shadow-2xl shadow-blue-500/30">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
              )}
              {/* Overlay info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-bold">{user?.name} (You)</span>
                    {hasRaisedHand && <span className="text-lg">✋</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {isMuted && <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center"><Icon icon="fluent:mic-off-24-filled" width="12" className="text-white" /></div>}
                    {isScreenSharing && <div className="w-6 h-6 rounded-full bg-green-500/80 flex items-center justify-center"><Icon icon="fluent:share-screen-24-filled" width="12" className="text-white" /></div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Remote videos */}
            {Object.entries(remoteStreams).map(([socketId, data]) => (
              <RemoteVideo key={socketId} data={data} />
            ))}
          </div>
        </div>

        {/* ─── Side Panels ─── */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="border-l border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-white/5">
                <h3 className="text-white font-black text-sm flex items-center gap-2">
                  <Icon icon="fluent:chat-24-filled" width="18" className="text-blue-400" />
                  Meeting Chat
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.sender?._id === user._id || msg.userId === user._id ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">
                      {msg.sender?.name || msg.userName || 'Unknown'}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                      (msg.sender?._id === user._id || msg.userId === user._id)
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white/5 text-white/80 rounded-bl-md'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-all"
                  />
                  <button
                    onClick={sendChat}
                    className="p-2.5 bg-blue-500 rounded-xl text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Icon icon="fluent:send-24-filled" width="18" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {showParticipants && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="border-l border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-white/5">
                <h3 className="text-white font-black text-sm flex items-center gap-2">
                  <Icon icon="fluent:people-24-filled" width="18" className="text-blue-400" />
                  Participants ({1 + Object.keys(remoteStreams).length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Local user */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{user?.name} (You)</p>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">
                      {meeting?.host?._id === user._id ? 'Host' : 'Participant'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isMuted && <Icon icon="fluent:mic-off-24-filled" width="14" className="text-red-400" />}
                    {isCameraOff && <Icon icon="fluent:video-off-24-filled" width="14" className="text-red-400" />}
                    {hasRaisedHand && <span className="text-sm">✋</span>}
                  </div>
                </div>

                {/* Remote participants */}
                {Object.entries(remoteStreams).map(([socketId, data]) => (
                  <div key={socketId} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-500/20">
                      {data.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{data.userName}</p>
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Participant</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {data.isMuted && <Icon icon="fluent:mic-off-24-filled" width="14" className="text-red-400" />}
                      {data.isCameraOff && <Icon icon="fluent:video-off-24-filled" width="14" className="text-red-400" />}
                      {data.hasRaisedHand && <span className="text-sm">✋</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Control Bar ─── */}
      <div className="px-4 lg:px-6 py-4 bg-slate-900/80 border-t border-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* Mic */}
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
              isMuted ? 'bg-red-500 text-white shadow-red-500/30 hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <Icon icon={isMuted ? 'fluent:mic-off-24-filled' : 'fluent:mic-24-filled'} width="22" />
          </button>

          {/* Camera */}
          <button
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
              isCameraOff ? 'bg-red-500 text-white shadow-red-500/30 hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            <Icon icon={isCameraOff ? 'fluent:video-off-24-filled' : 'fluent:video-24-filled'} width="22" />
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
              isScreenSharing ? 'bg-green-500 text-white shadow-green-500/30 hover:bg-green-600' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <Icon icon={isScreenSharing ? 'fluent:share-screen-stop-24-filled' : 'fluent:share-screen-24-filled'} width="22" />
          </button>

          {/* Raise Hand */}
          <button
            onClick={toggleRaiseHand}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
              hasRaisedHand ? 'bg-yellow-500 text-white shadow-yellow-500/30 hover:bg-yellow-600' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={hasRaisedHand ? 'Lower hand' : 'Raise hand'}
          >
            <Icon icon="fluent:hand-right-24-filled" width="22" />
          </button>

          {/* Record */}
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
              isRecording ? 'bg-red-500 text-white shadow-red-500/30 animate-pulse hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <Icon icon={isRecording ? 'fluent:record-stop-24-filled' : 'fluent:record-24-filled'} width="22" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Leave */}
          <button
            onClick={handleLeaveMeeting}
            className="h-12 px-6 rounded-2xl bg-red-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
          >
            <Icon icon="fluent:call-end-24-filled" width="20" />
            <span className="hidden sm:inline">Leave</span>
          </button>

          {/* End Meeting (host only) */}
          {meeting?.host?._id === user?._id && (
            <button
              onClick={handleEndMeeting}
              className="h-12 px-6 rounded-2xl bg-red-700 text-white font-bold text-sm flex items-center gap-2 hover:bg-red-800 transition-all shadow-lg shadow-red-700/30"
            >
              <Icon icon="fluent:call-end-24-filled" width="20" />
              <span className="hidden sm:inline">End All</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Remote Video Component ───
const RemoteVideo = ({ data }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && data.stream) {
      videoRef.current.srcObject = data.stream;
    }
  }, [data.stream]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-800 group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${data.isCameraOff ? 'hidden' : ''}`}
      />
      {data.isCameraOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-black shadow-2xl shadow-purple-500/30">
            {data.userName?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-bold">{data.userName}</span>
            {data.hasRaisedHand && <span className="text-lg">✋</span>}
          </div>
          <div className="flex items-center gap-1">
            {data.isMuted && (
              <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                <Icon icon="fluent:mic-off-24-filled" width="12" className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
