import React from 'react';
// Import Outlet from react-router-dom
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Wait for the context to finish loading user info
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-lg loading-spinner"></span>
      </div>
    );
  }

  // 2. If loading is done and there's no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If a user exists but their role is not allowed, redirect
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. If all checks pass, render the nested route content
  return <Outlet />;
};

export default ProtectedRoute;