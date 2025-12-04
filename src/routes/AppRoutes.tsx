import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ConnectionsPage } from '../pages/ConnectionsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AppLayout } from '../components/layout/AppLayout';
import { UserDetailPage } from '../pages/UserDetailPage';
import { FeedPage } from '../pages/FeedPage';

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/users/:username" element={<UserDetailPage />} />
      </Route>
    </Route>

    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);

export default AppRoutes;

