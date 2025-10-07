import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Eye, Clock, CheckCircle, AlertCircle, Filter, Search, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useWorkerData from '@/hooks/useWorkerData'; // 1. Import the hook for worker data

const AssignedTasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 2. Use the hook to fetch live data, loading, and error states
  const { assignedComplaints: complaints, loading, error, refetch, stats } = useWorkerData();

  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // This useEffect will now run whenever the live 'complaints' data changes
  useEffect(() => {
    let filtered = complaints || [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    setFilteredComplaints(filtered);
  }, [complaints, searchTerm, statusFilter, priorityFilter]);

  // Helper functions remain the same
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Submitted': return 'secondary';
      case 'In Progress': return 'default';
      case 'Resolved': return 'outline';
      case 'Closed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted': return <Clock className="w-4 h-4" />;
      case 'In Progress': return <AlertCircle className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (estimatedCompletion) => {
    if (!estimatedCompletion) return 'N/A';
    const now = new Date();
    const completion = new Date(estimatedCompletion);
    const diffTime = completion - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Assigned Tasks</h1>
        <Button onClick={() => navigate('/worker')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Stats Cards - Now using live stats from the hook */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
         <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Today</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger><SelectValue placeholder="All Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 3. Render Loading and Error states */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="ml-3 text-lg">Loading your assigned tasks...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 text-red-700 rounded-lg">
          <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
          <h3 className="font-semibold">Failed to load tasks</h3>
          <p className="text-sm">{error}</p>
          <Button onClick={refetch} variant="destructive" className="mt-4">Try Again</Button>
        </div>
      ) : (
      
      /* 4. Map over filtered LIVE data */
      <div className="grid gap-6">
        {filteredComplaints.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-gray-600">No tasks match your current filters. Great job!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => (
            <Card key={complaint._id} className="glass-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{complaint.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getStatusVariant(complaint.status)}>{complaint.status}</Badge>
                    <Badge variant="outline" className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">{complaint.description}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <p><strong>Location:</strong> {complaint.location}</p>
                    <p><strong>Category:</strong> {complaint.category}</p>
                    <p><strong>Citizen:</strong> {complaint.citizenId?.name || 'N/A'}</p>
                    <p><strong>Assigned:</strong> {formatDate(complaint.assignedDate)}</p>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/worker/tasks/${complaint._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View & Update Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      )}
    </div>
  );
};

export default AssignedTasks;
