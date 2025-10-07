import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && token && user) {
      // Initialize socket connection only when fully authenticated
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'], // Try websocket first
        withCredentials: true,
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnectionAttempts: 3, // Limit reconnection attempts
        reconnectionDelay: 2000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully:', newSocket.id);
        setIsConnected(true);

        // Join user-specific room for notifications
        if (user?.id) {
          newSocket.emit('join_notifications', user.id);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        // Don't show error toast - silently fail for better UX
      });

      // Listen for real-time notifications
      newSocket.on('notification', (data) => {
        toast({
          title: "New Notification",
          description: data.message,
        });
      });

      // Listen for complaint status updates
      newSocket.on('complaint_updated', (data) => {
        toast({
          title: "Complaint Updated",
          description: `Complaint #${data.complaintId} status: ${data.status}`,
        });
      });

      // Listen for new messages in chat (removed toast - handled in Chat component)

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Clean up socket if user is not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token, user]);

  // Socket methods for components to use
  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const joinRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('join_room', room);
    }
  };

  const leaveRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('leave_room', room);
    }
  };

  const sendMessage = (roomId, message) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        room: roomId,
        message,
        sender: user?.name || user?.email,
        senderId: user?.id
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        emitEvent,
        joinRoom,
        leaveRoom,
        sendMessage
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};