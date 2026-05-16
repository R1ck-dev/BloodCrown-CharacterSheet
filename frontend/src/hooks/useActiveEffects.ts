/**
 * Computa o map de buffs ativos a partir de:
 *   - Habilidades com isActive = true (somam todos os effects)
 *   - Itens com isEquipped = true (somam targetAttribute + effectValue,
 *     ignora REDUCE_* que sao economia de custo, nao buff de campo)
 *
 * Retorna:
 *   - buffs: Map<target, totalValue>  (ex: 'attrForca' -> 2)
 *   - activeAbilities: lista de habilidades ativas (pra renderizar painel)
 *   - hasAny: boolean conveniencia pra mostrar/esconder painel
 *
 * Memoizado por characterId + abilities + inventory (referencial).
 */
import { useMemo } from 'react';
import type { Ability, CharacterSheet } from '@/types/character';

export interface ActiveEffectsResult {
  buffs: Map<string, number>;
  activeAbilities: Ability[];
  hasAny: boolean;
}

export function useActiveEffects(character: CharacterSheet | undefined): ActiveEffectsResult {
  return useMemo(() => {
    const buffs = new Map<string, number>();
    const activeAbilities: Ability[] = [];

    if (!character) return { buffs, activeAbilities, hasAny: false };

    // Habilidades ativas
    for (const ability of character.abilities ?? []) {
      if (!ability.isActive) continue;
      activeAbilities.push(ability);
      for (const effect of ability.effects ?? []) {
        if (!effect.target || effect.target === 'none') continue;
        buffs.set(effect.target, (buffs.get(effect.target) ?? 0) + effect.value);
      }
    }

    // Itens equipados (so quando nao for REDUCE_* — economia tratada separado)
    for (const item of character.inventory ?? []) {
      if (!item.isEquipped) continue;
      if (!item.targetAttribute || item.targetAttribute === 'none') continue;
      if (item.targetAttribute.startsWith('REDUCE')) continue;
      buffs.set(
        item.targetAttribute,
        (buffs.get(item.targetAttribute) ?? 0) + (item.effectValue ?? 0),
      );
    }

    return { buffs, activeAbilities, hasAny: buffs.size > 0 || activeAbilities.length > 0 };
  }, [character]);
}

/** Convenience: retorna o buff (ou 0) pra um target especifico */
export function getBuff(buffs: Map<string, number>, target: string): number {
  return buffs.get(target) ?? 0;
}
