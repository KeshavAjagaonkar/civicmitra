import { useState } from 'react';
import useApi from './useApi';
import { useToast } from '@/components/ui/use-toast';

const useAlertManagement = () => {
  const [loading, setLoading] = useState(false);
  const { request } = useApi();
  const { toast } = useToast();

  const createAlert = async (alertData) => {
    try {
      setLoading(true);
      
      const response = await request('/api/admin/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response?.success) {
        toast({
          title: "Alert Created",
          description: "System alert has been created successfully.",
          variant: "default"
        });
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to create alert');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create alert. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (alertId, updateData) => {
    try {
      setLoading(true);
      
      const response = await request(`/api/admin/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response?.success) {
        toast({
          title: "Alert Updated",
          description: "System alert has been updated successfully.",
          variant: "default"
        });
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to update alert');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update alert. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      setLoading(true);
      
      const response = await request(`/api/admin/alerts/${alertId}`, {
        method: 'DELETE'
      });

      if (response?.success) {
        toast({
          title: "Alert Deleted",
          description: "System alert has been deleted successfully.",
          variant: "default"
        });
        return true;
      } else {
        throw new Error(response?.message || 'Failed to delete alert');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete alert. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      const response = await request(`/api/admin/alerts/${alertId}/read`, {
        method: 'PATCH'
      });

      if (response?.success) {
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to mark alert as read');
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  };

  return {
    createAlert,
    updateAlert,
    deleteAlert,
    markAsRead,
    loading
  };
};

export default useAlertManagement;