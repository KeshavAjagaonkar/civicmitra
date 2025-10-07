import { useState, useEffect } from 'react';
import useApi from './useApi';

const useStaffData = () => {
  const { request } = useApi();
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [workerPerformance, setWorkerPerformance] = useState([]);
  const [departmentAlerts, setDepartmentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentComplaints = async () => {
    try {
      const response = await request('/api/complaints/recent', 'GET');
      if (response?.success) {
        setRecentComplaints(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch recent complaints:', err);
      setRecentComplaints([]);
    }
  };

  const fetchWorkerPerformance = async () => {
    try {
      const response = await request('/api/users/workers/performance', 'GET');
      if (response?.success) {
        setWorkerPerformance(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch worker performance:', err);
      setWorkerPerformance([]);
    }
  };

  const fetchDepartmentAlerts = async () => {
    try {
      const response = await request('/api/users/department/alerts', 'GET');
      if (response?.success) {
        setDepartmentAlerts(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch department alerts:', err);
      setDepartmentAlerts([]);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchRecentComplaints(),
          fetchWorkerPerformance(),
          fetchDepartmentAlerts()
        ]);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const refetch = () => {
    fetchRecentComplaints();
    fetchWorkerPerformance();
    fetchDepartmentAlerts();
  };

  return {
    recentComplaints,
    workerPerformance,
    departmentAlerts,
    loading,
    error,
    refetch
  };
};

export default useStaffData;