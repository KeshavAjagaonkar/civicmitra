import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useApi from '@/hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Clock, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import UpvoteButton from '@/components/ui/UpvoteButton';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'Roads', 'Water Supply', 'Sanitation', 'Electricity', 'Public Health', 'Street Lights', 'Drainage', 'Garbage', 'Other'];
const STATUSES = ['All', 'Submitted', 'In Progress', 'Resolved', 'Closed'];
const SORTS = [
  { label: 'Priority (Highest First)', value: '-communityPriority.score' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Upvoted', value: 'most-upvoted' }
];

const PublicFeed = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('-communityPriority.score');

  const { request } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/complaints/public?page=${page}&limit=10&sort=${sort}`;
      if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
      if (status !== 'All') url += `&status=${encodeURIComponent(status)}`;

      const res = await request(url);
      if (res.success) {
        setComplaints(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || Math.ceil(res.pagination.total / 10));
        }
      }
    } catch (error) {
      // Silently handled — loading state will show
    } finally {
      setLoading(false);
    }
  }, [page, category, status, sort, request]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleCardClick = (id) => {
    navigate(user?.slug ? `/${user.slug}/complaints/${id}` : `/complaints/${id}`);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Public Feed</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Discover and support civic issues in your community.</p>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="w-full sm:w-48">
          <Select value={category} onValueChange={(val) => { setCategory(val); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-56 ml-auto">
          <Select value={sort} onValueChange={(val) => { setSort(val); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
            <SelectContent>
              {SORTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">No public complaints found matching your filters.</p>
          </div>
        ) : (
          complaints.map(complaint => (
            <Card
              key={complaint._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardClick(complaint._id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-blue-600 line-clamp-1">{complaint.title}</CardTitle>
                  <Badge variant={
                    complaint.status === 'Resolved' ? 'success' :
                      complaint.status === 'In Progress' ? 'warning' : 'default'
                  }>
                    {complaint.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2 text-sm text-gray-600 dark:text-gray-300">
                <p className="line-clamp-2 mb-3">{complaint.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {complaint.category}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {typeof complaint.location === 'object' ? complaint.location.address : complaint.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t mt-2 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Priority Score:</span> {complaint.communityPriority?.score || 0}
                </div>
                <UpvoteButton
                  complaintId={complaint._id}
                  initialCount={complaint.upvotes?.count || 0}
                  initialHasUpvoted={complaint.hasUserSupported || false}
                />
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default PublicFeed;