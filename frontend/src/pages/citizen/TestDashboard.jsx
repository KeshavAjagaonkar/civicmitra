import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, CheckCircle, Clock, Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

import { useNotifications } from '@/context/NotificationContext';

const kpiData = [
  { 
    title: 'Total Complaints', 
    value: '12', 
    icon: FileText, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    trend: '+2 this week',
    trendIcon: TrendingUp,
    trendColor: 'text-green-500'
  },
  { 
    title: 'Resolved', 
    value: '8', 
    icon: CheckCircle, 
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    trend: '67% success rate',
    percentage: 67,
    trendColor: 'text-green-500'
  },
  { 
    title: 'Pending', 
    value: '4', 
    icon: Clock, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    trend: 'Avg. 3 days',
    trendIcon: AlertCircle,
    trendColor: 'text-orange-500'
  },
];

const TestDashboard = () => {
  const { addNotification } = useNotifications();

  const handleAddNotification = () => {
    addNotification(`A new complaint has been filed in your area at ${new Date().toLocaleTimeString()}`);
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your complaint overview.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleAddNotification}
            className="w-full sm:w-auto"
          >
            Add Test Notification
          </Button>
          <Link to="/complaints/create">
            <Button className="w-full sm:w-auto">File a New Complaint</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi, index) => (
          <Card key={kpi.title} className="card-elevated relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
              <div className={`w-full h-full rounded-full ${kpi.bgColor} transform translate-x-8 -translate-y-8`}></div>
            </div>
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}/10`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="flex items-baseline justify-between mb-3">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {kpi.value}
                </div>
                {kpi.trendIcon && (
                  <div className={`flex items-center text-xs ${kpi.trendColor}`}>
                    <kpi.trendIcon className="h-3 w-3 mr-1" />
                    <span className="font-medium">{kpi.trend}</span>
                  </div>
                )}
              </div>
              
              {/* Progress Bar for Resolved */}
              {kpi.percentage && (
                <div className="progress-bar mb-2">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${kpi.percentage}%` }}
                  ></div>
                </div>
              )}
              
              <p className={`text-xs font-medium ${kpi.trendColor || 'text-gray-500'}`}>
                {kpi.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            <Link to="/complaints/create">
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <FileText className="w-5 h-5 md:w-6 md:h-6" />
                <span>File Complaint</span>
              </Button>
            </Link>
            <Link to="/complaints">
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                <span>My Complaints</span>
              </Button>
            </Link>
            <Link to="/feedback">
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <Clock className="w-5 h-5 md:w-6 md:h-6" />
                <span>Give Feedback</span>
              </Button>
            </Link>
            <Link to="/profile">
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <FileText className="w-5 h-5 md:w-6 md:h-6" />
                <span>Profile</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Test Section Instead of ComplaintTable */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle className="text-lg md:text-xl">My Recent Complaints</CardTitle>
            <Link to="/complaints">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>✅ ComplaintTable removed for testing</p>
            <p className="text-sm mt-2">If this loads, the issue is with ComplaintTable component</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Floating Action Button */}
      <FloatingActionButton
        tooltip="File New Complaint"
        onClick={() => window.location.href = '/complaints/create'}
      >
        <Plus className="h-6 w-6" />
      </FloatingActionButton>
    </div>
  );
};

export default TestDashboard;