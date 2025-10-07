import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, MapPin, User, Calendar, Phone, Mail, Camera, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi'; // 1. Import useApi hook

const TaskDetails = () => {
  const { id: taskId } = useParams(); // Renamed to 'id' to match the route param in App.jsx
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { request, isLoading: isApiLoading } = useApi(); // Use the API hook

  const [complaint, setComplaint] = useState(null);
  const [newUpdate, setNewUpdate] = useState('');
  const [newStatus, setNewStatus] = useState('In Progress');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'details');

  // 2. Fetch complaint data from the backend when the component mounts
  const fetchTaskDetails = async () => {
    try {
      const response = await request(`/api/complaints/${taskId}`);
      if (response.success) {
        setComplaint(response.data);
        // Set the initial status for the update form based on fetched data
        if (response.data.status !== 'Resolved' && response.data.status !== 'Closed') {
          setNewStatus(response.data.status);
        }
      }
    } catch (error) {
      toast({
        title: "Error fetching task",
        description: error.message || "Could not load the details for this task.",
        variant: "destructive",
      });
      navigate('/worker/tasks'); // Redirect if task can't be found
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  // Helper functions
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Submitted': return 'secondary';
      case 'In Progress': return 'default';
      case 'Resolved': return 'outline';
      case 'Closed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 3. Connect the update form to the backend API
  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) {
       toast({ title: "Update notes cannot be empty.", variant: "destructive" });
       return;
    }
    try {
      const response = await request(`/api/complaints/${taskId}/worker-update`, {
        method: 'PUT',
        body: {
          status: newStatus,
          notes: newUpdate,
        },
      });

      if (response.success) {
        toast({ title: 'Progress update saved successfully!' });
        setNewUpdate('');
        fetchTaskDetails(); // Refetch data to show the new timeline event
        setActiveTab('timeline'); // Switch to timeline to show the update
      }
    } catch (error) {
      toast({
        title: 'Error Saving Update',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  // 4. Render loading and error states
  if (isApiLoading && !complaint) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="ml-4 text-lg">Loading Task Details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Task Not Found</h2>
        <p className="text-gray-500">The requested task could not be loaded.</p>
        <Button onClick={() => navigate('/worker/tasks')} className="mt-4">Back to Tasks</Button>
      </div>
    );
  }

  // 5. Render dynamic data from the 'complaint' state object
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/worker/tasks')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{complaint.title}</h1>
          <p className="text-gray-500">Task ID: {complaint._id.slice(-8)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Badge variant={getStatusVariant(complaint.status)} className="text-base px-4 py-2">{complaint.status}</Badge>
        <Badge variant="outline" className={`${getPriorityColor(complaint.priority)} text-base px-4 py-2`}>{complaint.priority} Priority</Badge>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[{ id: 'details', label: 'Task Details' }, { id: 'update', label: 'Update Progress' }, { id: 'timeline', label: 'Timeline' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'details' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader><CardTitle>Task Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><h4 className="font-medium">Description</h4><p className="text-gray-600 dark:text-gray-400">{complaint.description}</p></div>
                <div><h4 className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" />Location</h4><p className="text-gray-600 dark:text-gray-400">{complaint.location}</p></div>
                <div><h4 className="font-medium">Category</h4><p>{complaint.category}</p></div>
                <div><h4 className="font-medium">Department</h4><p>{complaint.department?.name || 'N/A'}</p></div>
                <div><h4 className="font-medium">Assigned On</h4><p>{formatDate(complaint.createdAt)}</p></div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Citizen Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Name:</strong> {complaint.citizenId?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {complaint.citizenId?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {complaint.citizenId?.phone || 'N/A'}</p>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" />Attachments</CardTitle></CardHeader>
              <CardContent>
                {complaint.attachments && complaint.attachments.length > 0 ? (
                  <div className="grid gap-4">
                    {complaint.attachments.map((attachment, index) => (
                      <a key={attachment.public_id} href={attachment.url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden">
                        <img src={attachment.url} alt={`Attachment ${index + 1}`} className="w-full h-40 object-cover" />
                      </a>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-center py-8">No attachments provided.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'update' && (
        <div className="max-w-2xl">
          <Card className="glass-card">
            <CardHeader><CardTitle>Add a Progress Update</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="block text-sm font-medium mb-2">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Update Notes</Label>
                <Textarea placeholder="Describe the work done, issues found, etc." value={newUpdate} onChange={(e) => setNewUpdate(e.target.value)} rows={5} />
              </div>
              <Button onClick={handleAddUpdate} loading={isApiLoading} disabled={!newUpdate.trim()} className="w-full" loadingText="Saving...">
                Save Update
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="max-w-4xl">
          <Card className="glass-card">
            <CardHeader><CardTitle>Task Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700">
                {complaint.timeline && complaint.timeline.length > 0 ? (
                  complaint.timeline.slice().reverse().map((event) => (
                    <div key={event._id} className="mb-8 last:mb-0">
                      <div className="absolute w-4 h-4 bg-blue-500 rounded-full mt-1.5 -left-[9px] border-2 border-white dark:border-gray-800" />
                      <p className="text-sm text-gray-500">{formatDate(event.createdAt)}</p>
                      <h3 className="font-semibold text-lg">{event.action} by {event.updatedBy?.name || 'System'}</h3>
                      <p className="text-gray-700 dark:text-gray-300">{event.notes}</p>
                    </div>
                  ))
                ) : <p className="text-gray-500">No timeline events yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
