import { useState, useEffect } from 'react';
import useApi from './useApi';

const useSystemAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { request } = useApi();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching system alerts...');
      const response = await request('/api/admin/dashboard/alerts');
      console.log('System alerts response:', response);

      if (response?.success) {
        setAlerts(response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch system alerts');
      }
    } catch (err) {
      console.error('Error fetching system alerts:', err);
      setError(err.message || 'Failed to load system alerts');
      
      // Set empty array for better UX when there's no data
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const refetch = () => {
    fetchAlerts();
  };

  return {
    alerts,
    loading,
    error,
    refetch
  };
};

export default useSystemAlerts;