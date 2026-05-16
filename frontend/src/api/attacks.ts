import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Attack, NewAttackInput } from '@/types/character';
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

export function useCreateAttack(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewAttackInput) => createAttack(characterId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) });
    },
  });
}

export function useUpdateAttack(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attackId, payload }: { attackId: string; payload: NewAttackInput }) =>
      updateAttack(attackId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) });
    },
  });
}

export function useDeleteAttack(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAttack,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) });
    },
  });
}
