import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const TestLogin = () => {
  const { login, logout, isAuthenticated, user } = useAuth();

  const handleMockLogin = (role) => {
    // Mock user data for testing
    const mockUsers = {
      citizen: {
        id: '1',
        name: 'John Citizen',
        email: 'citizen@test.com',
        role: 'citizen'
      },
      admin: {
        id: '2',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin'
      },
      staff: {
        id: '3',
        name: 'Staff Member',
        email: 'staff@test.com',
        role: 'staff'
      },
      worker: {
        id: '4',
        name: 'Worker User',
        email: 'worker@test.com',
        role: 'worker'
      }
    };

    const mockUser = mockUsers[role];
    const mockToken = `mock_token_${role}_${Date.now()}`;

    // Store in localStorage
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Trigger auth context update
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="glass-card max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Test Login</CardTitle>
          <p className="text-center text-sm text-gray-600">
            For development and testing purposes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Logged in as:</p>
                <p className="font-bold">{user?.name} ({user?.role})</p>
              </div>
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Choose a role to login as:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleMockLogin('citizen')} 
                  variant="outline"
                  className="text-xs"
                >
                  Login as Citizen
                </Button>
                <Button 
                  onClick={() => handleMockLogin('admin')} 
                  variant="outline"
                  className="text-xs"
                >
                  Login as Admin
                </Button>
                <Button 
                  onClick={() => handleMockLogin('staff')} 
                  variant="outline"
                  className="text-xs"
                >
                  Login as Staff
                </Button>
                <Button 
                  onClick={() => handleMockLogin('worker')} 
                  variant="outline"
                  className="text-xs"
                >
                  Login as Worker
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestLogin;