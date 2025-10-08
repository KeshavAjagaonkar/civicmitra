import { useState, useEffect } from 'react';
import useApi from './useApi';
import { useAuth } from './useAuth';

const useStaffData = () => {
  const { request } = useApi();
  const { user } = useAuth();
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
      // Fetch all complaints to calculate worker performance
      const complaintsRes = await request('/api/complaints/all', 'GET');
      const complaints = complaintsRes?.success ? complaintsRes.data || [] : [];

      // Fetch workers in department
      const departmentId = user?.department?._id || user?.department;
      if (!departmentId) {
        setWorkerPerformance([]);
        return;
      }

      const workersRes = await request(`/api/admin/users?role=worker&department=${departmentId}`, 'GET');
      const workers = workersRes?.success ? workersRes.data || [] : [];

      // Calculate performance for each worker
      const performance = workers.map(worker => {
        const workerComplaints = complaints.filter(c => c.workerId?._id === worker._id || c.workerId === worker._id);
        const assignedTasks = workerComplaints.length;
        const completedTasks = workerComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
        const efficiency = assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0;

        return {
          id: worker._id,
          name: worker.name,
          assignedTasks,
          completedTasks,
          efficiency
        };
      });

      setWorkerPerformance(performance);
    } catch (err) {
      console.error('Failed to fetch worker performance:', err);
      setWorkerPerformance([]);
    }
  };

  const fetchDepartmentAlerts = async () => {
    try {
      // Generate alerts based on complaints data
      const response = await request('/api/complaints/all', 'GET');
      const complaints = response?.success ? response.data || [] : [];

      const alerts = [];

      // Alert for unassigned complaints
      const unassigned = complaints.filter(c => !c.workerId && c.status === 'Submitted');
      if (unassigned.length > 0) {
        alerts.push({
          id: 'unassigned',
          message: `${unassigned.length} complaint${unassigned.length !== 1 ? 's' : ''} waiting for worker assignment.`,
          type: 'warning'
        });
      }

      // Alert for high priority complaints
      const highPriority = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved' && c.status !== 'Closed');
      if (highPriority.length > 0) {
        alerts.push({
          id: 'high-priority',
          message: `${highPriority.length} high priority complaint${highPriority.length !== 1 ? 's' : ''} need${highPriority.length === 1 ? 's' : ''} attention.`,
          type: 'error'
        });
      }

      // Alert for overdue complaints (with deadline)
      const now = new Date();
      const overdue = complaints.filter(c => {
        if (!c.deadline || c.status === 'Resolved' || c.status === 'Closed') return false;
        return new Date(c.deadline) < now;
      });
      if (overdue.length > 0) {
        alerts.push({
          id: 'overdue',
          message: `${overdue.length} complaint${overdue.length !== 1 ? 's are' : ' is'} past the deadline.`,
          type: 'error'
        });
      }

      setDepartmentAlerts(alerts);
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
        console.error('Error fetching staff data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllData();
    }
  }, [user]);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchRecentComplaints(),
        fetchWorkerPerformance(),
        fetchDepartmentAlerts()
      ]);
    } catch (err) {
      console.error('Error refetching staff data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
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