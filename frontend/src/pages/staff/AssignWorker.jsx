import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';
import { Loader2, AlertTriangle, User, ArrowLeft } from 'lucide-react';

const AssignWorker = () => {
  const { id: complaintId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { request, isLoading } = useApi();

  const [complaint, setComplaint] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch complaint details and then available workers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch the specific complaint
        const complaintRes = await request(`/api/complaints/${complaintId}`);
        if (complaintRes.success) {
          setComplaint(complaintRes.data);
          
          // 2. Once we have the complaint, fetch workers from that department
          if (complaintRes.data.department) {
            const departmentId = complaintRes.data.department._id;
            const workersRes = await request(`/api/admin/users?role=worker&department=${departmentId}`);
            if (workersRes.success) {
              setWorkers(workersRes.data);
            }
          }
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load necessary data.", variant: "destructive" });
      }
    };
    fetchData();
  }, [complaintId, request, toast]);

  // Handle the assignment submission
  const handleAssign = async () => {
    if (!selectedWorkerId) {
      toast({ title: "No worker selected", description: "Please select a worker to assign.", variant: "destructive" });
      return;
    }
    setIsAssigning(true);
    try {
      const response = await request(
        `/api/complaints/${complaintId}/assign-worker`,
        'PATCH',
        { workerId: selectedWorkerId }
      );
      if (response.success) {
        toast({ title: "Success!", description: `Worker has been assigned to complaint #${complaint._id.slice(-6)}.` });
        navigate('/staff/complaints');
      }
    } catch (error) {
      toast({ title: "Assignment Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading && !complaint) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!complaint) {
    return <div className="text-center py-12"><AlertTriangle className="mx-auto h-8 w-8 text-red-500" /><p className="mt-2">Complaint not found.</p></div>;
  }

  return (
    <div className="space-y-8">
       <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      <Card className="form-container-card max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Assign Worker</CardTitle>
          <CardDescription>Assign an available worker to resolve this complaint.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <h4 className="font-semibold">{complaint.title}</h4>
            <p className="text-sm text-gray-500">{complaint.location}</p>
            <p className="text-sm text-gray-500">Department: {complaint.department?.name}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="worker" className="font-medium">Available Workers</label>
            <Select onValueChange={setSelectedWorkerId} value={selectedWorkerId}>
              <SelectTrigger id="worker" className="glass-input">
                <SelectValue placeholder="Select an available worker..." />
              </SelectTrigger>
              <SelectContent>
                {workers.length > 0 ? (
                  workers.map(worker => (
                    <SelectItem key={worker._id} value={worker._id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        {worker.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No workers found in this department.</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAssign} className="w-full" loading={isAssigning} disabled={!selectedWorkerId}>
            Confirm Assignment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignWorker;
