import React, { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Upload, FileText, ThumbsUp, AlertTriangle, MapPin } from 'lucide-react';
import LocationPicker from '@/components/LocationPicker';
import { useToast } from '@/components/ui/use-toast';
import { useDropzone } from 'react-dropzone';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';

// Schema matching backend requirements
const complaintSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(100, { message: 'Title can not be more than 100 characters' }),
  description: z.string().min(1, { message: 'Description is required' }).max(1000, { message: 'Description can not be more than 1000 characters' }),
  category: z.enum([
    'Roads',
    'Water Supply',
    'Sanitation',
    'Electricity',
    'Public Health',
    'Street Lights',
    'Drainage',
    'Garbage',
    'Other',
  ], { message: 'Please select a valid category' }),
  priority: z.enum(['Low', 'Medium', 'High'], { message: 'Please select a priority level' }),
  department: z.string().optional(),
  location: z.string().min(1, { message: 'Location is required' }),
  lng: z.number().optional(),
  lat: z.number().optional(),
  attachments: z.any().optional(),
});

const FileComplaint = () => {
  const { request, isLoading } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const result = await request('/api/departments');
        if (result.success) {
          setDepartments(result.data);
        }
      } catch (err) {
        toast({ title: 'Failed to fetch departments', description: err.message, variant: 'destructive' });
      }
    };
    fetchDepartments();
  }, [request, toast]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Other',
      priority: 'Medium',
      department: '',
      location: '',
      lng: undefined,
      lat: undefined,
    },
  });

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    setValue('attachments', acceptedFiles);
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const onSubmit = async (data) => {
    // Check for duplicates first
    setIsCheckingDuplicates(true);
    try {
      const checkRes = await request('/api/complaints/check-similar', 'POST', {
        title: data.title,
        description: data.description,
        category: data.category,
        lng: data.lng,
        lat: data.lat
      });

      if (checkRes.success && checkRes.matches && checkRes.matches.length > 0) {
        setDuplicateMatches(checkRes.matches);
        setPendingFormData(data); // Save the form data to submit if they override
        setIsDuplicateModalOpen(true);
        setIsCheckingDuplicates(false);
        return; // Stop the submission flow here
      }
    } catch (err) {
      // Duplicate check failed — proceed with submission anyway
      // If the duplicate check fails for some reason (e.g. Gemini quota), we still want them to be able to submit.
    }
    setIsCheckingDuplicates(false);

    // Proceed with submission if no duplicates or check failed
    await finalSubmit(data);
  };

  const finalSubmit = async (data) => {
    const formData = new FormData();
    for (const key in data) {
      if (key !== 'attachments') {
        const value = data[key];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      }
    }
    files.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      const result = await request('/api/complaints', 'POST', formData);

      if (result.success) {
        toast({
          title: 'Complaint submitted!',
          description: 'Your complaint has been successfully submitted.',
        });
        const complaintsPath = user?.slug ? `/${user.slug}/complaints` : '/complaints';
        navigate(complaintsPath);
      }
    } catch (err) {
      // Submission error handled by toast below
      toast({
        title: 'Submission failed',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-3 sm:px-0 pb-8">
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          File a New Complaint
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Help us improve your community by reporting issues that need attention.
        </p>
      </div>

      <Card className="card-elevated">
        <CardHeader className="text-center md:text-left">
          <CardTitle className="text-xl md:text-2xl flex items-center justify-center md:justify-start gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Complaint Details
          </CardTitle>
          <CardDescription className="text-base">
            Please provide as much detail as possible to help us resolve your issue quickly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 bg-transparent rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">Complaint Title *</label>
              <Input
                id="title"
                placeholder="e.g., Pothole on Main Street causing vehicle damage"
                className="glass-input"
                {...register('title')}
              />
              <p className="form-helper">Provide a clear, specific title for your complaint</p>
              {errors.title && <p className="form-error">⚠️ {errors.title.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Roads">Roads</SelectItem>
                      <SelectItem value="Water Supply">Water Supply</SelectItem>
                      <SelectItem value="Sanitation">Sanitation</SelectItem>
                      <SelectItem value="Electricity">Electricity</SelectItem>
                      <SelectItem value="Public Health">Public Health</SelectItem>
                      <SelectItem value="Street Lights">Street Lights</SelectItem>
                      <SelectItem value="Drainage">Drainage</SelectItem>
                      <SelectItem value="Garbage">Garbage</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-2">Priority Level *</label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Low Priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Medium Priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="High">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>High Priority</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="form-helper">Select the urgency level of your complaint</p>
              {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
            </div>

            {/* Department (Optional) */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium mb-2">Department (Optional)</label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="glass-input">
                      <SelectValue placeholder="(Optional) Select a department to override automatic assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-3 py-2 text-xs text-gray-500">
                        If left blank, the system will auto-assign a department based on your description.
                      </div>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                className="glass-input"
                rows={5}
                {...register('description')}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            {/* Location — Interactive Map */}
            <div className="form-group">
              <label className="form-label">Location *</label>
              <LocationPicker
                onLocationChange={({ address, lat, lng }) => {
                  setValue('location', address, { shouldValidate: true });
                  setValue('lat', lat);
                  setValue('lng', lng);
                }}
              />
              <input type="hidden" {...register('location')} />
              {errors.location && <p className="form-error">⚠️ {errors.location.message}</p>}
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload Photos (Optional)</label>
              <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400">
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                )}
                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Selected files:</p>
                    <ul className="text-sm text-gray-600">
                      {files.map((file, index) => <li key={index}>{file.name}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="success"
              size="lg"
              disabled={isLoading || isCheckingDuplicates}
            >
              {isCheckingDuplicates ? 'Checking for similar issues...' : isLoading ? 'Submitting...' : 'Submit Complaint'}
            </Button>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              🔒 Your complaint will be reviewed and assigned to the appropriate department
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Duplicate Detection Modal */}
      <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Similar Complaints Found
            </DialogTitle>
            <DialogDescription>
              We found {duplicateMatches.length} complaint{duplicateMatches.length !== 1 ? 's' : ''} similar to yours. Support an existing one to boost its visibility, or file a new complaint if your issue is different.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 mt-2">
            {duplicateMatches.map((match, idx) => {
              const similarity = match.similarity;
              const simColor = similarity >= 80
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : similarity >= 60
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
              const supportCount = match.complaint.upvotes?.count || 0;

              return (
                <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 leading-tight pr-3">
                      {match.complaint.title}
                    </h4>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${simColor}`}>
                      {similarity}% similar
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {typeof match.complaint.location === 'object' ? match.complaint.location.address : match.complaint.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {supportCount} supporters
                    </span>
                    <Badge variant={match.complaint.status === 'Resolved' ? 'success' : match.complaint.status === 'In Progress' ? 'warning' : 'secondary'} className="text-xs">
                      {match.complaint.status}
                    </Badge>
                  </div>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={async () => {
                      try {
                        await request(`/api/complaints/${match.complaint._id}/upvote`, 'POST');
                      } catch (_) {}
                      setIsDuplicateModalOpen(false);
                      navigate(user?.slug ? `/${user.slug}/complaints/${match.complaint._id}` : `/complaints/${match.complaint._id}`);
                    }}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Support this — join {supportCount > 0 ? `${supportCount} other${supportCount !== 1 ? 's' : ''}` : 'the community'}
                  </Button>
                </div>
              );
            })}
          </div>

          <DialogFooter className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setIsDuplicateModalOpen(false);
                finalSubmit(pendingFormData);
              }}
            >
              My issue is different — File new
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileComplaint;
