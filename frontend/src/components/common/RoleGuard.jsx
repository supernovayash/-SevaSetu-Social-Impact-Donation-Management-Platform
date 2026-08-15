import React from 'react';
import useAuth from '../../hooks/useAuth';

const RoleGuard = ({ allowedRoles, children, fallback = null }) => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return fallback;

  if (allowedRoles && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return fallback;
};

export default RoleGuard;
