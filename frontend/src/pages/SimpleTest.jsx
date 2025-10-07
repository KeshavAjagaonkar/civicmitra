import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const SimpleTest = () => {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Test Page</h1>
      <div className="space-y-2">
        <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
      </div>
      
      <div className="mt-6 p-4 bg-green-100 rounded">
        <p className="text-green-800">✅ If you can see this page, routing is working!</p>
        <p className="text-sm text-green-600 mt-1">Check the authentication state above to debug login issues.</p>
      </div>
    </div>
  );
};

export default SimpleTest;