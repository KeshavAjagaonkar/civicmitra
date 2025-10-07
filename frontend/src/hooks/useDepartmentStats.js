import { useState, useEffect } from 'react';
import useApi from './useApi';

const useDepartmentStats = () => {
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { request } = useApi();

  const fetchDepartmentStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching department stats...');
      const response = await request('/api/admin/dashboard/department-stats');
      console.log('Department stats response:', response);

      if (response?.success) {
        setDepartmentStats(response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch department statistics');
      }
    } catch (err) {
      console.error('Error fetching department stats:', err);
      setError(err.message || 'Failed to load department statistics');
      
      // Set empty array for better UX when there's no data
      setDepartmentStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentStats();
  }, []);

  const refetch = () => {
    fetchDepartmentStats();
  };

  return {
    departmentStats,
    loading,
    error,
    refetch
  };
};

export default useDepartmentStats;