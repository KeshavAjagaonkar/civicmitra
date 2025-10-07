import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Chat from '@/components/Chat';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare } from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const result = await request('/api/complaints/my');
        if (result.success) {
          setComplaints(result.data);
          // Auto-select first complaint if available
          if (result.data.length > 0) {
            setSelectedComplaint(result.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
        toast({
          title: 'Failed to load complaints',
          description: err.message,
          variant: 'destructive'
        });
      }
    };

    fetchComplaints();
  }, [request, toast]);

  return (
    <div className="h-[calc(100vh-140px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chat</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Communicate with staff about your complaints
        </p>
      </div>

      {complaints.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Complaints Yet</h3>
            <p className="text-gray-600 text-center">
              File a complaint first to start chatting with staff
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Complaints List */}
          <div className="lg:col-span-1">
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle>Your Complaints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {complaints.map((complaint) => (
                  <button
                    key={complaint._id}
                    onClick={() => setSelectedComplaint(complaint)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedComplaint?._id === complaint._id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <h4 className="font-semibold truncate">{complaint.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Status: {complaint.status}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 h-full">
            {selectedComplaint ? (
              <Chat complaintId={selectedComplaint._id} />
            ) : (
              <Card className="glass-card h-full flex items-center justify-center">
                <p className="text-gray-500">Select a complaint to start chatting</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
