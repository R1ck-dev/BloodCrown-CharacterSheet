/**
 * Helpers do sistema de economia de acoes por turno.
 * Reflete a logica do backend (ActionTypeEnum.canSubstitute):
 * Padrao > Bonus > Movimento. Reacao isolada. Livre sem custo.
 */
import type { ActionPool, ActionType } from '@/types/character';

export const ACTION_LABELS: Record<ActionType, string> = {
  STANDARD: 'Padrao',
  BONUS: 'Bonus',
  MOVEMENT: 'Movimento',
  REACTION: 'Reacao',
  FREE: 'Livre',
  FULL: 'Completa',
};

/**
 * Cor por tipo — escolhida pra leitura rapida no pool de luzes
 * (verde/ambar/azul/roxo, paleta sem conflito com vida/mana/sanidade).
 * FULL usa laranja-brasa como sinal "consome tudo".
 */
export const ACTION_COLORS: Record<ActionType, string> = {
  STANDARD: '#22C55E',     // verde — acao principal
  BONUS:    '#EAB308',     // ambar — apoio
  MOVEMENT: '#3B82F6',     // azul — mobilidade
  REACTION: '#9D4EDD',     // roxo — reacao distinta
  FREE:     '#A89E8A',     // cinza — sem custo
  FULL:     '#EA580C',     // laranja-brasa — drena tudo
};

/**
 * Hierarquia D&D-like — espelhada do backend pra UX.
 * REACTION e FULL nao sao substituidos nem substituem outros.
 */
export function canSubstitute(spent: ActionType, required: ActionType): boolean {
  if (spent === required) return true;
  if (required === 'REACTION' || required === 'FULL') return false;
  if (spent === 'REACTION' || spent === 'FREE' || spent === 'FULL') return false;
  if (spent === 'STANDARD') return required === 'BONUS' || required === 'MOVEMENT';
  if (spent === 'BONUS') return required === 'MOVEMENT';
  return false;
}

/**
 * Quanto resta no pool pra cada tipo. FREE = infinito.
 * FULL = 1 se pool intacto (Padrão+Bônus+Movimento todos no max), senão 0.
 */
export function poolRemaining(pool: ActionPool | null | undefined, type: ActionType): number {
  if (!pool) return 0;
  if (type === 'FREE') return Infinity;
  if (type === 'FULL') {
    const intact = (pool.currentStandard ?? 0) === (pool.maxStandard ?? 0)
                && (pool.currentBonus    ?? 0) === (pool.maxBonus    ?? 0)
                && (pool.currentMovement ?? 0) === (pool.maxMovement ?? 0);
    return intact ? 1 : 0;
  }
  switch (type) {
    case 'STANDARD': return pool.currentStandard ?? 0;
    case 'BONUS':    return pool.currentBonus ?? 0;
    case 'MOVEMENT': return pool.currentMovement ?? 0;
    case 'REACTION': return pool.currentReaction ?? 0;
  }
}

/**
 * Lista alternativas (sem o tipo default) que podem cobrir `required`
 * e tem pool disponivel. Usado pra renderizar prompt "Sem X, gastar Y?".
 */
export function availableSubstitutes(pool: ActionPool | null | undefined, required: ActionType): ActionType[] {
  const candidates: ActionType[] = ['STANDARD', 'BONUS', 'MOVEMENT', 'REACTION', 'FREE'];
  return candidates.filter(
    (c) => c !== required && canSubstitute(c, required) && poolRemaining(pool, c) > 0,
  );
}
