import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect user to their default role dashboard
    const defaultRoute =
      role === 'DONOR'
        ? '/donor/dashboard'
        : role === 'INSTITUTION_ADMIN'
        ? '/institution/dashboard'
        : role === 'VOLUNTEER'
        ? '/volunteer/dashboard'
        : role === 'SUPER_ADMIN'
        ? '/admin/dashboard'
        : '/';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
