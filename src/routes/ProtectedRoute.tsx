import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui/Spinner';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { token, isHydrating } = useAuth();

  if (isHydrating) {
    return <Spinner />;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

