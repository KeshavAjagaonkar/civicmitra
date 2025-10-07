import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, CheckCircle, Clock, Eye, MessageCircle, CheckSquare, User, BarChart3, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import useWorkerData from '@/hooks/useWorkerData';
import { useAuth } from '@/hooks/useAuth';

// Renamed for clarity and now uses API calls
const ProgressUpdateForm = ({ complaint, onUpdateSuccess }) => {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('In Progress');
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAddUpdate = async () => {
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide details about the progress update.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await request(`/api/complaints/${complaint._id}/worker-update`, {
        method: 'PUT',
        body: {
          status,
          notes,
        },
      });

      if (response.success) {
        toast({
          title: 'Update Added',
          description: 'Progress update has been recorded successfully.',
        });
        setNotes(''); // Clear form
        if (onUpdateSuccess) {
          onUpdateSuccess(); // Notify parent to refetch data
        }
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save the update. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Update Progress for: {complaint.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h4 className="font-medium mb-3">Add Progress Update</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border rounded-md glass-input"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Update Details</label>
                <textarea
                  placeholder="Describe what you've done, any issues, or next steps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border rounded-md glass-input"
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleAddUpdate}
                loading={isLoading}
                disabled={!notes.trim()}
                className="w-full"
                loadingText="Adding..."
              >
                Add Update
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { assignedComplaints: complaints, loading, error, refetch, stats: workerStats } = useWorkerData();
  const [selectedComplaint, setSelectedComplaint] = useState(null);

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const kpiData = [
    { title: 'Assigned Tasks', value: workerStats.total.toString(), icon: FileText, color: 'text-blue-500' },
    { title: 'In Progress', value: workerStats.inProgress.toString(), icon: Clock, color: 'text-orange-500' },
    { title: 'Completed Today', value: workerStats.completedToday.toString(), icon: CheckCircle, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Worker Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Welcome, {user?.name}! Manage your assigned tasks here.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="kpi-card-solid hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{kpi.title}</CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      {/* My Assigned Tasks */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>My Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading assigned tasks...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-8 text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="ml-2">Error: {error}</span>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tasks assigned to you yet. Great job!
                  </div>
                ) : (
                  complaints.map((complaint) => (
                    <div key={complaint._id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{complaint.title}</h4>
                        <div className="flex gap-2">
                          <Badge variant={getStatusVariant(complaint.status)}>
                            {complaint.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {complaint.description.substring(0, 100)}...
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{complaint.location}</span>
                        <span>Filed on: {formatDate(complaint.createdAt)}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Update Progress
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/worker/tasks/${complaint._id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Update Progress Panel */}
        <div>
          {selectedComplaint ? (
             <ProgressUpdateForm 
                complaint={selectedComplaint}
                onUpdateSuccess={() => {
                  refetch(); // Refetch the list of complaints
                  setSelectedComplaint(null); // Close the form
                }}
              />
          ) : (
            <Card className="glass-card sticky top-24">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Select a Task to Update</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a complaint from the list on the left to add a progress update.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
