import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui/Spinner';

export const PublicRoute = () => {
  const { token, isHydrating } = useAuth();

  if (isHydrating) {
    return <Spinner />;
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

