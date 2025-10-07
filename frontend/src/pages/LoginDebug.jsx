import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginDebug = () => {
  const { user, isAuthenticated, loading, login, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginResult, setLoginResult] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Test login function
  const testLogin = async () => {
    setIsLoggingIn(true);
    setLoginResult(null);
    
    try {
      const result = await login({
        email: 'citizen@civicmitra.com',
        password: 'citizen123'
      });
      
      setLoginResult(result);
      console.log('Login result:', result);
    } catch (error) {
      setLoginResult({ success: false, error: error.message });
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000');
      const text = await response.text();
      console.log('Backend response:', text);
      alert(`Backend response: ${text}`);
    } catch (error) {
      console.error('Backend connection error:', error);
      alert(`Backend connection failed: ${error.message}`);
    }
  };

  const testAuthAPI = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'citizen@civicmitra.com',
          password: 'citizen123'
        })
      });
      
      const data = await response.json();
      console.log('Auth API response:', data);
      alert(`Auth API response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Auth API error:', error);
      alert(`Auth API failed: ${error.message}`);
    }
  };

  const navigateToPages = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 CivicMitra Login & Routing Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Authentication Status */}
            <div className="border rounded p-4 bg-blue-50">
              <h3 className="font-semibold mb-2">Authentication Status</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Loading:</strong> <span className={loading ? 'text-orange-600' : 'text-green-600'}>{loading ? 'true' : 'false'}</span></p>
                <p><strong>Authenticated:</strong> <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? 'true' : 'false'}</span></p>
                <p><strong>Current Path:</strong> {location.pathname}</p>
                <p><strong>User Data:</strong></p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {user ? JSON.stringify(user, null, 2) : 'null'}
                </pre>
              </div>
            </div>

            {/* Role Testing */}
            {user && (
              <div className="border rounded p-4 bg-green-50">
                <h3 className="font-semibold mb-2">Role Testing</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>hasRole(['citizen']): <span className={hasRole(['citizen']) ? 'text-green-600' : 'text-red-600'}>{hasRole(['citizen']).toString()}</span></p>
                  <p>hasRole(['admin']): <span className={hasRole(['admin']) ? 'text-green-600' : 'text-red-600'}>{hasRole(['admin']).toString()}</span></p>
                  <p>hasRole(['staff']): <span className={hasRole(['staff']) ? 'text-green-600' : 'text-red-600'}>{hasRole(['staff']).toString()}</span></p>
                  <p>hasRole(['worker']): <span className={hasRole(['worker']) ? 'text-green-600' : 'text-red-600'}>{hasRole(['worker']).toString()}</span></p>
                </div>
              </div>
            )}

            {/* Test Actions */}
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">Test Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button onClick={testLogin} disabled={isLoggingIn}>
                  {isLoggingIn ? 'Logging in...' : 'Test Citizen Login'}
                </Button>
                <Button onClick={testBackendConnection} variant="outline">
                  Test Backend Connection
                </Button>
                <Button onClick={testAuthAPI} variant="outline">
                  Test Auth API
                </Button>
              </div>
            </div>

            {/* Login Result */}
            {loginResult && (
              <div className={`border rounded p-4 ${loginResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className="font-semibold mb-2">Login Result</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(loginResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Navigation Test */}
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">Navigation Test</h3>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigateToPages('/')} variant="outline" size="sm">
                  Home
                </Button>
                <Button onClick={() => navigateToPages('/dashboard')} variant="outline" size="sm">
                  Dashboard
                </Button>
                <Button onClick={() => navigateToPages('/complaints')} variant="outline" size="sm">
                  Complaints
                </Button>
                <Button onClick={() => navigateToPages('/login')} variant="outline" size="sm">
                  Login
                </Button>
                <Button onClick={() => navigateToPages('/admin')} variant="outline" size="sm">
                  Admin
                </Button>
              </div>
            </div>

            {/* Local Storage Debug */}
            <div className="border rounded p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Local Storage Debug</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Not found'}</p>
                <p><strong>User:</strong> {localStorage.getItem('user') ? 'Present' : 'Not found'}</p>
                {localStorage.getItem('user') && (
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {localStorage.getItem('user')}
                  </pre>
                )}
                <Button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }} 
                  variant="destructive" 
                  size="sm"
                >
                  Clear Storage & Reload
                </Button>
              </div>
            </div>

            {/* Environment Debug */}
            <div className="border rounded p-4 bg-purple-50">
              <h3 className="font-semibold mb-2">Environment Debug</h3>
              <div className="text-sm space-y-1">
                <p><strong>Backend URL:</strong> {import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}</p>
                <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
                <p><strong>Dev:</strong> {import.meta.env.DEV ? 'true' : 'false'}</p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginDebug;