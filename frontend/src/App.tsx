import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { onUnauthorized } from '@/api/client';

export default function App() {
  useEffect(() => {
    onUnauthorized(() => {
      // Recarrega no caminho '/' (login). A flag replace evita poluir o
      // historico do browser com a pagina protegida que disparou o 401.
      if (window.location.pathname !== '/') {
        window.location.replace('/');
      }
    });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              background: 'var(--bc-surface-2)',
              border: '1px solid var(--bc-edge)',
              color: 'var(--bc-ink)',
            },
          }}
        />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
