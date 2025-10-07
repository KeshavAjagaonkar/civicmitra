import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Chat from '@/components/Chat';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const ChatPage = () => {
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const result = await request('/api/complaints/all');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Staff Chat</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Communicate with citizens about their complaints
        </p>
      </div>

      {complaints.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Complaints Assigned</h3>
            <p className="text-gray-600 text-center">
              No complaints available for chat at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Complaints List */}
          <div className="lg:col-span-1">
            <Card className="glass-card h-full overflow-auto">
              <CardHeader>
                <CardTitle>Complaints ({complaints.length})</CardTitle>
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
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold truncate flex-1">{complaint.title}</h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {complaint.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {complaint.citizenId?.name || 'Unknown Citizen'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {complaint.category}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 h-full">
            {selectedComplaint ? (
              <div className="space-y-4 h-full flex flex-col">
                {/* Complaint Info Header */}
                <Card className="glass-card">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{selectedComplaint.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Citizen: {selectedComplaint.citizenId?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge>{selectedComplaint.status}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Component */}
                <div className="flex-1">
                  <Chat complaintId={selectedComplaint._id} />
                </div>
              </div>
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
