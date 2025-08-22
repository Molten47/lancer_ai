import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuthService from '../auth';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthService();
  const location = useLocation();
  const profileCompleted = localStorage.getItem('profileCompleted') === 'true';
  const userRole = localStorage.getItem('userRole') || 'freelancer';
  
  // Declare accessJwt FIRST
  const accessJwt = localStorage.getItem('access_jwt') || localStorage.getItem('access_token');
  
  // THEN use it in userId extraction
  const userId = localStorage.getItem('user_id') || 
    (accessJwt ? JSON.parse(atob(accessJwt.split('.')[1])).user_id?.toString() : null);

  console.log('ProtectedRoute check:', {
    isAuthenticated,
    profileCompleted,
    userId,
    accessJwt,
    userRole,
    location: location.pathname,
  });

  if (!isAuthenticated || !accessJwt) {
    console.error('Redirecting to login: Missing authentication');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profileCompleted) {
    console.error('Redirecting to profile_setup: Profile incomplete');
    return <Navigate to="/profile_setup" state={{ from: location, role: userRole, fromProfileSetup: true }} replace />;
  }

  if (!userId) {
    console.error('Redirecting to login: Missing user_id');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;