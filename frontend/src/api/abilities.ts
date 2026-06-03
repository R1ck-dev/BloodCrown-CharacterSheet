import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Ability,
  AbilityResource,
  ActionType,
  CharacterSheet,
  NewAbilityInput,
} from '@/types/character';
import { request } from './client';
import { characterKeys } from './characters';
import { playSound } from '@/lib/sound';

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

async function toggleAbility(abilityId: string, spendAs?: ActionType): Promise<CharacterSheet> {
  const qs = spendAs ? `?spendAs=${spendAs}` : '';
  return request<CharacterSheet>(`/abilities/${abilityId}/toggle${qs}`, { method: 'POST' });
}

async function recoverAbility(abilityId: string, resource: AbilityResource): Promise<CharacterSheet> {
  return request<CharacterSheet>(`/abilities/${abilityId}/recover?resource=${resource}`, {
    method: 'POST',
  });
}

async function advanceTurn(characterId: string): Promise<CharacterSheet> {
  return request<CharacterSheet>(`/abilities/next-turn/${characterId}`, { method: 'POST' });
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

export function useCreateAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewAbilityInput) => createAbility(characterId, payload),
    onSuccess: (created) => {
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        abilities: [...sheet.abilities, created],
      }));
    },
  });
}

export function useUpdateAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ abilityId, payload }: { abilityId: string; payload: NewAbilityInput }) =>
      updateAbility(abilityId, payload),
    onSuccess: (updated) => {
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        abilities: sheet.abilities.map((a) => (a.id === updated.id ? updated : a)),
      }));
    },
  });
}

export function useDeleteAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAbility,
    onMutate: async (abilityId) => {
      await qc.cancelQueries({ queryKey: characterKeys.detail(characterId) });
      const snapshot = qc.getQueryData<CharacterSheet>(characterKeys.detail(characterId));
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        abilities: sheet.abilities.filter((a) => a.id !== abilityId),
      }));
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(characterKeys.detail(characterId), ctx.snapshot);
    },
  });
}

export function useToggleAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ abilityId, spendAs }: { abilityId: string; spendAs?: ActionType }) =>
      toggleAbility(abilityId, spendAs),
    onSuccess: (sheet) => {
      qc.setQueryData(characterKeys.detail(characterId), sheet);
      playSound('ability');
    },
  });
}

export function useRecoverAbility(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ abilityId, resource }: { abilityId: string; resource: AbilityResource }) =>
      recoverAbility(abilityId, resource),
    onSuccess: (sheet) => qc.setQueryData(characterKeys.detail(characterId), sheet),
  });
}

export function useAdvanceTurn(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => advanceTurn(characterId),
    onSuccess: (sheet) => {
      qc.setQueryData(characterKeys.detail(characterId), sheet);
      playSound('turn');
    },
  });
}
