/**
 * Wrapper de rolagem — publica resultado no rollBus pro DiceToast renderizar
 * com animacao (numeros girando, critico dourado, confetti). Erros simples
 * (formula vazia) ainda usam Sonner pra feedback imediato.
 */
import { useCallback } from 'react';
import { toast } from 'sonner';
import { rollAttribute, rollDamage } from '@/lib/dice';
import { publishRoll } from '@/lib/rollBus';

export function useDiceRoll() {
  const rollAttr = useCallback((source: string, attrValue: number, skillBonus = 0) => {
    const result = rollAttribute(source, attrValue, skillBonus);
    publishRoll(result);
    return result;
  }, []);

  const rollDmg = useCallback((formula: string, source: string) => {
    const result = rollDamage(formula, source);
    if (!result) {
      toast.error('Formula de dano vazia ou invalida.');
      return null;
    }
    publishRoll(result);
    return result;
  }, []);

  return { rollAttr, rollDmg };
}
