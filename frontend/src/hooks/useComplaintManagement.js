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

  const updateComplaint = async (complaintId, updateData) => {
    try {
      const response = await request(`/api/admin/complaints/${complaintId}`, 'PUT', updateData);

      if (response?.success) {
        setComplaints(prev => prev.map(c =>
          c._id === complaintId ? response.data : c
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
      const response = await request(`/api/admin/complaints/${complaintId}`, 'DELETE');

      if (response?.success) {
        setComplaints(prev => prev.filter(c => c._id !== complaintId));
        return { success: true, message: response.message };
      }
      return { success: false, error: response.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const bulkDeleteComplaints = async (complaintIds) => {
    try {
      const response = await request('/api/admin/complaints/bulk-delete', 'POST', { complaintIds });

      if (response?.success) {
        setComplaints(prev => prev.filter(c => !complaintIds.includes(c._id)));
        return { success: true, message: response.message, deletedCount: response.data.deletedCount };
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
    updateComplaint,
    updateComplaintStatus,
    deleteComplaint,
    bulkDeleteComplaints,
    stats,
  };
};

export default useComplaintManagement;
