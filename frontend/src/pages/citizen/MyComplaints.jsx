import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eye, MessageCircle } from 'lucide-react';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';

const MyComplaints = () => {
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { slug } = useParams();
  const base = slug ? `/${slug}` : '';
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const result = await request('/api/complaints/my');
        if (result.success) {
          setComplaints(result.data);
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'Submitted': return 'status-submitted';
      case 'In Progress': return 'status-in-progress';
      case 'Resolved': return 'status-resolved';
      case 'Closed': return 'status-closed';
      default: return 'status-submitted';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted': return '📝';
      case 'In Progress': return '⚡';
      case 'Resolved': return '✅';
      case 'Closed': return '🔒';
      default: return '📝';
    }
  };
  
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '🟡';
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
          <div className="text-lg">Loading complaints...</div>
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
                    <span className={getStatusClass(complaint.status)}>
                      {getStatusIcon(complaint.status)} {complaint.status}
                    </span>
                    <span className={getPriorityClass(complaint.priority)}>
                      {getPriorityIcon(complaint.priority)} {complaint.priority}
                    </span>
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
                    <span className="text-gray-600 dark:text-gray-400">{complaint.location}</span>
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