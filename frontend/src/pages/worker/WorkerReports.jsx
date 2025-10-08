import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Calendar, Download, FileText, BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const WorkerReports = () => {
  const { toast } = useToast();
  const { request } = useApi();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod, selectedCategory]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const response = await request(`/api/complaints/worker-reports?period=${selectedPeriod}&category=${selectedCategory}`);

      if (response?.success) {
        setReportData(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load report data',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categoryData = {
    all: { name: 'All Categories', color: 'bg-blue-100 text-blue-800' },
    'Road Maintenance': { name: 'Road Maintenance', color: 'bg-gray-100 text-gray-800' },
    'Water Supply': { name: 'Water Supply', color: 'bg-blue-100 text-blue-800' },
    'Electricity': { name: 'Electricity', color: 'bg-yellow-100 text-yellow-800' },
    'Sanitation': { name: 'Sanitation', color: 'bg-green-100 text-green-800' },
    'Drainage': { name: 'Drainage', color: 'bg-purple-100 text-purple-800' },
    'Street Lighting': { name: 'Street Lighting', color: 'bg-yellow-100 text-yellow-800' },
    'Public Health': { name: 'Public Health', color: 'bg-red-100 text-red-800' },
    'Parks': { name: 'Parks', color: 'bg-green-100 text-green-800' },
    'Other': { name: 'Other', color: 'bg-gray-100 text-gray-800' }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Resolved': return 'outline';
      case 'In Progress': return 'default';
      case 'Overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      case 'In Progress': return <Clock className="w-4 h-4" />;
      case 'Overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const downloadExcel = () => {
    try {
      if (!reportData) return;

      const wb = XLSX.utils.book_new();
      const { summary, taskBreakdown, monthlyTrend, recentTasks } = reportData;

      // Summary Sheet
      const summaryData = [
        ['Worker Performance Report', ''],
        ['Worker Name', user?.name || 'N/A'],
        ['Department', user?.department?.name || 'N/A'],
        ['Period', selectedPeriod === 'thisMonth' ? 'This Month' : selectedPeriod === 'lastMonth' ? 'Last Month' : 'This Year'],
        ['Date Generated', new Date().toLocaleDateString()],
        ['', ''],
        ['Metric', 'Value'],
        ['Total Tasks', summary.totalTasks],
        ['Completed Tasks', summary.completedTasks],
        ['In Progress', summary.inProgressTasks],
        ['Overdue', summary.overdueTasks],
        ['Efficiency', `${summary.efficiency}%`],
        ['Average Completion Time', summary.averageCompletionTime],
        ['Average Rating', summary.rating > 0 ? summary.rating : 'N/A'],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      // Monthly Trend Sheet
      if (monthlyTrend && monthlyTrend.length > 0) {
        const trendData = [
          ['Month', 'Total Tasks', 'Completed', 'Efficiency (%)']
        ];
        monthlyTrend.forEach(m => {
          trendData.push([m.month, m.total, m.completed, m.efficiency]);
        });
        const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
        XLSX.utils.book_append_sheet(wb, trendSheet, 'Monthly Trend');
      }

      // Category Breakdown Sheet
      if (taskBreakdown && taskBreakdown.length > 0) {
        const categoryData = [
          ['Category', 'Total Tasks', 'Completed', 'Percentage (%)']
        ];
        taskBreakdown.forEach(c => {
          categoryData.push([c.category, c.total, c.completed, c.percentage]);
        });
        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, categorySheet, 'Category Breakdown');
      }

      // Recent Tasks Sheet
      if (recentTasks && recentTasks.length > 0) {
        const tasksData = [
          ['Title', 'Category', 'Status', 'Completion Time', 'Rating', 'Date']
        ];
        recentTasks.forEach(t => {
          tasksData.push([
            t.title,
            t.category,
            t.status,
            t.completionTime,
            t.rating || 'N/A',
            new Date(t.date).toLocaleDateString()
          ]);
        });
        const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
        XLSX.utils.book_append_sheet(wb, tasksSheet, 'Recent Tasks');
      }

      // Save file
      XLSX.writeFile(wb, `${user?.name || 'Worker'}_Performance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: 'Success',
        description: 'Excel file downloaded successfully!'
      });
    } catch (error) {
      console.error('Excel generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate Excel file.',
        variant: 'destructive'
      });
    }
  };

  const downloadPDF = () => {
    try {
      if (!reportData) return;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPos = 20;

      const { summary, taskBreakdown, monthlyTrend, recentTasks } = reportData;

      // Color palette
      const colors = {
        primary: [79, 70, 229],
        success: [34, 197, 94],
        warning: [234, 179, 8],
        danger: [239, 68, 68],
        info: [59, 130, 246],
        gray: [107, 114, 128],
        lightGray: [243, 244, 246],
        white: [255, 255, 255]
      };

      // Header banner
      const addHeaderBanner = () => {
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 50, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Worker Performance Report', pageWidth / 2, 22, { align: 'center' });

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`${user?.name || 'Worker'} - ${user?.department?.name || 'Department'}`, pageWidth / 2, 32, { align: 'center' });

        doc.setFontSize(9);
        const periodText = selectedPeriod === 'thisMonth' ? 'This Month' : selectedPeriod === 'lastMonth' ? 'Last Month' : 'This Year';
        doc.text(`Period: ${periodText} | Generated: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`, pageWidth / 2, 42, { align: 'center' });

        return 60;
      };

      // PAGE 1 - Overview
      yPos = addHeaderBanner();
      doc.setTextColor(0, 0, 0);

      // Executive Summary
      doc.setFillColor(...colors.lightGray);
      doc.rect(14, yPos, pageWidth - 28, 15, 'F');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text('Performance Summary', 18, yPos + 10);

      yPos += 20;
      doc.setTextColor(0, 0, 0);

      // Metrics cards
      const metrics = [
        { label: 'Total Tasks', value: summary.totalTasks, color: colors.info },
        { label: 'Completed', value: summary.completedTasks, color: colors.success },
        { label: 'In Progress', value: summary.inProgressTasks, color: colors.warning },
        { label: 'Efficiency', value: `${summary.efficiency}%`, color: colors.primary },
        { label: 'Avg Rating', value: summary.rating > 0 ? summary.rating : 'N/A', color: colors.warning }
      ];

      const cardWidth = 35;
      const cardHeight = 25;
      const cardSpacing = 3;
      const startX = (pageWidth - (cardWidth * 5 + cardSpacing * 4)) / 2;

      metrics.forEach((metric, index) => {
        const x = startX + (cardWidth + cardSpacing) * index;

        doc.setFillColor(255, 255, 255);
        doc.rect(x, yPos, cardWidth, cardHeight, 'F');
        doc.setDrawColor(...metric.color);
        doc.setLineWidth(0.5);
        doc.rect(x, yPos, cardWidth, cardHeight, 'S');

        doc.setFillColor(...metric.color);
        doc.rect(x, yPos, cardWidth, 3, 'F');

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...metric.color);
        doc.text(metric.value.toString(), x + cardWidth / 2, yPos + 14, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.gray);
        doc.text(metric.label, x + cardWidth / 2, yPos + 20, { align: 'center' });
      });

      yPos += cardHeight + 15;

      // Monthly Performance Section
      if (monthlyTrend && monthlyTrend.length > 0) {
        doc.setFillColor(...colors.lightGray);
        doc.rect(14, yPos, pageWidth - 28, 15, 'F');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.primary);
        doc.text('Monthly Performance Trend', 18, yPos + 10);

        yPos += 20;

        const trendData = monthlyTrend.map(m => [
          m.month,
          m.total.toString(),
          m.completed.toString(),
          `${m.efficiency}%`
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Month', 'Total', 'Completed', 'Efficiency']],
          body: trendData,
          theme: 'striped',
          headStyles: {
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: {
            fontSize: 8,
            cellPadding: 3,
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          margin: { left: 14, right: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Category Breakdown Section
      if (taskBreakdown && taskBreakdown.length > 0 && yPos < pageHeight - 80) {
        doc.setFillColor(...colors.lightGray);
        doc.rect(14, yPos, pageWidth - 28, 15, 'F');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.primary);
        doc.text('Task Breakdown by Category', 18, yPos + 10);

        yPos += 20;

        const categoryData = taskBreakdown.map(c => [
          c.category,
          c.total.toString(),
          c.completed.toString(),
          `${c.percentage}%`
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Category', 'Total', 'Completed', 'Percentage']],
          body: categoryData,
          theme: 'striped',
          headStyles: {
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: {
            fontSize: 8,
            cellPadding: 3
          },
          columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' }
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          margin: { left: 14, right: 14 },
          didDrawPage: function(data) {
            doc.setFontSize(8);
            doc.setTextColor(...colors.gray);
            doc.text(
              `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
            );
          }
        });
      }

      // PAGE 2 - Recent Tasks
      if (recentTasks && recentTasks.length > 0) {
        doc.addPage();
        yPos = addHeaderBanner();
        doc.setTextColor(0, 0, 0);

        doc.setFillColor(...colors.lightGray);
        doc.rect(14, yPos, pageWidth - 28, 15, 'F');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.primary);
        doc.text('Recent Tasks Performance', 18, yPos + 10);

        yPos += 20;

        const tasksData = recentTasks.slice(0, 15).map(t => [
          t.title.substring(0, 35) + (t.title.length > 35 ? '...' : ''),
          t.category,
          t.status,
          t.completionTime,
          t.rating ? t.rating.toString() : 'N/A',
          new Date(t.date).toLocaleDateString()
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Task', 'Category', 'Status', 'Time', 'Rating', 'Date']],
          body: tasksData,
          theme: 'striped',
          headStyles: {
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: {
            fontSize: 8,
            cellPadding: 3
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { halign: 'center', cellWidth: 30 },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 22 },
            4: { halign: 'center', cellWidth: 18 },
            5: { halign: 'center', cellWidth: 25 }
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          margin: { left: 14, right: 14 },
          didDrawPage: function(data) {
            doc.setFontSize(8);
            doc.setTextColor(...colors.gray);
            doc.text(
              `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
            );
          }
        });
      }

      // Footer
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos;
      if (finalY < pageHeight - 40) {
        doc.setFontSize(8);
        doc.setTextColor(...colors.gray);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'This report is generated automatically by CivicMitra System',
          pageWidth / 2,
          pageHeight - 20,
          { align: 'center' }
        );
        doc.text(
          `© ${new Date().getFullYear()} CivicMitra. All rights reserved.`,
          pageWidth / 2,
          pageHeight - 15,
          { align: 'center' }
        );
      }

      // Save PDF
      doc.save(`${user?.name || 'Worker'}_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Success',
        description: 'PDF report generated successfully!'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBg = (efficiency) => {
    if (efficiency >= 90) return 'bg-green-500';
    if (efficiency >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Show loading state
  if (isLoading || !reportData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  // Show empty state for new workers
  if (reportData.summary.totalTasks === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Performance Reports</h1>
        </div>

        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Performance Data Yet</h3>
            <p className="text-gray-600 text-center max-w-md">
              You haven't been assigned any tasks yet. Once you start working on complaints, your performance reports will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, taskBreakdown, monthlyTrend, recentTasks } = reportData;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance Reports</h1>
        <div className="flex gap-2">
          <Button onClick={downloadExcel} variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
          <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
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
            <div className="text-3xl font-bold">{summary.totalTasks}</div>
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
            <div className="text-3xl font-bold text-green-600">{summary.completedTasks}</div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.totalTasks > 0 ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Efficiency</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getEfficiencyColor(summary.efficiency)}`}>
              {summary.efficiency}%
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
            <div className="text-3xl font-bold text-yellow-600">
              {summary.rating > 0 ? summary.rating : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.rating > 0 ? 'Out of 5.0' : 'No ratings yet'}
            </p>
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
            {monthlyTrend && monthlyTrend.length > 0 ? (
              <div className="space-y-4">
                {monthlyTrend.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
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
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">{data.completed}/{data.total}</div>
                      <div className={`text-xs ${getEfficiencyColor(data.efficiency)}`}>
                        {data.efficiency}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No monthly data available</p>
            )}
          </CardContent>
        </Card>

        {/* Task Breakdown by Category */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Task Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {taskBreakdown && taskBreakdown.length > 0 ? (
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
            ) : (
              <p className="text-center text-gray-500 py-4">No category data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks Performance */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Tasks Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks && recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <Badge variant="outline" className={categoryData[task.category]?.color || 'bg-gray-100 text-gray-800'}>
                        {task.category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {task.status === 'Resolved' ? 'Completed' : 'Time elapsed'}: {task.completionTime}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(task.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(task.status)} className="flex items-center gap-1">
                      <span className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        {task.status}
                      </span>
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
          ) : (
            <p className="text-center text-gray-500 py-4">No recent tasks</p>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Average Completion Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.averageCompletionTime}</div>
            <p className="text-sm text-gray-500 mt-1">Per task</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Tasks in Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.inProgressTasks}</div>
            <p className="text-sm text-gray-500 mt-1">Currently working on</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overdueTasks}</div>
            <p className="text-sm text-gray-500 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkerReports;
