import type { PropsWithChildren } from 'react';
import { Navigate, Route } from 'react-router-dom';

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { useAppSelector } from '@/store/hooks';

function AdminAuthPageGuard({ children }: PropsWithChildren) {
  const isAdminAuthenticated = useAppSelector(
    (state) => state.adminAuth.isAuthenticated,
  );

  if (isAdminAuthenticated) {
    return <Navigate replace to="/admin/dashboard" />;
  }
  return <>{children}</>;
}

function AdminProtectedRoute({ children }: PropsWithChildren) {
  const isAuthenticated = useAppSelector((state) => state.adminAuth.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate replace to="/admin/login" />;
  }
  return <>{children}</>;
}

export const adminRoutes = (
  <>
    <Route
      element={
        <AdminAuthPageGuard>
          <AdminLoginPage />
        </AdminAuthPageGuard>
      }
      path="/admin/login"
    />
    <Route
      element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }
      path="/admin"
    >
      <Route element={<Navigate replace to="dashboard" />} index />
      <Route element={<AdminDashboardPage />} path="dashboard" />
    </Route>
  </>
);
