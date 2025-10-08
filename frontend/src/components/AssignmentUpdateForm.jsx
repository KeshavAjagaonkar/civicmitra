import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';
import { User } from 'lucide-react';

const AssignmentUpdateForm = ({ complaint, onUpdateSuccess, onCancel }) => {
  const { toast } = useToast();
  const { request, isLoading } = useApi();

  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState(complaint.workerId?._id || '');
  const [deadline, setDeadline] = useState(
    complaint.deadline ? new Date(complaint.deadline).toISOString().split('T')[0] : ''
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch workers from the same department
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        if (complaint.department) {
          const departmentId = complaint.department._id;
          const workersRes = await request(`/api/admin/users?role=worker&department=${departmentId}`);
          if (workersRes.success) {
            setWorkers(workersRes.data);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load workers.",
          variant: "destructive"
        });
      }
    };
    fetchWorkers();
  }, [complaint, request, toast]);

  const handleUpdate = async () => {
    const payload = {};
    let hasChanges = false;

    // Check if worker changed
    if (selectedWorkerId && selectedWorkerId !== complaint.workerId?._id) {
      payload.workerId = selectedWorkerId;
      hasChanges = true;
    }

    // Check if deadline changed
    if (deadline) {
      const currentDeadline = complaint.deadline
        ? new Date(complaint.deadline).toISOString().split('T')[0]
        : '';
      if (deadline !== currentDeadline) {
        payload.deadline = deadline;
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      toast({
        title: "No changes",
        description: "Please make changes before updating.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await request(
        `/api/complaints/${complaint._id}/update-assignment`,
        'PATCH',
        payload
      );
      if (response.success) {
        toast({
          title: "Success!",
          description: "Assignment has been updated successfully."
        });
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Update Assignment</CardTitle>
        <CardDescription>Modify worker assignment or deadline for this complaint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <h4 className="font-semibold">{complaint.title}</h4>
          <p className="text-sm text-gray-500">{complaint.location}</p>
          <p className="text-sm text-gray-500">Department: {complaint.department?.name}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="worker" className="font-medium">Assigned Worker</label>
          <Select onValueChange={setSelectedWorkerId} value={selectedWorkerId}>
            <SelectTrigger id="worker" className="glass-input">
              <SelectValue placeholder="Select a worker..." />
            </SelectTrigger>
            <SelectContent>
              {workers.length > 0 ? (
                workers.map(worker => (
                  <SelectItem key={worker._id} value={worker._id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      {worker.name} {worker._id === complaint.workerId?._id && '(Current)'}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  {isLoading ? 'Loading workers...' : 'No workers found in this department.'}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="deadline" className="font-medium">Deadline</label>
          <input
            type="date"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border rounded-md glass-input"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleUpdate}
            className="flex-1"
            loading={isUpdating}
          >
            Update Assignment
          </Button>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={isUpdating}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentUpdateForm;
