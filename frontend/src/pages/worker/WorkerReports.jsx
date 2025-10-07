import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Calendar, Download, FileText, BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const WorkerReports = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for reports
  const reportData = {
    thisMonth: {
      totalTasks: 18,
      completedTasks: 15,
      inProgressTasks: 2,
      overdueTasks: 1,
      averageCompletionTime: '2.1 days',
      efficiency: 94,
      rating: 4.8
    },
    lastMonth: {
      totalTasks: 22,
      completedTasks: 20,
      inProgressTasks: 1,
      overdueTasks: 1,
      averageCompletionTime: '2.3 days',
      efficiency: 91,
      rating: 4.6
    },
    thisYear: {
      totalTasks: 156,
      completedTasks: 142,
      inProgressTasks: 8,
      overdueTasks: 6,
      averageCompletionTime: '2.3 days',
      efficiency: 92,
      rating: 4.7
    }
  };

  const categoryData = {
    all: { name: 'All Categories', color: 'bg-blue-100 text-blue-800' },
    roads: { name: 'Roads', color: 'bg-gray-100 text-gray-800' },
    water: { name: 'Water Supply', color: 'bg-blue-100 text-blue-800' },
    electricity: { name: 'Electricity', color: 'bg-yellow-100 text-yellow-800' },
    sanitation: { name: 'Sanitation', color: 'bg-green-100 text-green-800' },
    drainage: { name: 'Drainage', color: 'bg-purple-100 text-purple-800' }
  };

  const monthlyData = [
    { month: 'Jan', completed: 15, total: 18, efficiency: 94 },
    { month: 'Dec', completed: 20, total: 22, efficiency: 91 },
    { month: 'Nov', completed: 18, total: 20, efficiency: 90 },
    { month: 'Oct', completed: 16, total: 19, efficiency: 84 },
    { month: 'Sep', completed: 14, total: 17, efficiency: 82 },
    { month: 'Aug', completed: 12, total: 15, efficiency: 80 }
  ];

  const taskBreakdown = [
    { category: 'Roads', completed: 45, total: 48, percentage: 94 },
    { category: 'Water Supply', completed: 32, total: 35, percentage: 91 },
    { category: 'Electricity', completed: 28, total: 30, percentage: 93 },
    { category: 'Sanitation', completed: 25, total: 28, percentage: 89 },
    { category: 'Drainage', completed: 12, total: 15, percentage: 80 }
  ];

  const recentTasks = [
    {
      id: 1,
      title: 'Pothole Repair - Main Street',
      category: 'Roads',
      status: 'Completed',
      completionTime: '1.5 days',
      rating: 5,
      date: '2024-01-20'
    },
    {
      id: 2,
      title: 'Water Leak - Oak Avenue',
      category: 'Water Supply',
      status: 'Completed',
      completionTime: '2.0 days',
      rating: 4,
      date: '2024-01-18'
    },
    {
      id: 3,
      title: 'Street Light Repair',
      category: 'Electricity',
      status: 'In Progress',
      completionTime: '1.0 days',
      rating: null,
      date: '2024-01-19'
    },
    {
      id: 4,
      title: 'Garbage Collection Issue',
      category: 'Sanitation',
      status: 'Completed',
      completionTime: '0.5 days',
      rating: 5,
      date: '2024-01-17'
    },
    {
      id: 5,
      title: 'Drainage Blockage',
      category: 'Drainage',
      status: 'Completed',
      completionTime: '3.0 days',
      rating: 4,
      date: '2024-01-15'
    }
  ];

  const currentData = reportData[selectedPeriod];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'outline';
      case 'In Progress': return 'default';
      case 'Overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'In Progress': return <Clock className="w-4 h-4" />;
      case 'Overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleExportReport = () => {
    toast({
      title: 'Report Export',
      description: 'Your performance report has been downloaded successfully.',
      variant: 'success'
    });
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBg = (efficiency) => {
    if (efficiency >= 90) return 'bg-green-100';
    if (efficiency >= 80) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance Reports</h1>
        <Button onClick={handleExportReport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryData).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentData.totalTasks}</div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedPeriod === 'thisMonth' ? 'This month' : 
               selectedPeriod === 'lastMonth' ? 'Last month' : 'This year'}
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{currentData.completedTasks}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((currentData.completedTasks / currentData.totalTasks) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Efficiency</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getEfficiencyColor(currentData.efficiency)}`}>
              {currentData.efficiency}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Performance score</p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Rating</CardTitle>
            <BarChart3 className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{currentData.rating}</div>
            <p className="text-xs text-gray-500 mt-1">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium">{data.month}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getEfficiencyBg(data.efficiency)}`}
                          style={{ width: `${data.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{data.completed}/{data.total}</div>
                    <div className={`text-xs ${getEfficiencyColor(data.efficiency)}`}>
                      {data.efficiency}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Breakdown by Category */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Task Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taskBreakdown.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className="text-sm text-gray-500">
                      {category.completed}/{category.total} ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks Performance */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Tasks Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <Badge variant="outline" className={categoryData[task.category.toLowerCase().replace(' ', '')]?.color || 'bg-gray-100 text-gray-800'}>
                      {task.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Completed in: {task.completionTime}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(task.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(task.status)} className="flex items-center gap-1">
                    {getStatusIcon(task.status)}
                    {task.status}
                  </Badge>
                  {task.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{task.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Average Completion Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{currentData.averageCompletionTime}</div>
            <p className="text-sm text-gray-500 mt-1">Per task</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Tasks in Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{currentData.inProgressTasks}</div>
            <p className="text-sm text-gray-500 mt-1">Currently working on</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{currentData.overdueTasks}</div>
            <p className="text-sm text-gray-500 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkerReports;
