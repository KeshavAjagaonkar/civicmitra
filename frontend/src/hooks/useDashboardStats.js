import { useState, useEffect } from 'react';
import useApi from './useApi';
import { useAuth } from './useAuth';

const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { request } = useApi();
  const { user } = useAuth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard stats for user role:', user?.role);
      
      // Use role-appropriate endpoint
      let endpoint;
      switch (user?.role) {
        case 'admin':
          endpoint = '/api/admin/dashboard/stats';
          break;
        case 'staff':
        case 'worker':
        case 'citizen':
        default:
          endpoint = '/api/complaints/stats';
          break;
      }
      
      const response = await request(endpoint);
      console.log('Dashboard stats response:', response);

      if (response?.success) {
        setStats(response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch dashboard statistics');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard statistics');
      
      // Set default stats for better UX when there's no data
      setStats({
        total: 0,
        resolved: 0,
        pending: 0,
        submitted: 0,
        inProgress: 0,
        closed: 0,
        resolutionRate: 0,
        recentComplaints: 0,
        avgResolutionTime: 0,
        priorityCounts: {
          high: 0,
          medium: 0,
          low: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refetch
  };
};

export default useDashboardStats;