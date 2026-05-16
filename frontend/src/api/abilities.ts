import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Ability, AbilityResource, ActionType, NewAbilityInput } from '@/types/character';
import { request } from './client';
import { characterKeys } from './characters';

async function createAbility(characterId: string, payload: NewAbilityInput): Promise<Ability> {
  return request<Ability>(`/abilities/${characterId}`, {
    method: 'POST',
    body: payload,
  });
}

async function updateAbility(abilityId: string, payload: NewAbilityInput): Promise<Ability> {
  return request<Ability>(`/abilities/${abilityId}`, {
    method: 'PUT',
    body: payload,
  });
}

async function deleteAbility(abilityId: string): Promise<void> {
  return request<void>(`/abilities/${abilityId}`, { method: 'DELETE' });
}

async function toggleAbility(abilityId: string, spendAs?: ActionType): Promise<void> {
  const qs = spendAs ? `?spendAs=${spendAs}` : '';
  return request<void>(`/abilities/${abilityId}/toggle${qs}`, { method: 'POST' });
}

async function recoverAbility(abilityId: string, resource: AbilityResource): Promise<void> {
  return request<void>(`/abilities/${abilityId}/recover?resource=${resource}`, {
    method: 'POST',
  });
}

async function advanceTurn(characterId: string): Promise<void> {
  return request<void>(`/abilities/next-turn/${characterId}`, { method: 'POST' });
}

export function useCreateAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewAbilityInput) => createAbility(characterId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}

export function useUpdateAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ abilityId, payload }: { abilityId: string; payload: NewAbilityInput }) =>
      updateAbility(abilityId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}

export function useDeleteAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAbility,
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}

export function useToggleAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ abilityId, spendAs }: { abilityId: string; spendAs?: ActionType }) =>
      toggleAbility(abilityId, spendAs),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}

export function useRecoverAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ abilityId, resource }: { abilityId: string; resource: AbilityResource }) =>
      recoverAbility(abilityId, resource),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}

export function useAdvanceTurn(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => advanceTurn(characterId),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}
