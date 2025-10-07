// src/pages/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  Users,
  Building,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  UserPlus,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import useDashboardStats from '@/hooks/useDashboardStats';

/* ---------------------------
   Get dashboard data from backend
   --------------------------- */
const getDashboardData = (stats) => {
  if (!stats) {
    return {
      totalComplaints: 0,
      resolvedComplaints: 0,
      pendingComplaints: 0,
      totalUsers: 0,
      totalDepartments: 0,
      averageResolutionTime: '0 days',
      satisfactionRating: 0,
      newUsers: 0,
      activeWorkers: 0
    };
  }

  return {
    totalComplaints: stats.total || 0,
    resolvedComplaints: stats.resolved || 0,
    pendingComplaints: stats.pending || 0,
    totalUsers: stats.totalUsers || 0,
    totalDepartments: stats.totalDepartments || 0,
    averageResolutionTime: stats.avgResolutionTime ? `${stats.avgResolutionTime} days` : '0 days',
    satisfactionRating: stats.satisfactionRating || 0,
    newUsers: stats.recentComplaints || 0,
    activeWorkers: stats.assignedWorkers || 0
  };
};

const departmentStats = [
  { name: 'Public Works', complaints: 234, resolved: 198, pending: 36, efficiency: 85 },
  { name: 'Water Department', complaints: 189, resolved: 167, pending: 22, efficiency: 88 },
  { name: 'Electricity', complaints: 156, resolved: 142, pending: 14, efficiency: 91 },
  { name: 'Sanitation', complaints: 134, resolved: 118, pending: 16, efficiency: 88 },
  { name: 'Health Department', complaints: 98, resolved: 89, pending: 9, efficiency: 91 },
  { name: 'Traffic', complaints: 87, resolved: 76, pending: 11, efficiency: 87 }
];

const recentComplaints = [
  {
    id: 'CMPT-001',
    title: 'Pothole on Main Street',
    category: 'Roads',
    status: 'In Progress',
    priority: 'High',
    citizen: 'John Doe',
    department: 'Public Works',
    createdAt: '2024-01-20T10:00:00Z',
    summary: 'Large pothole near the bus stop causing vehicle damage, needs urgent repair.',
    assignedTo: 'Worker A',
    eta: '2 days'
  },
  {
    id: 'CMPT-002',
    title: 'Water Leak in Park',
    category: 'Water Supply',
    status: 'Resolved',
    priority: 'Medium',
    citizen: 'Jane Smith',
    department: 'Water Department',
    createdAt: '2024-01-19T15:30:00Z',
    summary: 'Pipe leak causing muddy area in the children play zone.',
    assignedTo: 'Worker B',
    eta: '—'
  },
  {
    id: 'CMPT-003',
    title: 'Broken Street Light',
    category: 'Electricity',
    status: 'Submitted',
    priority: 'Low',
    citizen: 'Mike Johnson',
    department: 'Electricity',
    createdAt: '2024-01-19T09:15:00Z',
    summary: 'Street light not turning on during night at sector 5.',
    assignedTo: null,
    eta: '—'
  },
  {
    id: 'CMPT-004',
    title: 'Garbage Collection Issue',
    category: 'Sanitation',
    status: 'In Progress',
    priority: 'Medium',
    citizen: 'Sarah Wilson',
    department: 'Sanitation',
    createdAt: '2024-01-18T14:20:00Z',
    summary: 'Garbage not collected for two days in block C.',
    assignedTo: 'Worker C',
    eta: '1 day'
  }
];

const systemAlerts = [
  {
    id: 1,
    type: 'warning',
    message: 'High number of pending complaints in Public Works department',
    timestamp: '2024-01-20T08:00:00Z'
  },
  {
    id: 2,
    type: 'info',
    message: 'New user registration: 5 new citizens joined today',
    timestamp: '2024-01-20T07:30:00Z'
  },
  {
    id: 3,
    type: 'success',
    message: 'System backup completed successfully',
    timestamp: '2024-01-20T06:00:00Z'
  }
];

/* ---------------------------
   Helper functions (top-level)
   --------------------------- */
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

const getAlertIcon = (type) => {
  switch (type) {
    case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'info': return <Activity className="w-4 h-4 text-blue-500" />;
    case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
    default: return <Activity className="w-4 h-4 text-gray-500" />;
  }
};

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const getEfficiencyColor = (efficiency) => {
  if (efficiency >= 90) return 'text-green-600';
  if (efficiency >= 80) return 'text-yellow-600';
  return 'text-red-600';
};

/* ---------------------------
   Component
   --------------------------- */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading, error, refetch } = useDashboardStats();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  // derived data (pure)
  const dashboardData = getDashboardData(stats);
  const currentData = dashboardData[selectedPeriod] || dashboardData.thisMonth;

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            System overview and management tools
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
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

          <Button onClick={() => navigate('/admin/users/create')} className="w-full sm:w-auto">
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated relative overflow-hidden admin-theme">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full bg-blue-500 transform translate-x-8 -translate-y-8" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Total Complaints
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {currentData.totalComplaints.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="font-medium">+8.2%</span>
              </div>
            </div>
            <p className="text-xs font-medium text-blue-600">
              {selectedPeriod === 'thisMonth' ? 'This month' :
               selectedPeriod === 'lastMonth' ? 'Last month' : 'This year'}
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-600">{currentData.resolvedComplaints.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((currentData.resolvedComplaints / currentData.totalComplaints) * 100)}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-orange-600">{currentData.pendingComplaints}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting resolution</p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Resolution</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{currentData.averageResolutionTime}</div>
            <p className="text-xs text-gray-500 mt-1">Per complaint</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-4">
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">+{currentData.newUsers} this month</p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Departments</CardTitle>
            <Building className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.totalDepartments}</div>
            <p className="text-xs text-gray-500 mt-1">Active departments</p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Workers</CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.activeWorkers}</div>
            <p className="text-xs text-gray-500 mt-1">Field workers</p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Satisfaction</CardTitle>
            <BarChart3 className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{currentData.satisfactionRating}/5</div>
            <p className="text-xs text-gray-500 mt-1">Average rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Department Performance */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{dept.name}</span>
                    <div className="flex gap-2">
                      <span className="text-sm text-gray-500">{dept.resolved}/{dept.complaints}</span>
                      <span className={`text-sm font-medium ${getEfficiencyColor(dept.efficiency)}`}>
                        {dept.efficiency}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${dept.efficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(alert.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Complaints</CardTitle>
            <Button variant="outline" onClick={() => navigate('/admin/complaints')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentComplaints.map((complaint) => (
              <div key={complaint.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{complaint.title}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500">ID: {complaint.id}</span>
                    <span className="text-sm text-gray-500">Category: {complaint.category}</span>
                    <span className="text-sm text-gray-500">Citizen: {complaint.citizen}</span>
                    <span className="text-sm text-gray-500">Dept: {complaint.department}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(complaint.status)}>
                    {complaint.status}
                  </Badge>

                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(complaint.priority)} border`}>
                    {complaint.priority}
                  </span>

                  <span className="text-xs text-gray-500">
                    {formatDate(complaint.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/users')}
              className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <Users className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-center leading-tight">Manage Users</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/admin/departments')}
              className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <Building className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-center leading-tight">Departments</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/admin/reports')}
              className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-center leading-tight">Reports</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/admin/settings')}
              className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <Settings className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-center leading-tight">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
