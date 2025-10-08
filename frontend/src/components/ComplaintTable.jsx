import React, { useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Eye, UserPlus, Edit } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useComplaints } from '@/context/ComplaintContext'; // Centralized data fetching

const statusVariant = {
  Submitted: 'destructive',
  'In Progress': 'secondary',
  'Under Review': 'secondary',
  Resolved: 'default',
  Closed: 'outline',
};

const priorityStyles = {
  High: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  Low: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
};

const ComplaintTable = ({ filter, limit }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 1. Use the centralized context for data, loading, and error states.
  const {
    complaints: allComplaints,
    loading,
    error,
    getMyComplaints,
    getAllComplaints,
  } = useComplaints();

  // 2. Fetch data based on user role when the component mounts.
  useEffect(() => {
    if (user) {
      if (user.role === 'citizen') {
        getMyComplaints();
      } else if (user.role === 'staff' || user.role === 'admin') {
        getAllComplaints();
      }
    }
  }, [user, getMyComplaints, getAllComplaints]);

  // 3. Memoize the filtering logic for performance.
  const filteredComplaints = useMemo(() => {
    let complaintsToFilter = allComplaints || [];

    if (filter?.department) {
      complaintsToFilter = complaintsToFilter.filter(
        (complaint) => complaint.department?.name === filter.department
      );
    }
    
    if (limit && limit > 0) {
      return complaintsToFilter.slice(0, limit);
    }

    return complaintsToFilter;
  }, [allComplaints, filter, limit]);
  
  // Handler for the "Try Again" button
  const handleRetry = () => {
    if (user?.role === 'citizen') {
      getMyComplaints();
    } else {
      getAllComplaints();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="glass-card overflow-x-auto -mx-4 sm:mx-0 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading complaints...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="glass-card overflow-x-auto -mx-4 sm:mx-0 p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load complaints</p>
          <p className="text-sm text-gray-500">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Complaint ID</TableHead>
            <TableHead className="whitespace-nowrap">Title</TableHead>
            <TableHead className="whitespace-nowrap">Department</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Priority</TableHead>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredComplaints.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No complaints found. <Link to={(window.location.pathname.split('/').length > 2 ? `/${window.location.pathname.split('/')[1]}` : '') + '/complaints/create'} className="text-indigo-600 hover:underline">File your first complaint</Link>
              </TableCell>
            </TableRow>
          ) : (
            filteredComplaints.map((complaint) => (
              <TableRow key={complaint._id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {complaint._id?.slice(-6) || 'N/A'}
                </TableCell>
                <TableCell className="min-w-[220px]">{complaint.title}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {complaint.department?.name || 'Unassigned'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[complaint.status] || 'secondary'}>
                    {complaint.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("w-24 flex justify-center", priorityStyles[complaint.priority] || 'bg-gray-100 text-gray-800 border-gray-200')}>
                    {complaint.priority}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Link to={(user?.slug ? `/${user.slug}` : '') + `/complaints/${complaint._id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>View</span>
                      </Button>
                    </Link>
                    {user?.role === 'staff' && !complaint.workerId && (
                      <Button
                        variant="default"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => navigate(`/${user.department?.slug}/staff/complaints/${complaint._id}/assign`)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        <span>Assign</span>
                      </Button>
                    )}
                    {user?.role === 'staff' && complaint.workerId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => navigate(`/${user.department?.slug}/staff/complaints/${complaint._id}/edit-assignment`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span>Edit</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ComplaintTable;
