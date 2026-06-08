/**
 * Confetti dourado para o card de rolagem no tabuleiro (crítico/golpe pesado). Mesma vibe do
 * DiceToast, mas disparado a partir de uma posição de tela (acima do token) em vez de um canto fixo.
 */
import confetti from 'canvas-confetti';
import { getConfettiPalette } from '@/lib/themePalette';

/**
 * Dispara um burst de confetti temático a partir de um ponto da viewport (x,y em px de tela).
 * Usado quando uma rolagem crítica aparece acima de um token.
 */
export function fireRollConfetti(screenX: number, screenY: number): void {
  const palette = getConfettiPalette();
  const colors = [palette.primary, palette.secondary, palette.accent, palette.secondary];
  const origin = {
    x: Math.max(0, Math.min(1, screenX / window.innerWidth)),
    y: Math.max(0, Math.min(1, screenY / window.innerHeight)),
  };
  confetti({
    particleCount: 70,
    spread: 80,
    startVelocity: 34,
    colors,
    origin,
    scalar: 1.1,
    zIndex: 10000,
  });
}
