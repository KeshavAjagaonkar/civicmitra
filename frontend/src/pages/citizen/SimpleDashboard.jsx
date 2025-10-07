import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const SimpleDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">✅ Simple Citizen Dashboard Test</h1>
      
      <div className="space-y-4">
        <div className="bg-green-100 p-4 rounded">
          <p className="text-green-800 font-semibold">🎉 Success! Dashboard is rendering properly</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold mb-2">User Information:</h2>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
          <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Navigation Test:</h2>
          <div className="space-y-2">
            <a href="/complaints" className="text-blue-600 hover:underline block">
              → Go to My Complaints
            </a>
            <a href="/complaints/create" className="text-blue-600 hover:underline block">
              → File New Complaint
            </a>
            <a href="/login-debug" className="text-blue-600 hover:underline block">
              → Back to Debug Page
            </a>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Next Steps:</h2>
          <p className="text-sm">If you can see this page, the routing is working. The issue might be with the full CitizenDashboard component's complexity.</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;