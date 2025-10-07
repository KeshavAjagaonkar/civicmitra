import { useState, useEffect } from 'react';
import useApi from './useApi';

const useWorkerData = () => {
  const { request } = useApi();
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const response = await request('/api/complaints/all', {
        method: 'GET',
      });
      if (response?.success) {
        // Filter complaints assigned to the current worker (worker role filter is handled in backend)
        setAssignedComplaints(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch assigned complaints:', err);
      setError(err.message || 'Failed to fetch complaints');
      setAssignedComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const refetch = () => {
    fetchAssignedComplaints();
  };

  // Calculate worker stats from complaints data
  const getWorkerStats = () => {
    const total = assignedComplaints.length;
    const inProgress = assignedComplaints.filter(c => c.status === 'In Progress').length;
    const completed = assignedComplaints.filter(c => c.status === 'Resolved').length;
    
    // Calculate completed today
    const today = new Date();
    const completedToday = assignedComplaints.filter(c => {
      if (c.status !== 'Resolved' || !c.updatedAt) return false;
      const completedDate = new Date(c.updatedAt);
      return today.toDateString() === completedDate.toDateString();
    }).length;

    return {
      total,
      inProgress,
      completed,
      completedToday
    };
  };

  return {
    assignedComplaints,
    loading,
    error,
    refetch,
    stats: getWorkerStats()
  };
};

export default useWorkerData;