import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SheetPage } from '@/pages/SheetPage';
import { SandboxPage } from '@/pages/SandboxPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const baseRoutes = [
  { path: '/', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sheet/:id',
    element: (
      <ProtectedRoute>
        <SheetPage />
      </ProtectedRoute>
    ),
  },
];

// Rota /sandbox exposta apenas em dev pra validacao visual do design system.
const devRoutes = import.meta.env.DEV ? [{ path: '/sandbox', element: <SandboxPage /> }] : [];

export const router = createBrowserRouter([
  ...baseRoutes,
  ...devRoutes,
  { path: '*', element: <Navigate to="/" replace /> },
]);
