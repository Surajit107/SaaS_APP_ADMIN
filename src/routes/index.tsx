import { Navigate, Route, Routes } from 'react-router-dom';

import { OperatorHomePage } from '@/pages/OperatorHomePage';
import { adminRoutes } from '@/routes/admin';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<OperatorHomePage />} path="/" />
      {adminRoutes}
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
