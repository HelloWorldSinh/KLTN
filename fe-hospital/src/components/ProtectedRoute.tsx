import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type Role } from '../store/authStore';
import { isTokenExpired } from '../utils/jwt';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, token, logout } = useAuthStore();

  const isExpired = isTokenExpired(token);

  useEffect(() => {
    // Clean up store state if the token is expired on load
    if (token && isExpired) {
      logout();
    }
  }, [token, isExpired, logout]);

  if (!isAuthenticated || !user || isExpired) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
