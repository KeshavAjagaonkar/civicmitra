import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Reports</h1>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Complaint Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">Generate various reports related to complaints, users, and departments.</p>
          <div className="flex flex-col md:flex-row gap-4">
            <Button className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export All Complaints (CSV)
            </Button>
            <Button className="w-full md:w-auto" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Department Performance (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>User Activity Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300">Detailed reports on user activity and engagement.</p>
          <Button className="mt-4">
            <Download className="mr-2 h-4 w-4" />
            Generate User Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
