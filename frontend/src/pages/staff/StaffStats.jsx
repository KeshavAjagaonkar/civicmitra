import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StaffStats = () => {
  const { user } = useAuth();
  const { request, isLoading } = useApi();
  const { toast } = useToast();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsRes = await request('/api/complaints/stats');
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // Fetch all complaints for the department
      const complaintsRes = await request('/api/complaints/all');
      if (complaintsRes.success) {
        setComplaints(complaintsRes.data);
      }

      // Fetch workers in the department
      const workersRes = await request(`/api/admin/users?role=worker&department=${user.department._id || user.department}`);
      if (workersRes.success) {
        setWorkers(workersRes.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load statistics.",
        variant: "destructive"
      });
    }
  };

  const downloadExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Stats sheet
      const statsData = [
        ['Department Statistics', ''],
        ['Department', user?.department?.name || 'N/A'],
        ['Date Generated', new Date().toLocaleDateString()],
        ['', ''],
        ['Metric', 'Value'],
        ['Total Complaints', stats?.total || 0],
        ['Submitted', stats?.submitted || 0],
        ['In Progress', stats?.inProgress || 0],
        ['Resolved', stats?.resolved || 0],
        ['Resolution Rate', `${stats?.resolutionRate || 0}%`],
      ];
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, statsSheet, 'Statistics');

      // Complaints sheet
      const complaintsData = [
        ['ID', 'Title', 'Status', 'Priority', 'Worker', 'Deadline', 'Created At']
      ];
      complaints.forEach(c => {
        complaintsData.push([
          c._id.slice(-6),
          c.title,
          c.status,
          c.priority,
          c.workerId?.name || 'Unassigned',
          c.deadline ? new Date(c.deadline).toLocaleDateString() : 'No deadline',
          new Date(c.createdAt).toLocaleDateString()
        ]);
      });
      const complaintsSheet = XLSX.utils.aoa_to_sheet(complaintsData);
      XLSX.utils.book_append_sheet(wb, complaintsSheet, 'Complaints');

      // Workers sheet
      const workersData = [
        ['Name', 'Email', 'Assigned Complaints', 'Status']
      ];
      workers.forEach(w => {
        const assignedCount = complaints.filter(c => c.workerId?._id === w._id).length;
        const isActive = assignedCount > 0;
        workersData.push([
          w.name,
          w.email,
          assignedCount,
          isActive ? 'Active' : 'Inactive'
        ]);
      });
      const workersSheet = XLSX.utils.aoa_to_sheet(workersData);
      XLSX.utils.book_append_sheet(wb, workersSheet, 'Workers');

      // Save file
      XLSX.writeFile(wb, `${user?.department?.name || 'Department'}_Stats_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Success",
        description: "Excel file downloaded successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate Excel file.",
        variant: "destructive"
      });
    }
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPos = 20;

      // Color palette
      const colors = {
        primary: [79, 70, 229], // Indigo
        success: [34, 197, 94], // Green
        warning: [234, 179, 8], // Yellow
        danger: [239, 68, 68], // Red
        info: [59, 130, 246], // Blue
        gray: [107, 114, 128],
        lightGray: [243, 244, 246],
        white: [255, 255, 255]
      };

      // Helper function to add header banner
      const addHeaderBanner = () => {
        // Header background
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 50, 'F');

        // Department name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(`${user?.department?.name || 'Department'} Statistics`, pageWidth / 2, 22, { align: 'center' });

        // Subtitle
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Department Performance Report`, pageWidth / 2, 32, { align: 'center' });

        // Date and page info
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`, pageWidth / 2, 42, { align: 'center' });

        return 60; // Return starting Y position for content
      };

      // PAGE 1 - Overview & Statistics
      yPos = addHeaderBanner();

      // Reset text color for content
      doc.setTextColor(0, 0, 0);

      // Executive Summary Section
      doc.setFillColor(...colors.lightGray);
      doc.rect(14, yPos, pageWidth - 28, 15, 'F');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text('Executive Summary', 18, yPos + 10);

      yPos += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Key Metrics Cards
      const metrics = [
        { label: 'Total Complaints', value: stats?.total || 0, color: colors.info },
        { label: 'Submitted', value: stats?.submitted || 0, color: colors.warning },
        { label: 'In Progress', value: stats?.inProgress || 0, color: colors.primary },
        { label: 'Resolved', value: stats?.resolved || 0, color: colors.success },
        { label: 'Resolution Rate', value: `${stats?.resolutionRate || 0}%`, color: colors.success }
      ];

      const cardWidth = 35;
      const cardHeight = 25;
      const cardSpacing = 3;
      const startX = (pageWidth - (cardWidth * 5 + cardSpacing * 4)) / 2;

      metrics.forEach((metric, index) => {
        const x = startX + (cardWidth + cardSpacing) * index;

        // Card background
        doc.setFillColor(255, 255, 255);
        doc.rect(x, yPos, cardWidth, cardHeight, 'F');
        doc.setDrawColor(...metric.color);
        doc.setLineWidth(0.5);
        doc.rect(x, yPos, cardWidth, cardHeight, 'S');

        // Colored top border
        doc.setFillColor(...metric.color);
        doc.rect(x, yPos, cardWidth, 3, 'F');

        // Value
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...metric.color);
        doc.text(metric.value.toString(), x + cardWidth / 2, yPos + 14, { align: 'center' });

        // Label
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.gray);
        doc.text(metric.label, x + cardWidth / 2, yPos + 20, { align: 'center' });
      });

      yPos += cardHeight + 15;

      // Complaints Details Section
      doc.setFillColor(...colors.lightGray);
      doc.rect(14, yPos, pageWidth - 28, 15, 'F');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text('Complaints Overview', 18, yPos + 10);

      yPos += 20;

      // Complaints table with color coding
      const complaintsTableData = complaints.slice(0, 15).map(c => {
        const getStatusColor = () => {
          if (c.status === 'Resolved') return colors.success;
          if (c.status === 'In Progress') return colors.warning;
          return colors.info;
        };

        const getPriorityColor = () => {
          if (c.priority === 'High') return colors.danger;
          if (c.priority === 'Medium') return colors.warning;
          return colors.success;
        };

        return [
          c._id.slice(-6).toUpperCase(),
          c.title.substring(0, 35) + (c.title.length > 35 ? '...' : ''),
          { content: c.status, styles: { textColor: getStatusColor() } },
          { content: c.priority, styles: { textColor: getPriorityColor() } },
          c.workerId?.name || 'Unassigned',
          c.deadline ? new Date(c.deadline).toLocaleDateString() : 'N/A'
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['ID', 'Title', 'Status', 'Priority', 'Worker', 'Deadline']],
        body: complaintsTableData.length > 0 ? complaintsTableData : [['No complaints found', '', '', '', '', '']],
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
          lineColor: colors.gray,
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 18 },
          1: { cellWidth: 60 },
          2: { halign: 'center', cellWidth: 25 },
          3: { halign: 'center', cellWidth: 22 },
          4: { cellWidth: 35 },
          5: { halign: 'center', cellWidth: 25 }
        },
        margin: { left: 14, right: 14 },
        didDrawPage: function(data) {
          // Footer
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

      // PAGE 2 - Workers Performance
      doc.addPage();
      yPos = addHeaderBanner();
      doc.setTextColor(0, 0, 0);

      // Workers Section
      doc.setFillColor(...colors.lightGray);
      doc.rect(14, yPos, pageWidth - 28, 15, 'F');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text('Workers Performance', 18, yPos + 10);

      yPos += 20;

      // Workers summary stats
      const totalWorkers = workers.length;
      const activeWorkers = workers.filter(w =>
        complaints.some(c => c.workerId?._id === w._id && c.status !== 'Resolved' && c.status !== 'Closed')
      ).length;

      const workerStats = [
        { label: 'Total Workers', value: totalWorkers, color: colors.primary },
        { label: 'Active Workers', value: activeWorkers, color: colors.success },
        { label: 'Inactive Workers', value: totalWorkers - activeWorkers, color: colors.gray }
      ];

      const workerCardWidth = 55;
      const workerStartX = (pageWidth - (workerCardWidth * 3 + cardSpacing * 2)) / 2;

      workerStats.forEach((stat, index) => {
        const x = workerStartX + (workerCardWidth + cardSpacing) * index;

        doc.setFillColor(255, 255, 255);
        doc.rect(x, yPos, workerCardWidth, cardHeight, 'F');
        doc.setDrawColor(...stat.color);
        doc.setLineWidth(0.5);
        doc.rect(x, yPos, workerCardWidth, cardHeight, 'S');

        doc.setFillColor(...stat.color);
        doc.rect(x, yPos, workerCardWidth, 3, 'F');

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...stat.color);
        doc.text(stat.value.toString(), x + workerCardWidth / 2, yPos + 14, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.gray);
        doc.text(stat.label, x + workerCardWidth / 2, yPos + 20, { align: 'center' });
      });

      yPos += cardHeight + 15;

      // Workers table
      const workersTableData = workers.map(w => {
        const assignedComplaints = complaints.filter(c => c.workerId?._id === w._id);
        const activeComplaints = assignedComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');
        const resolvedComplaints = assignedComplaints.filter(c => c.status === 'Resolved');
        const isActive = activeComplaints.length > 0;

        return [
          w.name,
          w.email,
          assignedComplaints.length.toString(),
          activeComplaints.length.toString(),
          resolvedComplaints.length.toString(),
          {
            content: isActive ? 'Active' : 'Inactive',
            styles: {
              textColor: isActive ? colors.success : colors.gray,
              fontStyle: 'bold'
            }
          }
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Worker Name', 'Email', 'Total', 'Active', 'Resolved', 'Status']],
        body: workersTableData.length > 0 ? workersTableData : [['No workers found', '', '', '', '', '']],
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
          lineColor: colors.gray,
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 55 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 25 },
          5: { halign: 'center', cellWidth: 25 }
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

      // Add footer note on last page
      const finalY = doc.lastAutoTable.finalY || yPos;
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
      doc.save(`${user?.department?.name || 'Department'}_Stats_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Success",
        description: "PDF report generated successfully!"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Department Statistics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {user?.department?.name || 'Your Department'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadExcel} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={downloadPDF} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="kpi-card-solid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.submitted}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card className="kpi-card-solid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{stats.resolutionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Workers Status */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Workers Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workers.map(worker => {
              const assignedComplaints = complaints.filter(c => c.workerId?._id === worker._id);
              const isActive = assignedComplaints.length > 0;

              return (
                <div key={worker._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{worker.name}</p>
                    <p className="text-sm text-gray-500">{worker.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {assignedComplaints.length} assigned complaint{assignedComplaints.length !== 1 ? 's' : ''}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              );
            })}
            {workers.length === 0 && (
              <p className="text-center text-gray-500 py-4">No workers in this department.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Complaints */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complaints.slice(0, 10).map(complaint => (
              <div key={complaint._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{complaint.title}</p>
                  <p className="text-sm text-gray-500">
                    Worker: {complaint.workerId?.name || 'Unassigned'}
                    {complaint.deadline && ` • Deadline: ${new Date(complaint.deadline).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
              </div>
            ))}
            {complaints.length === 0 && (
              <p className="text-center text-gray-500 py-4">No complaints yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffStats;
