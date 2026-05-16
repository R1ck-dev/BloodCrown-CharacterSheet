/**
 * Hook de tema — le do localStorage no mount, expoe setter que aplica + persiste.
 * O tema ja foi aplicado pelo script inline em index.html, entao nao ha flash.
 */
import { useState } from 'react';
import { applyTheme, getStoredTheme, type ThemeKey } from '@/lib/theme';

export function useTheme(): [ThemeKey, (theme: ThemeKey) => void] {
  const [theme, setTheme] = useState<ThemeKey>(() => getStoredTheme());

  const update = (next: ThemeKey) => {
    applyTheme(next);
    setTheme(next);
  };

  return [theme, update];
}
