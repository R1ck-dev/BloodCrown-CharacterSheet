/**
 * Hook de breakpoint — retorna 'mobile' | 'tablet' | 'desktop' sincronizado
 * com tokens.css (bloco 11. BREAKPOINTS). Usa useSyncExternalStore pra ser
 * SSR-safe e robusto a StrictMode/concurrent rendering.
 *
 * IMPORTANTE: os literais aqui DEVEM permanecer em sincronia com:
 *   - styles/tokens.css (--bc-bp-tablet, --bc-bp-desktop)
 *   - styles/utilities.css (.bc-hide-mobile/.bc-only-mobile/etc.)
 *   - todas as @media queries dos components/*.css
 *
 * CSS nao aceita var() dentro de @media, entao a duplicacao e' inevitavel —
 * a fonte de verdade conceitual e' tokens.css; este TS apenas espelha.
 */
import { useSyncExternalStore } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const TABLET_MIN = 640;
const DESKTOP_MIN = 1024;

function getSnapshot(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w >= DESKTOP_MIN) return 'desktop';
  if (w >= TABLET_MIN) return 'tablet';
  return 'mobile';
}

function getServerSnapshot(): Breakpoint {
  return 'desktop';
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mqTablet = window.matchMedia(`(min-width: ${TABLET_MIN}px)`);
  const mqDesktop = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
  mqTablet.addEventListener('change', callback);
  mqDesktop.addEventListener('change', callback);
  return () => {
    mqTablet.removeEventListener('change', callback);
    mqDesktop.removeEventListener('change', callback);
  };
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobile(): boolean {
  return useBreakpoint() === 'mobile';
}
