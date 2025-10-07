import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { BarChart, LineChart, PieChart, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { 
  ResponsiveContainer, 
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

const COLORS = ['#2563eb', '#22d3ee', '#f59e42', '#a78bfa', '#f472b6', '#34d399'];

const SystemAnalytics = () => {
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await request('/api/admin/analytics');
        if (response.success) {
          setAnalyticsData(response.data);
        }
      } catch (error) {
        toast({
          title: "Failed to load analytics",
          description: error.message,
          variant: "destructive"
        });
      }
    };
    fetchAnalytics();
  }, [request, toast]);

  // Data transformation for charts
  const categoryChartData = analyticsData?.categoryCounts.map(item => ({ name: item._id, value: item.count })) || [];
  
  if (isLoading || !analyticsData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="ml-4 text-lg">Loading System Analytics...</p>
      </div>
    );
  }
  
  const { totalComplaints, avgResolutionTime, workerPerformance, departmentCounts } = analyticsData;
  const resolutionRate = totalComplaints > 0 ? Math.round((analyticsData.statusCounts.find(s => s._id === 'Resolved')?.count || 0) / totalComplaints * 100) : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">System Analytics</h1>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card className="glass-card"><CardHeader><CardTitle>Total Complaints</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{totalComplaints}</div></CardContent></Card>
        <Card className="glass-card"><CardHeader><CardTitle>Avg. Resolution Time</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{avgResolutionTime} Days</div></CardContent></Card>
        <Card className="glass-card"><CardHeader><CardTitle>Resolution Rate</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{resolutionRate}%</div></CardContent></Card>
        <Card className="glass-card"><CardHeader><CardTitle>Top Category</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{categoryChartData[0]?.name || 'N/A'}</div></CardContent></Card>
      </div>

      <div className="w-full">
        <Card className="glass-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><PieChart /> Complaint Categories</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <RechartsPieChart>
                  <RechartsPie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {categoryChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </RechartsPie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">Worker Performance</h2>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Worker</TableHead><TableHead>Complaints Resolved</TableHead><TableHead>Avg. Resolution Time (Days)</TableHead></TableRow></TableHeader>
              <TableBody>
                {workerPerformance.map((worker) => (
                  <TableRow key={worker._id}>
                    <TableCell>{worker.worker.name}</TableCell>
                    <TableCell>{worker.resolvedCount}</TableCell>
                    <TableCell>{worker.avgResolutionTime.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAnalytics;
