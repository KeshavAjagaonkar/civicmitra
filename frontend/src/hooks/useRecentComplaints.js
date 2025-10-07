import { useState, useEffect } from 'react';
import useApi from './useApi';

const useRecentComplaints = (limit = 10) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { request } = useApi();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching recent complaints...');
      const response = await request(`/api/admin/dashboard/recent-complaints?limit=${limit}`);
      console.log('Recent complaints response:', response);

      if (response?.success) {
        setComplaints(response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch recent complaints');
      }
    } catch (err) {
      console.error('Error fetching recent complaints:', err);
      setError(err.message || 'Failed to load recent complaints');
      
      // Set empty array for better UX when there's no data
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [limit]);

  const refetch = () => {
    fetchComplaints();
  };

  return {
    complaints,
    loading,
    error,
    refetch
  };
};

export default useRecentComplaints;