import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { format } from 'date-fns';
import useApi from '@/hooks/useApi';
import { useToast } from './ui/use-toast';
import { ImagePlus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './ui/Dialog';

const ComplaintTimeline = ({ isEditable, complaintId, timeline = [] }) => {
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Update timeline when prop changes
  useEffect(() => {
    if (timeline && timeline.length > 0) {
      setTimelineEvents(timeline);
    }
  }, [timeline]);

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
      const formData = new FormData();
      formData.append('status', 'In Progress');
      formData.append('notes', newUpdate.trim());

      // Add selected files
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const result = await request(`/api/complaints/${complaintId}/timeline`, 'PUT', formData, true);

      if (result.success) {
        setTimelineEvents(result.data.timeline || timelineEvents);
        setNewUpdate('');
        setSelectedFiles([]);
        setPreviewImages([]);

        toast({
          title: 'Update added',
          description: 'Timeline updated successfully',
        });

        // Reload page to show updated timeline
        window.location.reload();
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
                {event.attachments && event.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.attachments.map((attachment, idx) => (
                      <img
                        key={idx}
                        src={attachment.url}
                        alt={`Update photo ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform hover:shadow-lg"
                        onClick={() => setSelectedImage(attachment.url)}
                      />
                    ))}
                  </div>
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

            {/* Photo Upload Section */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 mb-2">
                <ImagePlus className="w-5 h-5" />
                <span>Attach Photos (Optional, max 5)</span>
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
                <div className="flex flex-wrap gap-2">
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

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl glass-card">
          <DialogTitle>Photo Preview</DialogTitle>
          {selectedImage && (
            <div className="flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Full size preview"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ComplaintTimeline;
