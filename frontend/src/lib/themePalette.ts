/**
 * Le a paleta de confetti das CSS vars do tema atual.
 * Lido no momento do disparo via getComputedStyle, entao reflete o tema
 * corrente quando o usuario troca via ThemePicker (sem precisar re-mount).
 *
 * As 4 vars (--bc-confetti-primary/secondary/tertiary/accent) sao definidas
 * em tokens.css e sobrescritas por tema em themes.css. Cada tema mapeia
 * sua propria identidade pra essas 4 slots (ex: ryusei joga verde+amarelo+
 * vermelho-praga em vez de gold+purple).
 */

export interface ConfettiPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
}

function readVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function getConfettiPalette(): ConfettiPalette {
  return {
    primary:   readVar('--bc-confetti-primary',   '#D4AF37'),
    secondary: readVar('--bc-confetti-secondary', '#F5D76E'),
    tertiary:  readVar('--bc-confetti-tertiary',  '#9D4EDD'),
    accent:    readVar('--bc-confetti-accent',    '#FBF6E4'),
  };
}
