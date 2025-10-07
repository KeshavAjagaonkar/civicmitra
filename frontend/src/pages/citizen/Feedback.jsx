import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Star, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';

// Zod schema for feedback validation
const feedbackSchema = z.object({
  rating: z.number().min(1, { message: 'Please select a rating from 1 to 5.' }).max(5),
  comments: z.string().min(10, { message: 'Please provide at least 10 characters of feedback.' }).max(500),
});

// Reusable StarRating component
const StarRating = ({ rating, onRatingChange, disabled = false }) => (
  <div className="flex space-x-1">
    {[...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <Star
          key={starValue}
          className={`cursor-pointer h-8 w-8 transition-colors ${
            starValue <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
          } ${!disabled && 'hover:text-yellow-300'}`}
          onClick={() => !disabled && onRatingChange(starValue)}
        />
      );
    })}
  </div>
);

const FeedbackPage = () => {
  const { id: complaintId } = useParams(); // Use 'id' to match App.jsx
  const navigate = useNavigate();
  const { user } = useAuth();
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  
  const [complaint, setComplaint] = useState(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, comments: '' },
  });

  // Fetch the complaint to ensure it's valid for feedback
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const result = await request(`/api/complaints/${complaintId}`);
        if (result.success) {
          if (result.data.citizenId._id !== user._id) {
             toast({ title: 'Unauthorized', description: "You can only give feedback on your own complaints.", variant: 'destructive' });
             navigate('/complaints');
          } else if (result.data.status !== 'Resolved') {
            toast({ title: 'Not Yet Resolved', description: 'Feedback can only be submitted for resolved complaints.', variant: 'destructive' });
            navigate(`/complaints/${complaintId}`);
          } else {
            setComplaint(result.data);
          }
        }
      } catch (err) {
        toast({ title: 'Failed to fetch complaint', description: err.message, variant: 'destructive' });
        navigate('/complaints');
      }
    };
    if (user) fetchComplaint();
  }, [complaintId, request, toast, navigate, user]);

  const onSubmit = async (data) => {
    try {
      const result = await request('/api/feedback', 'POST', {
        complaintId,
        rating: data.rating,
        comments: data.comments,
      });

      if (result.success) {
        toast({ title: 'Feedback Submitted!', description: 'Thank you for helping us improve our services.' });
        navigate('/complaints');
      }
    } catch (err) {
      toast({ title: 'Submission Failed', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading || !complaint) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
       <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      <Card className="max-w-2xl mx-auto form-container-card">
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>
            Rate your experience with the resolution of complaint: <span className="font-semibold">{complaint.title}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Your Overall Rating*</Label>
                  <StarRating rating={field.value} onRatingChange={(rate) => setValue('rating', rate, { shouldValidate: true })} />
                  {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>}
                </div>
              )}
            />
            
            <Controller
                name="comments"
                control={control}
                render={({ field }) => (
                    <div className="space-y-2">
                        <Label htmlFor="comments">Your Comments*</Label>
                        <Textarea 
                            id="comments" 
                            placeholder="Tell us about your experience..." 
                            className="glass-input" 
                            rows={4}
                            {...field}
                        />
                        {errors.comments && <p className="text-red-500 text-xs mt-1">{errors.comments.message}</p>}
                    </div>
                )}
            />

            <Button type="submit" className="w-full" loading={isLoading}>
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackPage;
