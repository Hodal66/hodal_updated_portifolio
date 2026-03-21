import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { getNotifications, markNotificationRead } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    // Initial fetch of unread notifications
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.warn('Could not fetch notifications');
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for real-time notifications
      socket.on('notification', (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        // Play notification sound if needed
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
