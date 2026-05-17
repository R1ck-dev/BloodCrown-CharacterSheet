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
  /** Cor unica resumida (compat com botao do picker — bola na navbar) */
  swatch: string;
  /** 4 cores principais da paleta — preview de paleta no dropdown */
  swatches: [string, string, string, string];
  /** Cor central do gradient do selo desse tema — preview de ornamento */
  sealColor: string;
  /** Peso de fonte display que esse tema aplica em .bc-btn / .bc-tracked */
  displayWeight: number;
  /** Letter-spacing display tematico — usado no preview de tipografia */
  displayTracking: string;
  /** Text-transform display do tema (todos uppercase hoje, tematizavel) */
  displayTransform: 'uppercase' | 'none';
}

export const THEMES: ThemeDef[] = [
  {
    key: 'default',
    label: 'Realeza Sangrenta',
    subtitle: 'tema padrao',
    swatch: '#D4AF37',
    swatches: ['#7B2CBF', '#D4AF37', '#8A0303', '#EDE6D6'],
    sealColor: '#B91C1C',
    displayWeight: 600,
    displayTracking: '0.22em',
    displayTransform: 'uppercase',
  },
  {
    key: 'sylvie',
    label: 'Sylvie',
    subtitle: 'dragao lendario',
    swatch: '#E63960',
    swatches: ['#7B1FA2', '#E5B355', '#E63960', '#FFD97A'],
    sealColor: '#FF4565',
    displayWeight: 700,
    displayTracking: '0.12em',
    displayTransform: 'uppercase',
  },
  {
    key: 'shitonama',
    label: 'Shitonama',
    subtitle: 'donzela perola',
    swatch: '#00BCD4',
    swatches: ['#00BCD4', '#B0BEC5', '#FF80AB', '#ECEFF1'],
    sealColor: '#FF80AB',
    displayWeight: 500,
    displayTracking: '0.06em',
    displayTransform: 'uppercase',
  },
  {
    key: 'sozoku',
    label: 'Sozoku',
    subtitle: 'imperador vermelho',
    swatch: '#C50000',
    swatches: ['#7B1F2C', '#D88572', '#C50000', '#F0A595'],
    sealColor: '#FF1744',
    displayWeight: 700,
    displayTracking: '0.22em',
    displayTransform: 'uppercase',
  },
  {
    key: 'ryusei',
    label: 'Ryusei',
    subtitle: 'rei monstro',
    swatch: '#00E676',
    swatches: ['#00E676', '#EEFF41', '#FF1744', '#69F0AE'],
    sealColor: '#69F0AE',
    displayWeight: 600,
    displayTracking: '0.12em',
    displayTransform: 'uppercase',
  },
  {
    key: 'nozomu',
    label: 'Nozomu',
    subtitle: 'arcano elfico',
    swatch: '#7E57C2',
    swatches: ['#7E57C2', '#C9A55A', '#B53030', '#E8C97A'],
    sealColor: '#B39DDB',
    displayWeight: 500,
    displayTracking: '0.30em',
    displayTransform: 'uppercase',
  },
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
