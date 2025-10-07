import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { format } from 'date-fns';
import useApi from '@/hooks/useApi';
import { useToast } from './ui/use-toast';

const ComplaintTimeline = ({ isEditable, complaintId, timeline = [] }) => {
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');

  // Update timeline when prop changes
  useEffect(() => {
    if (timeline && timeline.length > 0) {
      setTimelineEvents(timeline);
    }
  }, [timeline]);

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) {
      toast({
        title: 'Update required',
        description: 'Please enter update details',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await request(`/api/complaints/${complaintId}/timeline`, 'PUT', {
        action: 'Progress Update',
        status: 'In Progress',
        notes: newUpdate.trim(),
      });

      if (result.success) {
        // Add the new event to local state
        const newEvent = {
          action: 'Progress Update',
          status: 'In Progress',
          notes: newUpdate.trim(),
          updatedBy: 'You',
          createdAt: new Date().toISOString(),
        };
        setTimelineEvents([...timelineEvents, newEvent]);
        setNewUpdate('');

        toast({
          title: 'Update added',
          description: 'Timeline updated successfully',
        });
      }
    } catch (err) {
      toast({
        title: 'Failed to add update',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Complaint Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {timelineEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No timeline events yet
          </div>
        ) : (
          <div className="relative pl-8">
            {timelineEvents.map((event, index) => (
              <div key={index} className="mb-8 last:mb-0">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-950" />
                {index !== timelineEvents.length - 1 && (
                  <div className="absolute h-full w-0.5 bg-gray-200 dark:bg-gray-700 left-0 top-0" />
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(event.createdAt)}
                </p>
                <h3 className="font-semibold text-lg">
                  {event.action || event.status || 'Update'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {event.notes || event.description || `Status: ${event.status}`}
                </p>
                {event.updatedBy && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    - {typeof event.updatedBy === 'object' ? event.updatedBy.name : event.updatedBy}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {isEditable && (
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-2">Add New Update</h3>
            <Textarea
              placeholder="Enter update details (e.g., 'Work started on fixing the issue')"
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              className="mb-2 glass-input"
              rows={3}
            />
            <Button
              onClick={handleAddUpdate}
              loading={isLoading}
              disabled={!newUpdate.trim()}
            >
              Add Update
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplaintTimeline;
