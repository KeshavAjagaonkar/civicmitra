import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const RouteTest = () => {
  const routes = {
    'Landing & Auth': [
      { path: '/', name: 'Landing Page' },
      { path: '/login', name: 'Login' },
      { path: '/register', name: 'Register' },
      { path: '/admin-login', name: 'Admin Login' },
      { path: '/forgot-password', name: 'Forgot Password' }
    ],
    'Citizen Routes': [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/complaints', name: 'My Complaints' },
      { path: '/complaints/create', name: 'File Complaint' },
      { path: '/complaints/123', name: 'Complaint Details' },
      { path: '/feedback', name: 'Feedback' }
    ],
    'Admin Routes': [
      { path: '/admin', name: 'Admin Dashboard' },
      { path: '/admin/users', name: 'User Management' },
      { path: '/admin/departments', name: 'Department Management' },
      { path: '/admin/complaints', name: 'Complaint Management' },
      { path: '/admin/reports', name: 'Reports' },
      { path: '/admin/analytics', name: 'System Analytics' }
    ],
    'Staff Routes': [
      { path: '/staff', name: 'Staff Dashboard' },
      { path: '/staff/complaints', name: 'Staff Complaints' },
      { path: '/staff/assign-worker', name: 'Assign Worker' },
      { path: '/staff/chat', name: 'Staff Chat' }
    ],
    'Worker Routes': [
      { path: '/worker', name: 'Worker Dashboard' },
      { path: '/worker/tasks', name: 'Assigned Tasks' },
      { path: '/worker/reports', name: 'Worker Reports' }
    ],
    'Legacy Routes': [
      { path: '/my-complaints', name: 'My Complaints (Legacy)' },
      { path: '/file-complaint', name: 'File Complaint (Legacy)' },
      { path: '/staff-dashboard', name: 'Staff Dashboard (Legacy)' },
      { path: '/worker-dashboard', name: 'Worker Dashboard (Legacy)' }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">CivicMitra Route Test</h1>
        <p className="text-gray-600">Test all available routes in the application</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(routes).map(([category, routeList]) => (
          <Card key={category} className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {routeList.map(({ path, name }) => (
                  <div key={path} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <Link 
                      to={path} 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex-1"
                    >
                      {name}
                    </Link>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                      {path}
                    </code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h2 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Current Route Info:</h2>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Current URL: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{window.location.pathname}</code>
        </p>
      </div>
    </div>
  );
};

export default RouteTest;