import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';

const FeedbackList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const [resolvedComplaints, setResolvedComplaints] = useState([]);

  useEffect(() => {
    const fetchResolvedComplaints = async () => {
      try {
        const result = await request('/api/complaints');
        if (result.success) {
          // Filter only resolved complaints
          const resolved = result.data.filter(c => c.status === 'Resolved');
          setResolvedComplaints(resolved);
        }
      } catch (err) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    };
    fetchResolvedComplaints();
  }, [request, toast]);

  const handleGiveFeedback = (complaintId) => {
    const feedbackPath = user?.slug
      ? `/${user.slug}/complaints/${complaintId}/feedback`
      : `/complaints/${complaintId}/feedback`;
    navigate(feedbackPath);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submit Feedback</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Provide feedback for your resolved complaints
        </p>
      </div>

      {resolvedComplaints.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              You don't have any resolved complaints yet.
              <br />
              Feedback can only be submitted for resolved complaints.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate(user?.slug ? `/${user.slug}/complaints` : '/complaints')}
            >
              View My Complaints
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resolvedComplaints.map((complaint) => (
            <Card key={complaint._id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{complaint.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {complaint.description?.substring(0, 150)}
                      {complaint.description?.length > 150 ? '...' : ''}
                    </CardDescription>
                  </div>
                  <span className="status-resolved ml-4">Resolved</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Complaint ID: {complaint._id.slice(-8)}</p>
                    <p className="mt-1">
                      Resolved: {new Date(complaint.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGiveFeedback(complaint._id)}
                    className="btn-primary"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Give Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
