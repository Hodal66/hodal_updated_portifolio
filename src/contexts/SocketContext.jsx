import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to the backend socket server
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3300', {
        transports: ['polling', 'websocket'], // Use polling first for reliability across hosting providers (like Render)
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Connected to real-time server');
        // Join the user's specific room for notifications
        newSocket.emit('join', user._id);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
