import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, MapPin, User, Calendar, Phone, Mail, Camera, FileText, Loader2, AlertTriangle, ImagePlus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi'; // 1. Import useApi hook
import ComplaintTimeline from '@/components/ComplaintTimeline';

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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast({
        title: 'Too many files',
        description: 'Maximum 5 photos allowed per update',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);

    // Generate preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);

    // Revoke the URL to free memory
    URL.revokeObjectURL(previewImages[index]);

    setSelectedFiles(newFiles);
    setPreviewImages(newPreviews);
  };

  // 3. Connect the update form to the backend API
  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) {
       toast({ title: "Update notes cannot be empty.", variant: "destructive" });
       return;
    }
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('notes', newUpdate.trim());

      // Add selected files
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await request(
        `/api/complaints/${taskId}/worker-update`,
        'PUT',
        formData,
        true // isFormData flag
      );

      if (response.success) {
        toast({ title: 'Progress update saved successfully!' });
        setNewUpdate('');
        setSelectedFiles([]);
        setPreviewImages([]);
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
        <Button variant="outline" size="sm" onClick={() => navigate('/worker')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{complaint.title}</h1>
          <p className="text-gray-500">Assignment ID: {complaint._id.slice(-8)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Badge variant={getStatusVariant(complaint.status)} className="text-base px-4 py-2">{complaint.status}</Badge>
        <Badge variant="outline" className={`${getPriorityColor(complaint.priority)} text-base px-4 py-2`}>{complaint.priority} Priority</Badge>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[{ id: 'details', label: 'Assignment Details' }, { id: 'update', label: 'Update Progress' }, { id: 'timeline', label: 'Work History' }].map((tab) => (
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
              <CardHeader><CardTitle>Field Assignment Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><h4 className="font-medium">Issue Description</h4><p className="text-gray-600 dark:text-gray-400">{complaint.description}</p></div>
                <div><h4 className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" />Field Location</h4><p className="text-gray-600 dark:text-gray-400">{complaint.location}</p></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><h4 className="font-medium">Category</h4><p>{complaint.category}</p></div>
                  <div><h4 className="font-medium">Department</h4><p>{complaint.department?.name || 'N/A'}</p></div>
                </div>
                <div><h4 className="font-medium">Assigned On</h4><p>{formatDate(complaint.createdAt)}</p></div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Citizen Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Name:</strong> {complaint.citizenId?.name || 'N/A'}</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /><strong>Email:</strong> {complaint.citizenId?.email || 'N/A'}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /><strong>Phone:</strong> {complaint.citizenId?.phone || 'N/A'}</p>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Record Field Work Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Document your field work here. This update will be visible to the citizen and staff.
                </p>
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Work Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Progress">In Progress (Work ongoing)</SelectItem>
                    <SelectItem value="Resolved">Resolved (Work completed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">Work Details *</Label>
                <Textarea
                  placeholder="E.g., 'Inspection completed', 'Materials gathered', 'Work in progress', 'Issue resolved', etc."
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">Describe what work was done, any issues encountered, and next steps if applicable.</p>
              </div>

              {/* Photo Upload Section */}
              <div>
                <Label className="block text-sm font-medium mb-2">Attach Progress Photos (Optional)</Label>
                <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <ImagePlus className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload photos (Max 5)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>

                {/* Preview Selected Images */}
                {previewImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleAddUpdate} loading={isApiLoading} disabled={!newUpdate.trim()} className="w-full" loadingText="Saving...">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Progress Update
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="max-w-4xl">
          <ComplaintTimeline
            isEditable={true}
            complaintId={taskId}
            timeline={complaint.timeline || []}
          />
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
