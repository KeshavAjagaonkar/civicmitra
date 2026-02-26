import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eye, MessageCircle, Star, Loader2, FileText, Zap, CheckCircle, Archive, Circle } from 'lucide-react';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';

const MyComplaints = () => {
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { slug } = useParams();
  const base = slug ? `/${slug}` : '';
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const result = await request('/api/complaints/my');
        if (result.success) {
          setComplaints(result.data);

          const resolvedComplaints = result.data.filter(c => c.status === 'Resolved');
          const feedbackPromises = resolvedComplaints.map(async (complaint) => {
            try {
              const feedbackResult = await request(`/api/feedback/${complaint._id}`);
              return { complaintId: complaint._id, feedback: feedbackResult.data };
            } catch (err) {
              return { complaintId: complaint._id, feedback: null };
            }
          });

          const feedbackResults = await Promise.all(feedbackPromises);
          const feedbackMap = {};
          feedbackResults.forEach(({ complaintId, feedback }) => {
            feedbackMap[complaintId] = feedback;
          });
          setFeedbacks(feedbackMap);
        }
      } catch (err) {
        toast({
          title: 'Failed to fetch complaints',
          description: err.message,
          variant: 'destructive'
        });
      }
    };
    fetchComplaints();
  }, [request, toast]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <Badge variant="secondary" className="flex items-center gap-1"><FileText className="w-3 h-3" /> Submitted</Badge>;
      case 'In Progress':
        return <Badge variant="warning" className="flex items-center gap-1"><Zap className="w-3 h-3" /> In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Resolved</Badge>;
      case 'Closed':
        return <Badge variant="outline" className="flex items-center gap-1 text-gray-500"><Archive className="w-3 h-3" /> Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 flex items-center gap-1"><Circle className="w-2.5 h-2.5 fill-current" /> High</Badge>;
      case 'Medium':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1"><Circle className="w-2.5 h-2.5 fill-current" /> Medium</Badge>;
      case 'Low':
        return <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 flex items-center gap-1"><Circle className="w-2.5 h-2.5 fill-current" /> Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">My Complaints</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading complaints...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Complaints</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track and manage all your submitted complaints
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate(`${base}/complaints/create`)}>
          File New Complaint
        </Button>
      </div>

      {complaints.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No complaints yet</h3>
              <p className="text-gray-600 mb-4">You haven't filed any complaints yet.</p>
              <Button onClick={() => navigate(`${base}/complaints/create`)}>
                File Your First Complaint
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {complaints.map((complaint) => (
            <Card key={complaint._id} className="glass-card hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg md:text-xl leading-tight">
                      {complaint.title}
                    </CardTitle>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      Filed on {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    {getStatusBadge(complaint.status)}
                    {getPriorityBadge(complaint.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Description: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {complaint.description.length > 120
                        ? `${complaint.description.substring(0, 120)}...`
                        : complaint.description
                      }
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Location: </span>
                    <span className="text-gray-600 dark:text-gray-400">{typeof complaint.location === 'object' ? complaint.location.address : complaint.location}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Department: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {complaint.department?.name || 'Auto-assigned'}
                    </span>
                  </div>
                  {complaint.deadline && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">Deadline: </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDate(complaint.deadline)}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                      onClick={() => navigate(`${base}/complaints/${complaint._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                      onClick={() => navigate(`${base}/complaints/${complaint._id}?tab=chat`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    {complaint.status === 'Resolved' && !feedbacks[complaint._id] && (
                      <Button
                        size="sm"
                        className="w-full sm:w-auto justify-center"
                        onClick={() => navigate(`${base}/complaints/${complaint._id}/feedback`)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Give Feedback
                      </Button>
                    )}
                    {complaint.status === 'Resolved' && feedbacks[complaint._id] && (
                      <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                        <Star className="w-4 h-4 fill-yellow-400" />
                        <span>Rated {feedbacks[complaint._id].rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
