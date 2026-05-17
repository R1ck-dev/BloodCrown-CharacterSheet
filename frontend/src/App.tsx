import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { onUnauthorized } from '@/api/client';

/**
 * Fallback minimalista exibido enquanto o chunk da rota e baixado.
 * Mantemos o pano de fundo grimorio (bc-page / bc-grain) pra evitar
 * flash branco — o fallback se confunde com a tela final.
 */
function RouteLoadingFallback() {
  return (
    <main
      className="bc-page bc-grain"
      style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}
    >
      <p style={{ color: 'var(--bc-ink-dim)', fontFamily: 'var(--bc-font-display)', letterSpacing: '0.12em' }}>
        Carregando...
      </p>
    </main>
  );
}

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
        <Suspense fallback={<RouteLoadingFallback />}>
          <RouterProvider router={router} />
        </Suspense>
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
