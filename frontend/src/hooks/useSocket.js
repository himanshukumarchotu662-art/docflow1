import { useEffect, useState, useCallback } from 'react';
import socketService from '../services/socket';
import { useAuth } from './useAuth';

const useSocket = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);

  useEffect(() => {
    if (user && token) {
      // Connect socket with user info
      socketService.connect(
        token,
        user.id,
        user.role,
        user.department
      );

      // Set up event listeners
      socketService.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socketService.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketService.on('notification', (data) => {
        console.log('New notification:', data);
        setNotifications(prev => [data, ...prev.slice(0, 9)]);
      });

      socketService.on('document-updated', (data) => {
        console.log('Document updated:', data);
        setRealTimeUpdates(prev => [data, ...prev.slice(0, 9)]);
      });

      socketService.on('new-document', (data) => {
        console.log('New document in department:', data);
        setNotifications(prev => [
          {
            type: 'new-document',
            message: `New document in ${data.department} department`,
            data,
            timestamp: new Date(),
          },
          ...prev.slice(0, 9)
        ]);
      });

      socketService.on('document-assigned', (data) => {
        console.log('Document assigned:', data);
        setNotifications(prev => [
          {
            type: 'document-assigned',
            message: `Document assigned to ${data.assignedTo}`,
            data,
            timestamp: new Date(),
          },
          ...prev.slice(0, 9)
        ]);
      });

      // Cleanup on unmount
      return () => {
        socketService.disconnect();
      };
    }
  }, [user, token]);

  const sendMessage = useCallback((event, data) => {
    if (isConnected) {
      socketService.emit(event, data);
    }
  }, [isConnected]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearRealTimeUpdates = useCallback(() => {
    setRealTimeUpdates([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.length;
  }, [notifications]);

  const joinRoom = useCallback((roomId) => {
    if (isConnected && user) {
      socketService.emit('join-room', roomId);
    }
  }, [isConnected, user]);

  const leaveRoom = useCallback((roomId) => {
    if (isConnected) {
      socketService.emit('leave-room', roomId);
    }
  }, [isConnected]);

  return {
    isConnected,
    notifications,
    realTimeUpdates,
    sendMessage,
    clearNotifications,
    clearRealTimeUpdates,
    getUnreadCount,
    joinRoom,
    leaveRoom,
  };
};

export default useSocket;