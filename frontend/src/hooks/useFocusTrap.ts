/**
 * useFocusTrap — prende foco dentro do container enquanto `active` for true.
 *
 * Comportamento:
 *   - No mount/active: foca primeiro elemento focavel do container.
 *   - Tab no ultimo focavel pula pro primeiro; Shift+Tab no primeiro pula pro ultimo.
 *   - Restaura foco no trigger (document.activeElement no momento que `active` virou
 *     true) quando `active` virar false ou no unmount.
 *   - Recalcula a lista de focaveis a cada Tab (suporta conteudo dinamico).
 *
 * Uso (BottomSheet / Modal):
 *   const ref = useRef<HTMLDivElement>(null);
 *   useFocusTrap(ref, isOpen);
 */
import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('disabled'),
  );
}

export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    previousFocus.current = document.activeElement as HTMLElement;
    const focusables = getFocusables(container);
    focusables[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const current = getFocusables(container);
      if (current.length === 0) {
        e.preventDefault();
        return;
      }
      const first = current[0];
      const last = current[current.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', onKey);
    return () => {
      container.removeEventListener('keydown', onKey);
      previousFocus.current?.focus?.();
    };
  }, [active, ref]);
}
