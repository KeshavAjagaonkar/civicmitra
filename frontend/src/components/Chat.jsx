import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Send } from 'lucide-react';
import { ScrollArea } from './ui/ScrollArea';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import useApi from '@/hooks/useApi';
import { useToast } from './ui/use-toast';
import { format } from 'date-fns';

const Chat = ({ complaintId }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat messages on mount
  useEffect(() => {
    const fetchChat = async () => {
      if (!complaintId) return;

      try {
        const result = await request(`/api/chats/${complaintId}`);
        if (result.success) {
          setMessages(result.data.messages || []);
        }
      } catch (err) {
        console.error('Failed to fetch chat:', err);
        toast({
          title: 'Failed to load chat',
          description: err.message,
          variant: 'destructive'
        });
      }
    };

    fetchChat();
  }, [complaintId, request, toast]);

  // Socket.IO: Join complaint room and listen for messages
  useEffect(() => {
    if (!socket || !complaintId || !isConnected) return;

    // Join the complaint-specific room
    socket.emit('join_room', complaintId);
    console.log('Joined chat room:', complaintId);

    // Listen for incoming messages
    const handleReceiveMessage = (message) => {
      console.log('Received message:', message);
      setMessages((prev) => [...prev, message]);
    };

    socket.on('receive_message', handleReceiveMessage);

    // Cleanup
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.emit('leave_room', complaintId);
    };
  }, [socket, complaintId, isConnected]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !complaintId) {
      toast({
        title: 'Message required',
        description: 'Please enter a message',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await request(`/api/chats/${complaintId}`, 'POST', {
        message: newMessage.trim()
      });

      if (result.success) {
        // Message will be added via Socket.IO listener
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast({
        title: 'Failed to send message',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      return '';
    }
  };

  const isMyMessage = (message) => {
    // Handle both populated and non-populated sender
    const senderId = message.sender?._id || message.sender;
    const currentUserId = user?._id || user?.id;
    const isMine = senderId === currentUserId;

    // Debug log
    console.log('Message alignment check:', {
      messageSenderId: senderId,
      currentUserId: currentUserId,
      userObject: user,
      isMine,
      senderName: message.sender?.name
    });

    return isMine;
  };

  const getSenderName = (message) => {
    if (!message.sender) return 'System';
    return message.sender.name || 'Unknown';
  };

  const getChatTitle = () => {
    switch (user?.role) {
      case 'citizen':
        return 'Chat with Staff';
      case 'staff':
      case 'worker':
      case 'admin':
        return 'Chat with Citizen';
      default:
        return 'Chat';
    }
  };

  if (!complaintId) {
    return (
      <Card className="glass-card h-full flex items-center justify-center">
        <p className="text-gray-500">No complaint selected</p>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center justify-between">
          <span>{getChatTitle()}</span>
          {isConnected && (
            <span className="flex items-center gap-2 text-sm font-normal text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Connected
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-[calc(100%-60px)] pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMine = isMyMessage(msg);
                return (
                  <div
                    key={index}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 shadow-sm ${
                        isMine
                          ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
                          : msg.sender
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-2xl rounded-bl-md'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-gray-900 dark:text-gray-50 border border-yellow-300 dark:border-yellow-700 rounded-2xl'
                      }`}
                    >
                      {!isMine && msg.sender && (
                        <p className="text-xs font-semibold mb-1 opacity-80">
                          {getSenderName(msg)}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <span className={`text-xs opacity-75 block mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })

            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <Textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 glass-input resize-none"
          rows={1}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          loading={isLoading}
          disabled={!newMessage.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Chat;
