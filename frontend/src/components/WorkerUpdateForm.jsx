import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Label } from './ui/Label';
import { CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';

const WorkerUpdateForm = ({ complaint, onUpdate, onClose }) => {
  const [status, setStatus] = useState(complaint.status);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { request } = useApi();
  const { toast } = useToast();

  const statusOptions = [
    { value: 'In Progress', label: 'In Progress', icon: Clock, color: 'text-blue-600' },
    { value: 'Resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-600' },
    { value: 'Closed', label: 'Closed', icon: AlertCircle, color: 'text-red-600' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      toast({
        title: 'Update Required',
        description: 'Please provide notes about your progress.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await request(`/api/complaints/${complaint._id}/worker-update`, 'PUT', {
        status,
        notes: notes.trim()
      });

      if (response?.success) {
        toast({
          title: 'Update Successful',
          description: 'Complaint status has been updated successfully.',
          variant: 'default'
        });
        
        if (onUpdate) {
          onUpdate(response.data);
        }
        
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update complaint status.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (statusValue) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    if (option) {
      const IconComponent = option.icon;
      return <IconComponent className={`h-4 w-4 ${option.color}`} />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          Update Complaint Status
        </CardTitle>
        <CardDescription>
          Update the progress and status of: <strong>{complaint.title}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status Display */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Status:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(complaint.status)}
                  <span className="font-medium">{complaint.status}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                ID: {complaint._id?.slice(-8) || 'N/A'}
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Progress Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Progress Notes *</Label>
            <Textarea
              id="notes"
              placeholder="Describe the work done, current progress, or resolution details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              Provide detailed information about your progress or the work completed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || !notes.trim()}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Update Status
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkerUpdateForm;