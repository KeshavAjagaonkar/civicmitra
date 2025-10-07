import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useAuth } from '@/hooks/useAuth';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Briefcase, Award, Calendar, Loader2, AlertTriangle, UserPlus, CheckCircle } from 'lucide-react';

const WorkerManagement = () => {
  const { user } = useAuth();
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assignment dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [unassignedComplaints, setUnassignedComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch workers from the staff's department
      const departmentId = user?.department?._id || user?.department;
      const response = await request(`/api/admin/users?role=worker&department=${departmentId}`, 'GET');

      if (response.success) {
        setWorkers(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
      setError(err.message || 'Failed to fetch workers');
      toast({
        title: 'Error',
        description: 'Failed to load workers. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.department) {
      fetchWorkers();
    }
  }, [user]);

  const fetchUnassignedComplaints = async () => {
    try {
      const response = await request('/api/complaints/all', 'GET');
      if (response.success) {
        // Filter complaints that don't have a worker assigned yet
        const unassigned = response.data.filter(c => !c.workerId && c.status !== 'Resolved' && c.status !== 'Closed');
        setUnassignedComplaints(unassigned);
      }
    } catch (err) {
      console.error('Failed to fetch unassigned complaints:', err);
    }
  };

  const handleOpenAssignDialog = async (worker) => {
    setSelectedWorker(worker);
    setSelectedComplaint('');
    await fetchUnassignedComplaints();
    setAssignDialogOpen(true);
  };

  const handleAssignWorker = async () => {
    if (!selectedComplaint || !selectedWorker) {
      toast({
        title: 'Selection Required',
        description: 'Please select a complaint to assign.',
        variant: 'destructive'
      });
      return;
    }

    setAssigning(true);
    try {
      const response = await request(
        `/api/complaints/${selectedComplaint}/assign-worker`,
        'PATCH',
        { workerId: selectedWorker._id }
      );

      if (response.success) {
        toast({
          title: 'Success!',
          description: `Complaint assigned to ${selectedWorker.name} successfully.`
        });
        setAssignDialogOpen(false);
        setSelectedComplaint('');
        await fetchUnassignedComplaints(); // Refresh the list
      }
    } catch (err) {
      toast({
        title: 'Assignment Failed',
        description: err.message || 'Failed to assign worker. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAssigning(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
        Inactive
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg">Loading workers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-50 text-red-700 rounded-lg p-8">
        <AlertTriangle className="w-10 h-10 mb-2" />
        <h3 className="text-lg font-semibold">Failed to load workers</h3>
        <p className="text-sm">{error}</p>
        <Button onClick={fetchWorkers} variant="destructive" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Worker Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage workers in {user?.department?.name || 'your department'}
          </p>
        </div>
        <Button onClick={fetchWorkers} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Workers</CardTitle>
            <User className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workers.length}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Workers</CardTitle>
            <User className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {workers.filter(w => w.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Department</CardTitle>
            <Briefcase className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{user?.department?.name || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Workers Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Department Workers</CardTitle>
        </CardHeader>
        <CardContent>
          {workers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Workers Found</h3>
              <p>There are no workers assigned to your department yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Worker ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{worker.name}</p>
                            <p className="text-xs text-gray-500">{worker.workerId || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {worker.workerId || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span className="text-xs">{worker.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span className="text-xs">{worker.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-gray-500" />
                          <span>{worker.specialization || 'General'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{worker.experienceYears || 0} years</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(worker.isActive)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenAssignDialog(worker)}
                          disabled={!worker.isActive}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assign Task
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Assign Task to Worker
            </DialogTitle>
            <DialogDescription>
              Select an unassigned complaint to assign to {selectedWorker?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Worker Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {selectedWorker?.name}
                </span>
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p>Specialization: {selectedWorker?.specialization || 'General'}</p>
                <p>Experience: {selectedWorker?.experienceYears || 0} years</p>
              </div>
            </div>

            {/* Complaint Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Complaint</label>
              <Select value={selectedComplaint} onValueChange={setSelectedComplaint}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a complaint to assign..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedComplaints.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No unassigned complaints available
                    </div>
                  ) : (
                    unassignedComplaints.map((complaint) => (
                      <SelectItem key={complaint._id} value={complaint._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{complaint.title}</span>
                          <span className="text-xs text-gray-500">
                            {complaint.location} • {complaint.priority} Priority • {complaint.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Showing {unassignedComplaints.length} unassigned complaint(s) in your department
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                className="flex-1"
                disabled={assigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignWorker}
                className="flex-1"
                disabled={!selectedComplaint || assigning}
                loading={assigning}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Assign Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerManagement;
