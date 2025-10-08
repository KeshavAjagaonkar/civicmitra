import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  Search, Filter, Eye, UserPlus, Clock, CheckCircle, AlertCircle, User, MessageSquare, Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';

const ComplaintManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { request } = useApi();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [workerFilter, setWorkerFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Get the base path with department slug
  const departmentSlug = user?.department?.slug;
  const basePath = departmentSlug ? `/${departmentSlug}/staff` : '/staff';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const complaintsRes = await request('/api/complaints/all');
        if (complaintsRes?.success) {
          setComplaints(complaintsRes.data || []);
          setFilteredComplaints(complaintsRes.data || []);
        }
        if (user?.department) {
          const deptId = user.department._id || user.department;
          const workersRes = await request('/api/admin/users?role=worker&department=' + deptId);
          if (workersRes?.success) {
            setWorkers(workersRes.data || []);
          }
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load complaints and workers', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, request, toast]);
  useEffect(() => {
    let filtered = complaints;
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.citizenId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }
    if (workerFilter !== 'all') {
      if (workerFilter === 'unassigned') {
        filtered = filtered.filter(complaint => !complaint.workerId);
      } else {
        filtered = filtered.filter(complaint =>
          complaint.workerId?._id === workerFilter || complaint.workerId === workerFilter
        );
      }
    }
    setFilteredComplaints(filtered);
  }, [complaints, searchTerm, statusFilter, priorityFilter, workerFilter]);

  const getStatusVariant = (status) => {
    const variants = { 'Submitted': 'secondary', 'In Progress': 'default', 'Resolved': 'outline', 'Closed': 'destructive' };
    return variants[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = { 'Submitted': Clock, 'In Progress': AlertCircle, 'Resolved': CheckCircle };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800 border-red-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getDaysRemaining = (estimatedResolution) => {
    if (!estimatedResolution) return 'N/A';
    const diffDays = Math.ceil((new Date(estimatedResolution) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getComplaintStats = () => {
    const total = complaints.length;
    const submitted = complaints.filter(c => c.status === 'Submitted').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const unassigned = complaints.filter(c => !c.workerId).length;
    return { total, submitted, inProgress, resolved, unassigned };
  };

  const stats = getComplaintStats();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Complaint Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Department: {user?.department?.name || 'N/A'}</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Submitted</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.submitted}</div></CardContent>
        </Card>
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.inProgress}</div></CardContent>
        </Card>
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.resolved}</div></CardContent>
        </Card>
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Unassigned</CardTitle>
            <User className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-red-600">{stats.unassigned}</div></CardContent>
        </Card>
      </div>
      <Card className="glass-card">
        <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" />Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search complaints..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
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
            <div>
              <label className="block text-sm font-medium mb-2">Worker</label>
              <Select value={workerFilter} onValueChange={setWorkerFilter}>
                <SelectTrigger><SelectValue placeholder="All Workers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workers</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {workers.map((worker) => (
                    <SelectItem key={worker._id} value={worker._id}>{worker.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); setWorkerFilter('all'); }} className="w-full">Clear Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No complaints found</h3>
                <p className="text-gray-600">No complaints match your current filters.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => (
            <Card key={complaint._id} className="glass-card">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-lg">{complaint.title}</h4>
                      <p className="text-sm text-gray-500">ID: {complaint._id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getStatusVariant(complaint.status)} className="flex items-center gap-1">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(complaint.status)}
                          {complaint.status}
                        </span>
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{complaint.description}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Complaint Details</h5>
                      <div className="space-y-1 text-sm">
                        <p><strong>Category:</strong> {complaint.category}</p>
                        <p><strong>Location:</strong> {complaint.location}</p>
                        <p><strong>Citizen:</strong> {complaint.citizenId?.name} ({complaint.citizenId?.email})</p>
                        {complaint.workerId ? (
                          <p><strong>Assigned Worker:</strong> {complaint.workerId?.name || 'Unknown'}</p>
                        ) : (
                          <p><strong>Assigned Worker:</strong> <span className="text-red-600">Unassigned</span></p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Timeline</h5>
                      <div className="space-y-1 text-sm">
                        <p><strong>Created:</strong> {formatDate(complaint.createdAt)}</p>
                        <p><strong>Updated:</strong> {formatDate(complaint.updatedAt)}</p>
                        {complaint.estimatedResolution && (
                          <>
                            <p><strong>Est. Resolution:</strong> {formatDate(complaint.estimatedResolution)}</p>
                            <p><strong>Days Remaining:</strong>
                              <span className={getDaysRemaining(complaint.estimatedResolution) < 0 ? 'text-red-600' : 'text-green-600'}>
                                {getDaysRemaining(complaint.estimatedResolution) < 0
                                  ? ' Overdue by ' + Math.abs(getDaysRemaining(complaint.estimatedResolution)) + ' days'
                                  : ' ' + getDaysRemaining(complaint.estimatedResolution) + ' days'
                                }
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => navigate(`${basePath}/complaints/${complaint._id}`)}>
                      <Eye className="w-4 h-4 mr-2" />View Details
                    </Button>
                    {!complaint.workerId ? (
                      <Button size="sm" onClick={() => navigate(`${basePath}/complaints/${complaint._id}/assign`)}>
                        <UserPlus className="w-4 h-4 mr-2" />Assign Worker
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => navigate(`${basePath}/complaints/${complaint._id}/edit-assignment`)}>
                        <User className="w-4 h-4 mr-2" />Reassign Worker
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => navigate(`${basePath}/chat?complaintId=${complaint._id}`)}>
                      <MessageSquare className="w-4 h-4 mr-2" />Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ComplaintManagement;
