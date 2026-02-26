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
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        auth: { token }, // Send JWT for server-side verification
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        // Notification room is auto-joined server-side from verified JWT — no emit needed
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', () => {
        setIsConnected(false);
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

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token, user]);

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

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        emitEvent,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};