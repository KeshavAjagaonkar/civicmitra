import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, FileText, Building, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ComplaintTable from '@/components/ComplaintTable';

const kpiData = [
  { title: 'Total Users', value: '1,250', icon: Users, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { title: 'Total Complaints', value: '5,420', icon: FileText, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { title: 'Departments', value: '12', icon: Building, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { title: 'Resolved Today', value: '85', icon: BarChart, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
];

const chartData = [
  { name: 'Jan', complaints: 400, resolved: 240 },
  { name: 'Feb', complaints: 300, resolved: 139 },
  { name: 'Mar', complaints: 200, resolved: 980 },
  { name: 'Apr', complaints: 278, resolved: 390 },
  { name: 'May', complaints: 189, resolved: 480 },
  { name: 'Jun', complaints: 239, resolved: 380 },
  { name: 'Jul', complaints: 349, resolved: 430 },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="kpi-card-solid">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-full ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value}</div>
              <p className="text-xs text-gray-400">+20.1% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-3 glass-card">
          <CardHeader>
            <CardTitle>Complaint Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="complaints" fill="#3b82f6" />
                <Bar dataKey="resolved" fill="#84cc16" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 glass-card">
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent><p className="text-gray-500">Recent user activities will be shown here.</p></CardContent>
        </Card>
      </div>

      {/* Complaint Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <ComplaintTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;