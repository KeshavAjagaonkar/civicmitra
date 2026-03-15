import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * SlugRedirect — Redirects legacy (non-slug) citizen and staff routes to their slug-based equivalents.
 * 
 * For citizens: /dashboard → /:userSlug/dashboard
 * For staff:    /staff/... → /:deptSlug/staff/...
 * 
 * Falls through to <children> if no slug is available (graceful degradation).
 */
const SlugRedirect = ({ children, type = 'citizen' }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (type === 'citizen' && user?.slug) {
    // Redirect /dashboard → /:slug/dashboard, /complaints → /:slug/complaints, etc.
    const sluggedPath = `/${user.slug}${location.pathname}`;
    return <Navigate to={sluggedPath} replace />;
  }

  if (type === 'staff' && user?.department?.slug) {
    // Redirect /staff/... → /:deptSlug/staff/...
    const sluggedPath = `/${user.department.slug}${location.pathname}`;
    return <Navigate to={sluggedPath} replace />;
  }

  // No slug available — render the page directly (graceful degradation)
  return children;
};

export default SlugRedirect;
