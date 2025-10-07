import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  BarChart3,
  Eye,
  User,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDashboardStats from '@/hooks/useDashboardStats';
import useStaffData from '@/hooks/useStaffData';
import { useAuth } from '@/hooks/useAuth';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const { user } = useAuth();

  const departmentSlug = user?.department?.slug || 'staff';

  // 1. Use custom hooks to fetch LIVE data from the backend
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const {
    recentComplaints,
    workerPerformance,
    departmentAlerts,
    loading: staffDataLoading,
    error: staffDataError,
    refetch: refetchStaffData
  } = useStaffData();

  // 2. Derive data from the fetched stats, with fallbacks for loading/error states
  const getDashboardData = () => {
    if (!stats) {
      return {
        totalComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        assignedWorkers: 0,
        averageResolutionTime: '0 days',
        satisfactionRating: 0,
        newComplaints: 0,
        overdueComplaints: 0
      };
    }

    return {
      totalComplaints: stats.total || 0,
      resolvedComplaints: stats.resolved || 0,
      pendingComplaints: stats.pending || 0,
      assignedWorkers: stats.assignedWorkers || 0, // This might need a separate API call if not in stats
      averageResolutionTime: stats.avgResolutionTime ? `${stats.avgResolutionTime} days` : '0 days',
      satisfactionRating: stats.satisfactionRating || 0, // This might need a separate API call
      newComplaints: stats.recentComplaints || 0,
      overdueComplaints: stats.overdueComplaints || 0, // This might need a separate API call
    };
  };

  const currentData = getDashboardData();
  const isLoading = statsLoading || staffDataLoading;
  const combinedError = statsError || staffDataError;

  // Helper functions remain the same
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Submitted': return 'secondary';
      case 'In Progress': return 'default';
      case 'Resolved': return 'outline';
      case 'Closed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 85) return 'text-green-600';
    if (efficiency >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 3. Render loading and error states for a better user experience
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-3 text-lg">Loading Dashboard Data...</span>
      </div>
    );
  }

  if (combinedError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 rounded-lg">
        <AlertTriangle className="w-10 h-10 mb-2" />
        <h3 className="text-lg font-semibold">Failed to load dashboard data</h3>
        <p className="text-sm">{combinedError}</p>
        <Button onClick={() => { refetchStats(); refetchStaffData(); }} variant="destructive" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Department: {user?.department?.name || 'Staff Department'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Complaints</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{currentData.totalComplaints}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{currentData.resolvedComplaints}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{currentData.pendingComplaints}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Resolution</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{currentData.averageResolutionTime}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* 4. RENDER DYNAMIC DATA instead of mock data */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Complaints */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Complaints</CardTitle>
              <Button variant="outline" onClick={() => navigate(`/${departmentSlug}/staff/complaints`)}>
                View All
              </Button>
            </div>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              {recentComplaints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent complaints in your department.
                </div>
              ) : (
                recentComplaints.map((complaint) => (
                  <div key={complaint._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{complaint.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Citizen: {complaint.citizenId?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(complaint.status)}>
                        {complaint.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/${departmentSlug}/staff/complaints/${complaint._id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            </CardContent>
          </Card>

        {/* Worker Performance */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Worker Performance</CardTitle>
              <Button variant="outline" onClick={() => navigate(`/${departmentSlug}/staff/workers`)}>
                Manage Workers
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workerPerformance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No worker data available.
                </div>
              ) : (
                workerPerformance.map((worker) => (
                  <div key={worker.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">{worker.name}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500">{worker.completedTasks}/{worker.assignedTasks}</span>
                        <span className={`text-xs font-semibold ${getEfficiencyColor(worker.efficiency)}`}>
                          {worker.efficiency}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${worker.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Alerts */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Department Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No new alerts.
              </div>
            ) : (
              departmentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 dark:text-blue-200">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
