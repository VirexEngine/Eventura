import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * ProtectedRoute — Blocks unauthorized access by role.
 * Redirects to /dashboard if the user's role is not in allowedRoles.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Unauthorized role — redirect to dashboard with a message
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
