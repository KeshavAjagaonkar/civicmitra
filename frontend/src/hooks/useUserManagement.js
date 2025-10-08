import { useState, useEffect } from 'react';
import useApi from './useApi';

const useUserManagement = () => {
  const { request } = useApi();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await request('/api/admin/users', 'GET');
      if (response?.success) {
        setUsers(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await request('/api/admin/users', 'POST', userData);

      if (response?.success) {
        setUsers(prev => [...prev, response.data]);
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message || 'Failed to create user' };
    } catch (err) {
      console.error('Failed to create user:', err);
      return { success: false, error: err.message || 'Failed to create user' };
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await request(`/api/admin/users/${userId}/role`, 'PUT', { role: newRole });

      if (response?.success) {
        setUsers(prev => prev.map(user =>
          user._id === userId ? { ...user, role: newRole } : user
        ));
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message || 'Failed to update user role' };
    } catch (err) {
      console.error('Failed to update user role:', err);
      return { success: false, error: err.message || 'Failed to update user role' };
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await request(`/api/admin/users/${userId}`, 'PUT', userData);

      if (response?.success) {
        setUsers(prev => prev.map(user =>
          user._id === userId ? response.data : user
        ));
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message || 'Failed to update user' };
    } catch (err) {
      console.error('Failed to update user:', err);
      return { success: false, error: err.message || 'Failed to update user' };
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await request(`/api/admin/users/${userId}`, 'DELETE');

      if (response?.success) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        return { success: true, message: response.message };
      }
      return { success: false, error: response.message || 'Failed to delete user' };
    } catch (err) {
      console.error('Failed to delete user:', err);
      return { success: false, error: err.message || 'Failed to delete user' };
    }
  };

  const bulkDeleteUsers = async (userIds) => {
    try {
      const response = await request('/api/admin/users/bulk-delete', 'POST', { userIds });

      if (response?.success) {
        setUsers(prev => prev.filter(user => !userIds.includes(user._id)));
        return { success: true, message: response.message, deletedCount: response.data.deletedCount };
      }
      return { success: false, error: response.message || 'Failed to bulk delete users' };
    } catch (err) {
      console.error('Failed to bulk delete users:', err);
      return { success: false, error: err.message || 'Failed to bulk delete users' };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refetch = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    updateUserRole,
    deleteUser,
    bulkDeleteUsers
  };
};

export default useUserManagement;