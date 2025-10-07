import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from '@/hooks/useAuth';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, isConnected } = useSocket();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();

  // Error boundary for the provider
  const handleError = (error, context) => {
    console.error(`NotificationProvider Error (${context}):`, error);
    setError(error.message);
    setLoading(false);
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        // Handle both array response and wrapped response
        const data = Array.isArray(result) ? result : (result.data || []);
        setNotifications(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}: Failed to fetch notifications`);
      }
    } catch (error) {
      handleError(error, 'fetchNotifications');
      // Set empty array as fallback
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    // Wait for auth to finish loading before attempting to fetch
    if (authLoading) {
      return;
    }

    if (isAuthenticated && token && user) {
      fetchNotifications();
    } else {
      // If no token, initialize with empty array and stop loading
      setNotifications([]);
      setLoading(false);
    }
  }, [token, isAuthenticated, user, authLoading]);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (socket && isConnected) {
      const handleNotification = (notification) => {
        const newNotification = {
          id: notification.id || Date.now(),
          message: notification.message,
          read: false,
          date: new Date(notification.createdAt || Date.now()),
          type: notification.type || 'general'
        };
        setNotifications(prev => [newNotification, ...prev]);
      };

      socket.on('notification', handleNotification);
      socket.on('complaint_updated', (data) => {
        handleNotification({
          message: `Your complaint #${data.complaintId} has been updated to '${data.status}'`,
          type: 'complaint_update'
        });
      });

      return () => {
        socket.off('notification', handleNotification);
        socket.off('complaint_updated');
      };
    }
  }, [socket, isConnected]);

  const addNotification = (message, type = 'general') => {
    const newNotification = {
      id: Date.now(),
      message,
      read: false,
      date: new Date(),
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = async (id) => {
    try {
      // Update locally first
      setNotifications(prev => 
        Array.isArray(prev) ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : []
      );

      // Update on server if token is available
      if (token) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/notifications/${id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      if (token) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/notifications/read-all`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0;

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        markAsRead, 
        markAllAsRead,
        unreadCount, 
        loading,
        error,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
