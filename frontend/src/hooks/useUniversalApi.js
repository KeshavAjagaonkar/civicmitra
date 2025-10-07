import { useState, useEffect } from 'react';
import useApi from './useApi';
import { useAuth } from './useAuth';

// Universal hook for fetching data with role-based endpoints
export const useUniversalFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { request } = useApi();
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching data from:', endpoint);
      const response = await request(endpoint, options);
      console.log('Response:', response);
      
      if (response?.success) {
        setData(response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && endpoint) {
      fetchData();
    }
  }, [endpoint, user]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

// Hook for users data (admin only)
export const useUsers = () => {
  return useUniversalFetch('/api/admin/users');
};

// Hook for complaints (role-based)
export const useComplaints = () => {
  const { user } = useAuth();
  
  let endpoint = '/api/complaints/all';
  if (user?.role === 'citizen') {
    endpoint = '/api/complaints/my';
  }
  
  return useUniversalFetch(endpoint);
};

// Hook for departments (public)
export const useDepartments = () => {
  return useUniversalFetch('/api/departments');
};

// Hook for dashboard stats (role-aware)
export const useStats = () => {
  const { user } = useAuth();
  
  let endpoint = '/api/complaints/stats';
  if (user?.role === 'admin') {
    endpoint = '/api/admin/dashboard/stats';
  }
  
  return useUniversalFetch(endpoint);
};

// Hook for recent complaints
export const useRecentComplaints = () => {
  const { user } = useAuth();
  
  let endpoint = '/api/complaints/recent';
  if (user?.role === 'admin') {
    endpoint = '/api/admin/dashboard/recent-complaints';
  }
  
  return useUniversalFetch(endpoint);
};

// Hook for worker performance (staff/admin)
export const useWorkerPerformance = () => {
  return useUniversalFetch('/api/users/workers/performance');
};

// Hook for department alerts (staff/admin)  
export const useDepartmentAlerts = () => {
  return useUniversalFetch('/api/users/department/alerts');
};

// Hook for system alerts (admin)
export const useSystemAlerts = () => {
  return useUniversalFetch('/api/admin/dashboard/alerts');
};

export default {
  useUsers,
  useComplaints,
  useDepartments,
  useStats,
  useRecentComplaints,
  useWorkerPerformance,
  useDepartmentAlerts,
  useSystemAlerts
};