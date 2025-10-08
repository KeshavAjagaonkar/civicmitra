import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import {
  BarChart3, TrendingUp, Users, Clock, Loader2, AlertTriangle,
  CheckCircle, FileText, Building, Award, Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';

const COLORS = {
  primary: '#2563eb',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a78bfa',
  teal: '#14b8a6',
  pink: '#ec4899',
  indigo: '#6366f1'
};

const CHART_COLORS = [COLORS.primary, COLORS.teal, COLORS.warning, COLORS.purple, COLORS.pink, COLORS.success];

const SystemAnalytics = () => {
  const { request } = useApi();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await request('/api/admin/analytics', 'GET');
      if (response?.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      toast({
        title: "Failed to load analytics",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analyticsData) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-lg font-medium">Loading System Analytics...</p>
        <p className="text-sm text-gray-500">Gathering performance data</p>
      </div>
    );
  }

  // Data transformations
  const { totalComplaints, avgResolutionTime, workerPerformance = [], categoryCounts = [], statusCounts = [], departmentCounts = [] } = analyticsData;

  const categoryChartData = categoryCounts.map(item => ({
    name: item._id || 'Unknown',
    value: item.count || 0
  }));

  const statusChartData = statusCounts.map(item => ({
    name: item._id || 'Unknown',
    value: item.count || 0,
    fill: item._id === 'Resolved' ? COLORS.success :
          item._id === 'In Progress' ? COLORS.warning :
          item._id === 'Submitted' ? COLORS.primary :
          COLORS.danger
  }));

  const departmentChartData = departmentCounts.map(item => ({
    name: item.name || 'Unknown',
    complaints: item.count || 0
  }));

  const resolvedCount = statusCounts.find(s => s._id === 'Resolved')?.count || 0;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

  // Top performers
  const topWorkers = [...workerPerformance]
    .sort((a, b) => (b.resolvedCount || 0) - (a.resolvedCount || 0))
    .slice(0, 5);

  const topCategory = categoryChartData.length > 0
    ? categoryChartData.reduce((max, item) => item.value > max.value ? item : max, categoryChartData[0])
    : { name: 'N/A', value: 0 };

  const topDepartment = departmentChartData.length > 0
    ? departmentChartData.reduce((max, item) => item.complaints > max.complaints ? item : max, departmentChartData[0])
    : { name: 'N/A', complaints: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive performance insights and trends
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalComplaints.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">All time registered</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{resolutionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">{resolvedCount} resolved cases</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg. Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{avgResolutionTime} Days</div>
            <p className="text-xs text-gray-500 mt-1">Average turnaround</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 truncate">{topCategory.name}</div>
            <p className="text-xs text-gray-500 mt-1">{topCategory.value} complaints</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Complaint Categories */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Complaint Distribution by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <RechartsPieChart>
                    <RechartsPie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </RechartsPie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <AlertTriangle className="w-8 h-8 mr-2" />
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Complaints by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Complaints" radius={[8, 8, 0, 0]}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <AlertTriangle className="w-8 h-8 mr-2" />
                No status data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      {departmentChartData.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              Department Workload Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="complaints" fill={COLORS.purple} name="Total Complaints" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Worker Performance Table */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Top Worker Performance
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              Total Workers: {workerPerformance.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {topWorkers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Worker Name</TableHead>
                    <TableHead className="text-center">Complaints Resolved</TableHead>
                    <TableHead className="text-center">Avg. Resolution Time</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topWorkers.map((worker, index) => {
                    const avgTime = worker.avgResolutionTime || 0;
                    const performanceScore = worker.resolvedCount >= 10
                      ? (avgTime < 5 ? 'Excellent' : avgTime < 10 ? 'Good' : 'Average')
                      : 'New';

                    return (
                      <TableRow key={worker._id}>
                        <TableCell className="font-bold">
                          {index === 0 && <span className="text-yellow-500">🥇</span>}
                          {index === 1 && <span className="text-gray-400">🥈</span>}
                          {index === 2 && <span className="text-orange-600">🥉</span>}
                          {index > 2 && <span className="text-gray-500">#{index + 1}</span>}
                        </TableCell>
                        <TableCell className="font-medium">{worker.worker?.name || 'Unknown'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">{worker.resolvedCount || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {avgTime > 0 ? `${avgTime.toFixed(1)} days` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              performanceScore === 'Excellent' ? 'default' :
                              performanceScore === 'Good' ? 'secondary' :
                              'outline'
                            }
                          >
                            {performanceScore}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Users className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">No worker performance data available</p>
              <p className="text-sm">Workers will appear here once they start resolving complaints</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Most Active Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">{topCategory.name}</span>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Total Complaints:</span>
                <span className="font-semibold">{topCategory.value}</span>
              </div>
              <div className="flex justify-between">
                <span>Percentage:</span>
                <span className="font-semibold">
                  {totalComplaints > 0 ? ((topCategory.value / totalComplaints) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Busiest Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600 truncate">{topDepartment.name}</span>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Total Complaints:</span>
                <span className="font-semibold">{topDepartment.complaints}</span>
              </div>
              <div className="flex justify-between">
                <span>Workload:</span>
                <span className="font-semibold">
                  {totalComplaints > 0 ? ((topDepartment.complaints / totalComplaints) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Resolution Efficiency:</span>
                <Badge variant={resolutionRate >= 70 ? 'default' : resolutionRate >= 50 ? 'secondary' : 'destructive'}>
                  {resolutionRate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Active Workers:</span>
                <span className="font-semibold">{workerPerformance.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total Departments:</span>
                <span className="font-semibold">{departmentChartData.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAnalytics;
