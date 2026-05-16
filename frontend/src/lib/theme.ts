/**
 * Tema visual da aplicacao — 6 paletas (default + 5 personagens).
 * Aplicado via [data-theme="..."] no <html>. Persistido em localStorage.
 * Script inline em index.html aplica o tema antes do bundle rodar (evita flash).
 */

export type ThemeKey = 'default' | 'sylvie' | 'shitonama' | 'sozoku' | 'ryusei' | 'nozomu';

export interface ThemeDef {
  key: ThemeKey;
  label: string;
  subtitle: string;
  swatch: string;
}

export const THEMES: ThemeDef[] = [
  { key: 'default',   label: 'Realeza Sangrenta', subtitle: 'tema padrao',         swatch: '#D4AF37' },
  { key: 'sylvie',    label: 'Sylvie',            subtitle: 'dragao lendario',     swatch: '#B71C3C' },
  { key: 'shitonama', label: 'Shitonama',         subtitle: 'donzela perola',      swatch: '#26C6DA' },
  { key: 'sozoku',    label: 'Sozoku',            subtitle: 'imperador vermelho',  swatch: '#8B0000' },
  { key: 'ryusei',    label: 'Ryusei',            subtitle: 'rei monstro',   swatch: '#00E676' },
  { key: 'nozomu',    label: 'Nozomu',            subtitle: 'arcano elfico',       swatch: '#5E35B1' },
];

const STORAGE_KEY = 'bc_theme';

function isThemeKey(v: unknown): v is ThemeKey {
  return typeof v === 'string' && THEMES.some((t) => t.key === v);
}

/** Le tema salvo. Fallback pra 'default' se invalido/ausente. */
export function getStoredTheme(): ThemeKey {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isThemeKey(v) ? v : 'default';
  } catch {
    return 'default';
  }
}

/** Aplica o tema no <html> e persiste. Default remove o atributo. */
export function applyTheme(theme: ThemeKey): void {
  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage indisponivel — tema vale ate o reload */
  }
}
