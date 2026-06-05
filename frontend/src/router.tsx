import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Code-splitting por rota: cada page vira um chunk separado, baixado sob demanda.
// As pages exportam named (export function X), entao adaptamos o modulo pro
// shape { default } que React.lazy espera.
const LoginPage     = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage  = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SheetPage     = lazy(() => import('@/pages/SheetPage').then((m) => ({ default: m.SheetPage })));
const MesaPage      = lazy(() => import('@/pages/MesaPage').then((m) => ({ default: m.MesaPage })));
const SandboxPage   = lazy(() => import('@/pages/SandboxPage').then((m) => ({ default: m.SandboxPage })));

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
  {
    path: '/mesa/:id',
    element: (
      <ProtectedRoute>
        <MesaPage />
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
