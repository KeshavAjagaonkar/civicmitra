import React from 'react';
import ComplaintTable from '@/components/ComplaintTable';
import { Card, CardHeader, CardTitle, CardContent }  from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

const DepartmentComplaints = () => {
  const { user } = useAuth();
  const staffDepartment = user?.department?.name || 'N/A';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Department Complaints - {staffDepartment}</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Here you can view all complaints assigned to your department.
      </p>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Complaints in {staffDepartment}</CardTitle>
        </CardHeader>
        <CardContent>
          <ComplaintTable filter={{ department: user?.department?._id || user?.department }} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentComplaints;
