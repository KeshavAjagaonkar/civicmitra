import { useState, useEffect, useMemo, useCallback } from 'react';
import useApi from './useApi';

const useComplaintManagement = () => {
  const { request, isLoading: apiIsLoading } = useApi();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      // This endpoint fetches all complaints, suitable for admin
      const response = await request('/api/complaints/all');
      if (response?.success) {
        setComplaints(response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const updateComplaintStatus = async (complaintId, status) => {
    try {
      const response = await request(`/api/complaints/${complaintId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response?.success) {
        // Optimistically update the local state for a faster UI response
        setComplaints(prev => prev.map(c => 
          c._id === complaintId ? { ...c, status, updatedAt: new Date().toISOString() } : c
        ));
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteComplaint = async (complaintId) => {
    try {
      // This endpoint needs to be created in the backend
      const response = await request(`/api/admin/complaints/${complaintId}`, {
        method: 'DELETE',
      });
      
      if (response?.success) {
        setComplaints(prev => prev.filter(c => c._id !== complaintId));
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const stats = useMemo(() => {
    return complaints.reduce((acc, c) => {
        acc.total++;
        if (c.status === 'Submitted') acc.submitted++;
        if (c.status === 'In Progress') acc.inProgress++;
        if (c.status === 'Resolved') acc.resolved++;
        if (c.status === 'Closed') acc.closed++;
        return acc;
    }, { total: 0, submitted: 0, inProgress: 0, resolved: 0, closed: 0 });
  }, [complaints]);

  return {
    complaints,
    loading: loading || apiIsLoading,
    error,
    refetch: fetchComplaints,
    updateComplaintStatus,
    deleteComplaint,
    stats,
  };
};

export default useComplaintManagement;
