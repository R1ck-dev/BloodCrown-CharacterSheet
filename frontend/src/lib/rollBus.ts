/**
 * Pub/sub minimalista pra rolagens de dado.
 *
 * useDiceRoll publica resultados aqui via publishRoll(). O DiceToast (e
 * outros listeners no futuro) subscrevem via subscribeRoll() pra reagir
 * ao evento — fazer animacao, disparar confetti, etc.
 *
 * Mais simples que zustand/context pra um caso de uso pontual: zero deps,
 * zero overhead de re-render por componentes que nao precisam saber.
 */
import type { RollResult } from '@/lib/dice';

type Listener = (roll: RollResult) => void;

const listeners = new Set<Listener>();

export function publishRoll(roll: RollResult) {
  for (const listener of listeners) listener(roll);
}

export function subscribeRoll(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
