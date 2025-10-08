import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  Download, FileText, Users, Building, TrendingUp, Calendar,
  CheckCircle, Clock, AlertCircle, BarChart3, Loader2
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const { request, isLoading } = useApi();
  const { toast } = useToast();

  const [reportData, setReportData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const [statsRes, complaintsRes, deptRes, usersRes] = await Promise.all([
        request(`/api/admin/dashboard/stats?period=${selectedPeriod}`, 'GET'),
        request('/api/complaints/all', 'GET'),
        request('/api/admin/dashboard/department-stats', 'GET'),
        request('/api/admin/users', 'GET')
      ]);

      setReportData({
        stats: statsRes?.data,
        complaints: complaintsRes?.data || [],
        departments: deptRes?.data || [],
        users: usersRes?.data || []
      });
    } catch (error) {
      toast({
        title: "Failed to load report data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportComplaintsCSV = () => {
    if (!reportData?.complaints) return;

    const data = reportData.complaints.map(c => ({
      'Complaint ID': c._id,
      'Title': c.title,
      'Category': c.category,
      'Status': c.status,
      'Priority': c.priority,
      'Department': c.department?.name || 'N/A',
      'Citizen': c.citizenId?.name || 'N/A',
      'Worker': c.workerId?.name || 'Unassigned',
      'Created': new Date(c.createdAt).toLocaleDateString(),
      'Updated': new Date(c.updatedAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Complaints');
    XLSX.writeFile(wb, `Complaints_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({ title: 'Success', description: 'Complaints report exported successfully' });
  };

  const exportDepartmentPerformancePDF = () => {
    if (!reportData?.departments) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Department Performance Report', pageWidth / 2, 25, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: 'center' });

    // Summary Stats
    let yPos = 55;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Departments: ${reportData.departments.length}`, 14, yPos);
    doc.text(`Period: ${selectedPeriod}`, pageWidth - 60, yPos);

    // Department Performance Table
    yPos += 10;
    const tableData = reportData.departments.map(d => [
      d.name,
      d.complaints.toString(),
      d.resolved.toString(),
      d.pending.toString(),
      `${d.efficiency}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Department', 'Total', 'Resolved', 'Pending', 'Efficiency']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        4: { halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const efficiency = parseInt(data.cell.text[0]);
          if (efficiency >= 90) data.cell.styles.textColor = [22, 163, 74];
          else if (efficiency >= 70) data.cell.styles.textColor = [234, 179, 8];
          else data.cell.styles.textColor = [239, 68, 68];
        }
      }
    });

    doc.save(`Department_Performance_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Success', description: 'Department performance report exported successfully' });
  };

  const exportUserActivityReport = () => {
    if (!reportData?.users) return;

    const usersByRole = reportData.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const data = reportData.users.map(u => ({
      'Name': u.name,
      'Email': u.email,
      'Role': u.role,
      'Department': u.department?.name || 'N/A',
      'Status': u.isActive ? 'Active' : 'Inactive',
      'Joined': new Date(u.createdAt).toLocaleDateString()
    }));

    const ws1 = XLSX.utils.json_to_sheet(data);
    const ws2 = XLSX.utils.json_to_sheet([
      { Role: 'Admin', Count: usersByRole.admin || 0 },
      { Role: 'Staff', Count: usersByRole.staff || 0 },
      { Role: 'Worker', Count: usersByRole.worker || 0 },
      { Role: 'Citizen', Count: usersByRole.citizen || 0 }
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Users');
    XLSX.utils.book_append_sheet(wb, ws2, 'Role Summary');
    XLSX.writeFile(wb, `User_Activity_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({ title: 'Success', description: 'User activity report exported successfully' });
  };

  const exportComprehensivePDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Page 1: Overview
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Comprehensive Admin Report', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`CivicMitra Complaint Management System`, pageWidth / 2, 35, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 43, { align: 'center' });

    // Key Metrics Cards
    let yPos = 65;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 14, yPos);

    yPos += 10;
    const metrics = [
      { label: 'Total Complaints', value: reportData.stats?.total || 0, color: [37, 99, 235] },
      { label: 'Resolved', value: reportData.stats?.resolved || 0, color: [22, 163, 74] },
      { label: 'Pending', value: reportData.stats?.pending || 0, color: [234, 179, 8] },
      { label: 'Resolution Rate', value: `${reportData.stats?.resolutionRate || 0}%`, color: [168, 85, 247] }
    ];

    const cardWidth = 42;
    const cardHeight = 25;
    const gap = 5;

    metrics.forEach((metric, index) => {
      const x = 14 + (index * (cardWidth + gap));

      doc.setFillColor(...metric.color);
      doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + cardWidth / 2, yPos + 8, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value.toString(), x + cardWidth / 2, yPos + 18, { align: 'center' });
    });

    // Complaints by Status
    yPos += 35;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Complaints by Status', 14, yPos);

    yPos += 5;
    const statusData = [
      ['Submitted', reportData.stats?.submitted || 0],
      ['In Progress', reportData.stats?.inProgress || 0],
      ['Resolved', reportData.stats?.resolved || 0],
      ['Closed', reportData.stats?.closed || 0]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Count']],
      body: statusData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 }
    });

    // Page 2: Department Performance
    doc.addPage();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Department Performance Analysis', pageWidth / 2, 20, { align: 'center' });

    const deptTableData = reportData.departments.map(d => [
      d.name,
      d.complaints.toString(),
      d.resolved.toString(),
      d.pending.toString(),
      `${d.efficiency}%`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Department', 'Total', 'Resolved', 'Pending', 'Efficiency']],
      body: deptTableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontSize: 11, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        4: { halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const efficiency = parseInt(data.cell.text[0]);
          if (efficiency >= 90) data.cell.styles.textColor = [22, 163, 74];
          else if (efficiency >= 70) data.cell.styles.textColor = [234, 179, 8];
          else data.cell.styles.textColor = [239, 68, 68];
        }
      }
    });

    // Page 3: User Statistics
    doc.addPage();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('User Statistics', pageWidth / 2, 20, { align: 'center' });

    const usersByRole = reportData.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const userTableData = [
      ['Admin', usersByRole.admin || 0],
      ['Staff', usersByRole.staff || 0],
      ['Worker', usersByRole.worker || 0],
      ['Citizen', usersByRole.citizen || 0],
      ['Total', reportData.users.length]
    ];

    autoTable(doc, {
      startY: 45,
      head: [['Role', 'Count']],
      body: userTableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 11, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index === userTableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [243, 244, 246];
        }
      }
    });

    // Footer on all pages
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.text('CivicMitra - Complaint Management System', 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`Comprehensive_Admin_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Success', description: 'Comprehensive report exported successfully' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="ml-4 text-lg">Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Generate and export comprehensive reports
          </p>
        </div>

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="thisYear">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.stats?.total || 0}</div>
            <p className="text-xs text-gray-500 mt-1">In selected period</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.departments?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active departments</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.users?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.stats?.resolutionRate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Report */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Comprehensive System Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Generate a complete report including all complaints, departments, users, and performance metrics.
          </p>
          <Button onClick={exportComprehensivePDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Comprehensive Report (PDF)
          </Button>
        </CardContent>
      </Card>

      {/* Individual Reports */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Complaint Reports */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Complaint Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Export detailed complaint data with status, priority, and assignment information.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Resolved: {reportData?.stats?.resolved || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span>Pending: {reportData?.stats?.pending || 0}</span>
              </div>
            </div>
            <Button onClick={exportComplaintsCSV} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export All Complaints (Excel)
            </Button>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Analyze department efficiency with resolution rates and workload distribution.
              </p>
              <div className="space-y-2">
                {reportData?.departments?.slice(0, 3).map((dept, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="truncate">{dept.name}</span>
                    <Badge variant={dept.efficiency >= 80 ? 'default' : 'secondary'}>
                      {dept.efficiency}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={exportDepartmentPerformancePDF} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Department Report (PDF)
            </Button>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Activity Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Detailed reports on user activity, roles, and engagement metrics.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Admin: {reportData?.users?.filter(u => u.role === 'admin').length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Staff: {reportData?.users?.filter(u => u.role === 'staff').length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Worker: {reportData?.users?.filter(u => u.role === 'worker').length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Citizen: {reportData?.users?.filter(u => u.role === 'citizen').length || 0}</span>
                </div>
              </div>
            </div>
            <Button onClick={exportUserActivityReport} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export User Report (Excel)
            </Button>
          </CardContent>
        </Card>

        {/* System Insights */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              System Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Key insights and trends from system analytics.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Avg. Resolution Time</span>
                  <span className="font-medium">{reportData?.stats?.avgResolutionTime || 0} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Workers</span>
                  <span className="font-medium">{reportData?.stats?.activeWorkers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Users</span>
                  <span className="font-medium">{reportData?.stats?.newUsers || 0}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/analytics'}>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Detailed Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
