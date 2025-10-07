import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = '/' 
}) => {
  const { isAuthenticated, user, loading, hasRole } = useContext(AuthContext);
  const { toast } = useToast();
  const location = useLocation();
  
  // Debug logging (only in development)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProtectedRoute:', {
        isAuthenticated,
        userRole: user?.role,
        loading,
        pathname: location.pathname
      });
    }
  }, [isAuthenticated, user, loading, location.pathname]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Only show toast if user is trying to access a protected route (not the landing page)
    if (location.pathname !== '/' && location.pathname !== '/auth') {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
    }
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has the required role
  if (allowedRoles.length > 0 && isAuthenticated) {
    if (!hasRole(allowedRoles)) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page",
        variant: "destructive",
      });
      
      // Redirect based on user role
      const userRole = user?.role;
      let defaultRoute = '/';
      
      switch (userRole) {
        case 'admin':
          defaultRoute = '/admin';
          break;
        case 'staff':
          defaultRoute = user?.department?.slug ? `/${user.department.slug}/staff` : '/staff';
          break;
        case 'worker':
          defaultRoute = '/worker';
          break;
        case 'citizen':
          defaultRoute = user?.slug ? `/${user.slug}/dashboard` : '/dashboard';
          break;
        default:
          defaultRoute = '/';
      }
      
      return <Navigate to={defaultRoute} replace />;
    }
  }

  // If user is authenticated but trying to access auth pages, redirect to dashboard
  if (isAuthenticated && (
    location.pathname === '/login' || 
    location.pathname === '/register' ||
    location.pathname === '/admin-login' ||
    location.pathname === '/auth'
  )) {
    const userRole = user?.role;
    let dashboardRoute = '/';
    
    switch (userRole) {
      case 'admin':
        dashboardRoute = '/admin';
        break;
      case 'staff':
        dashboardRoute = user?.department?.slug ? `/${user.department.slug}/staff` : '/staff';
        break;
      case 'worker':
        dashboardRoute = '/worker';
        break;
      case 'citizen':
        dashboardRoute = user?.slug ? `/${user.slug}/dashboard` : '/dashboard';
        break;
      default:
        dashboardRoute = '/';
    }
    
    return <Navigate to={dashboardRoute} replace />;
  }

  // User has access, render the protected component
  return children;
};

// Convenience components for specific roles
export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

export const StaffRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['staff', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const WorkerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['worker', 'staff', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const CitizenRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['citizen']}>
    {children}
  </ProtectedRoute>
);

// Public route that redirects authenticated users to their dashboard
export const PublicRoute = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;