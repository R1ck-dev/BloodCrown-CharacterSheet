import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenStorage } from '@/api/client';

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  const token = tokenStorage.get();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
