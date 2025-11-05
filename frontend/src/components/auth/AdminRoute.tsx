import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactElement;
}

/**
 * A route guard that checks for a valid session AND the 'Admin' role.
 * Redirects to the login page if not authenticated, or dashboard if not an admin.
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return(
        <div>Loading...</div>
    )
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they are redirected back after logging in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'Admin') {
    // User is logged in but is not an admin.
    // Redirect them to the dashboard.
    console.warn('Access denied: User is not an admin.');
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and is an Admin, render the children
  return children;
};