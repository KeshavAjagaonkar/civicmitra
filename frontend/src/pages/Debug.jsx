import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const Debug = () => {
  const auth = useAuth();
  
  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold">Authentication Status:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify({
                isAuthenticated: auth?.isAuthenticated,
                loading: auth?.loading,
                user: auth?.user ? {
                  id: auth.user.id,
                  name: auth.user.name,
                  email: auth.user.email,
                  role: auth.user.role
                } : null,
                hasToken: !!auth?.token
              }, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-bold">Current Location:</h3>
            <p>{window.location.pathname}</p>
          </div>
          <div>
            <h3 className="font-bold">Local Storage:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify({
                token: localStorage.getItem('token') ? 'EXISTS' : 'MISSING',
                user: localStorage.getItem('user') ? 'EXISTS' : 'MISSING'
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Debug;