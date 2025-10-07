import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <Card className="glass-card p-8 text-center max-w-md">
        <CardContent className="space-y-6">
          <h1 className="text-6xl font-bold text-blue-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
