import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { Building2, CheckCircle, Clock, TrendingUp, BarChart2, Loader2, AlertTriangle } from 'lucide-react';
import { PRIORITY_CLASSES } from '@/lib/constants';

// Standalone page — no auth required, uses direct fetch (not useApi hook)
const PublicTransparency = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${backendUrl}/api/public/accountability`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError('Failed to load data');
      })
      .catch(() => setError('Could not connect to server'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  const { summary, departments, categories, monthlyTrend } = data;

  const getResolutionColor = (rate) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">CivicMitra</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Public Accountability Dashboard</h1>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Live performance metrics for your municipal corporation. Updated in real time.
            No login required.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Complaints', value: summary.totalComplaints, icon: BarChart2, color: 'text-blue-600' },
            { label: 'Resolved', value: summary.resolvedComplaints, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Still Active', value: summary.activeComplaints, icon: Clock, color: 'text-amber-600' },
            { label: 'Resolution Rate', value: `${summary.overallResolutionRate}%`, icon: TrendingUp, color: summary.overallResolutionRate >= 60 ? 'text-green-600' : 'text-red-600' },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Trend */}
        <Card className="bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Complaint Volume — Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#2563eb" name="Filed" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" stroke="#16a34a" name="Resolved" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No department data available yet.</p>
            ) : (
              <div className="space-y-4">
                {departments.map(dept => (
                  <div key={dept._id} className="flex items-center gap-4">
                    <div className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{dept.name}</div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${dept.resolutionRate >= 70 ? 'bg-green-500' : dept.resolutionRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${dept.resolutionRate}%` }}
                      />
                    </div>
                    <div className={`text-sm font-bold w-12 text-right ${getResolutionColor(dept.resolutionRate)}`}>
                      {dept.resolutionRate}%
                    </div>
                    <div className="text-xs text-gray-400 w-20 text-right">
                      {dept.resolved}/{dept.total} resolved
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Complaints by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categories} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="total" fill="#2563eb" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#16a34a" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 pb-4">
          Data reflects public complaints only. Updated in real time. &copy; {new Date().getFullYear()} CivicMitra
        </p>
      </div>
    </div>
  );
};

export default PublicTransparency;
