import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, CheckCircle, Clock, Plus, TrendingUp, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ComplaintTable from '@/components/ComplaintTable';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useNotifications } from '@/context/NotificationContext';
import useDashboardStats from '@/hooks/useDashboardStats';
import { useAuth } from '@/hooks/useAuth';


const CitizenDashboard = () => {
  const { addNotification } = useNotifications();
  const { slug } = useParams();
  const base = slug ? `/${slug}` : '';
  const { stats, loading, error, refetch } = useDashboardStats();
  const { user } = useAuth();

  const handleAddNotification = () => {
    addNotification(`A new complaint has been filed in your area at ${new Date().toLocaleTimeString()}`);
  };

  // Create KPI data from stats
  const getKpiData = () => {
    // Always return default values, stats can be null/undefined
    const safeStats = stats || {};

    return [
      { 
        title: 'Total Complaints', 
        value: (safeStats.total || 0).toString(), 
        icon: FileText, 
        color: 'text-blue-500',
        bgColor: 'bg-blue-500',
        trend: `+${safeStats.recentComplaints || 0} this week`,
        trendIcon: TrendingUp,
        trendColor: (safeStats.recentComplaints || 0) > 0 ? 'text-green-500' : 'text-gray-500'
      },
      { 
        title: 'Resolved', 
        value: (safeStats.resolved || 0).toString(), 
        icon: CheckCircle, 
        color: 'text-green-500',
        bgColor: 'bg-green-500',
        trend: `${safeStats.resolutionRate || 0}% success rate`,
        percentage: safeStats.resolutionRate || 0,
        trendColor: 'text-green-500'
      },
      { 
        title: 'Pending', 
        value: (safeStats.pending || 0).toString(), 
        icon: Clock, 
        color: 'text-orange-500',
        bgColor: 'bg-orange-500',
        trend: (safeStats.avgResolutionTime || 0) > 0 ? `Avg. ${safeStats.avgResolutionTime} days` : 'No pending complaints',
        trendIcon: AlertCircle,
        trendColor: (safeStats.pending || 0) > 0 ? 'text-orange-500' : 'text-gray-500'
      },
    ];
  };

  const kpiData = getKpiData();

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {user?.name ? `${user.name}'s Dashboard` : 'My Dashboard'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {user?.name 
              ? `Welcome back, ${user.name}! Here's your complaint overview.` 
              : 'Welcome back! Here\'s your complaint overview.'
            }
          </p>
          {slug && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              📍 Personal URL: /{slug}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleAddNotification}
            className="w-full sm:w-auto"
          >
            Add Test Notification
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to={`${base}/complaints/create`}>File a New Complaint</Link>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading dashboard statistics...</p>
          </div>
        </div>
      )}

      {/* Error State with helpful message */}
      {error && !loading && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
              <FileText className="h-5 w-5" />
              <div>
                <p className="font-medium">Welcome to CivicMitra!</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {(stats?.total || 0) === 0 
                    ? "You haven't filed any complaints yet. Start by filing your first complaint below!"
                    : `Unable to load data: ${error}`
                  }
                </p>
                {(stats?.total || 0) > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refetch}
                    className="mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    Try Again
                  </Button>
                )}
                {(stats?.total || 0) === 0 && (
                  <Button 
                    asChild
                    size="sm" 
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link to={`${base}/complaints/create`}>File Your First Complaint</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {!loading && (
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
      )}

      {/* Quick Actions */}
      {!loading && (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            <Link to={`${base}/complaints/create`}>
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <FileText className="w-5 h-5 md:w-6 md:h-6" />
                <span>File Complaint</span>
              </Button>
            </Link>
            <Link to={`${base}/complaints`}>
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                <span>My Complaints</span>
              </Button>
            </Link>
            <Link to={`${base}/complaints`}>
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <Clock className="w-5 h-5 md:w-6 md:h-6" />
                <span>Give Feedback</span>
              </Button>
            </Link>
            <Link to={`${base}/complaints`}>
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
      )}

      {/* Recent Complaints Table */}
      {!loading && (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle className="text-lg md:text-xl">My Recent Complaints</CardTitle>
            <Link to={`${base}/complaints`}>
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <ComplaintTable limit={5} />
          </div>
        </CardContent>
      </Card>
      )}
      
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

export default CitizenDashboard;