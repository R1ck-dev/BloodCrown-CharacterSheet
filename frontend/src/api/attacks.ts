import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Attack, CharacterSheet, NewAttackInput } from '@/types/character';
import { request } from './client';
import { characterKeys } from './characters';

async function createAttack(characterId: string, payload: NewAttackInput): Promise<Attack> {
  return request<Attack>(`/attacks/${characterId}`, {
    method: 'POST',
    body: payload,
  });
}

async function updateAttack(attackId: string, payload: NewAttackInput): Promise<Attack> {
  return request<Attack>(`/attacks/${attackId}`, {
    method: 'PUT',
    body: payload,
  });
}

async function deleteAttack(attackId: string): Promise<void> {
  return request<void>(`/attacks/${attackId}`, { method: 'DELETE' });
}

function patchSheet(
  qc: ReturnType<typeof useQueryClient>,
  characterId: string,
  updater: (prev: CharacterSheet) => CharacterSheet,
) {
  qc.setQueryData<CharacterSheet>(characterKeys.detail(characterId), (prev) =>
    prev ? updater(prev) : prev,
  );
}

export function useCreateAttack(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewAttackInput) => createAttack(characterId, payload),
    onSuccess: (created) => {
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        attacks: [...sheet.attacks, created],
      }));
      // CharacterSummary inclui attacks resumidos, entao a list precisa refletir o novo.
      qc.invalidateQueries({ queryKey: characterKeys.list() });
    },
  });
}

export function useUpdateAttack(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attackId, payload }: { attackId: string; payload: NewAttackInput }) =>
      updateAttack(attackId, payload),
    onSuccess: (updated) => {
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        attacks: sheet.attacks.map((a) => (a.id === updated.id ? updated : a)),
      }));
      qc.invalidateQueries({ queryKey: characterKeys.list() });
    },
  });
}

export function useDeleteAttack(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAttack,
    onMutate: async (attackId) => {
      await qc.cancelQueries({ queryKey: characterKeys.detail(characterId) });
      const snapshot = qc.getQueryData<CharacterSheet>(characterKeys.detail(characterId));
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        attacks: sheet.attacks.filter((a) => a.id !== attackId),
      }));
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(characterKeys.detail(characterId), ctx.snapshot);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.list() }),
  });
}
