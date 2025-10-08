import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import ComplaintTimeline from '@/components/ComplaintTimeline';
import Chat from '@/components/Chat';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import FormFieldBox from '@/components/FormFieldBox';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { useAuth } from '@/hooks/useAuth';

const statusVariant = {
  Submitted: 'secondary',
  'In Progress': 'default',
  Resolved: 'outline',
  Closed: 'destructive',
};

const priorityStyles = {
  High: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  Low: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
};

const ComplaintDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [assignedWorker, setAssignedWorker] = useState('');
  const [workers, setWorkers] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [userRole, setUserRole] = useState(() => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/staff')) return 'staff';
    if (location.pathname.startsWith('/worker')) return 'worker';
    return 'citizen';
  });

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const result = await request(`/api/complaints/${id}`);
        if (result.success) {
          setComplaint(result.data);
          setCurrentStatus(result.data.status);
          setAssignedWorker(result.data.workerId || 'unassigned');

          // Fetch feedback if complaint is resolved
          if (result.data.status === 'Resolved') {
            const feedbackResult = await request(`/api/feedback/${id}`);
            if (feedbackResult.success) {
              setFeedback(feedbackResult.data);
            }
          }
        }
      } catch (err) {
        toast({
          title: 'Failed to fetch complaint',
          description: err.message,
          variant: 'destructive'
        });
      }
    };

    if (id) {
      fetchComplaint();
    }
  }, [id, request, toast, userRole]);

  // Fetch workers after complaint is loaded
  useEffect(() => {
    if (complaint && (userRole === 'staff' || userRole === 'admin')) {
      const fetchWorkers = async () => {
        try {
          let endpoint = '/api/admin/users?role=worker';
          if (userRole === 'staff' && complaint?.department?._id) {
            endpoint += `&department=${complaint.department._id}`;
          }
          const result = await request(endpoint, 'GET');
          if (result.success) {
            setWorkers(result.data);
          }
        } catch (err) {
          console.error('Failed to fetch workers:', err);
        }
      };
      fetchWorkers();
    }
  }, [complaint, userRole, request]);

  const handleStatusChange = async (value) => {
    try {
      const result = await request(`/api/complaints/${id}/timeline`, 'PUT', {
        action: 'Status Update',
        status: value,
        notes: `Status changed to ${value}`
      });
      if (result.success) {
    setCurrentStatus(value);
        setComplaint(prev => ({ ...prev, status: value }));
        toast({ 
          title: 'Status updated', 
          description: 'Complaint status has been updated successfully.',
          variant: 'success'
        });
      }
    } catch (err) {
      toast({ 
        title: 'Failed to update status', 
        description: err.message, 
        variant: 'destructive' 
      });
    }
  };

  const handleWorkerChange = async (value) => {
    try {
      const workerId = value === 'unassigned' ? null : value;
      const result = await request(`/api/complaints/${id}/assign-worker`, 'PATCH', {
        workerId: workerId
      });
      if (result.success) {
        setAssignedWorker(value);
        setComplaint(prev => ({ ...prev, workerId: workerId }));
        toast({
          title: workerId ? 'Worker assigned' : 'Worker unassigned',
          description: workerId ? 'Worker has been assigned successfully.' : 'Worker has been unassigned.',
          variant: 'success'
        });
      }
    } catch (err) {
      toast({
        title: 'Failed to assign worker',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading complaint details...</div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Complaint not found</h3>
            <p className="text-gray-600">The complaint you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{complaint.title}</h1>
            <p className="text-gray-500">Complaint ID: {id}</p>
          </div>
        </div>
        {userRole === 'citizen' && complaint.status === 'Resolved' && !feedback && (
          <Button
            onClick={() => navigate(`/complaints/${id}/feedback`)}
            className="flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Give Feedback
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Left Column: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white/50 dark:bg-gray-900/50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <strong>Status:</strong>
                {(userRole === 'staff' || userRole === 'worker') ? (
                  <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px] glass-input">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={statusVariant[complaint.status]}>{complaint.status}</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <strong>Priority:</strong>
                <Badge variant="outline" className={priorityStyles[complaint.priority]}>
                  {complaint.priority}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <strong>Department:</strong>
                <span>{complaint.department?.name || 'Auto-assigned'}</span>
              </div>
              {(userRole === 'staff' || userRole === 'admin') && (
                <div className="flex justify-between items-center">
                  <strong>Assigned Worker:</strong>
                  <Select value={assignedWorker} onValueChange={handleWorkerChange}>
                    <SelectTrigger className="w-[180px] glass-input">
                      <SelectValue placeholder="Assign worker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {workers.map((worker) => (
                        <SelectItem key={worker._id} value={worker._id}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-between">
                <strong>Date Filed:</strong>
                <span>{formatDate(complaint.createdAt)}</span>
              </div>
              <div>
                <strong>Description:</strong>
                <p className="text-gray-600 mt-1">{complaint.description}</p>
              </div>
              <div>
                <strong>Location:</strong>
                <p className="text-gray-600 mt-1">{complaint.location}</p>
              </div>
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div>
                  <strong>Attachments:</strong>
                  <div className="mt-2 space-y-2">
                    {complaint.attachments.map((attachment, index) => (                      <div key={index} className="flex items-center gap-2">                        <img                          src={attachment.url}                          alt={`Attachment ${index + 1}`}                          className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform hover:shadow-lg"                          onClick={() => setSelectedImage(attachment.url)}                        />                      </div>                    ))}
                  </div>
                </div>
              )}
              {feedback && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <strong>Citizen Feedback:</strong>
                  <div className="mt-2 space-y-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Rating:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < feedback.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({feedback.rating}/5)
                      </span>
                    </div>
                    {feedback.comments && (
                      <div>
                        <span className="font-medium">Comments:</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{feedback.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <ComplaintTimeline 
            isEditable={userRole === 'worker'} 
            complaintId={complaint._id}
            timeline={complaint.timeline}
          />
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-1">
          <Chat complaintId={complaint._id} />
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl glass-card">
          <DialogTitle>Attachment Preview</DialogTitle>
          {selectedImage && (
            <div className="flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Full size attachment"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintDetails;
