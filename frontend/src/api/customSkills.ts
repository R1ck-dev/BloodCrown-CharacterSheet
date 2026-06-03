/**
 * Hooks de perícias personalizadas — coleção dinâmica do personagem, no mesmo
 * molde de abilities.ts/attacks.ts: cada mutation chama /custom-skills e
 * sincroniza o cache do personagem (characterKeys.detail) sem GET extra.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CharacterSheet, CustomSkill, NewCustomSkillInput } from '@/types/character';
import { request } from './client';
import { characterKeys } from './characters';

async function createCustomSkill(characterId: string, payload: NewCustomSkillInput): Promise<CustomSkill> {
  return request<CustomSkill>(`/custom-skills/${characterId}`, {
    method: 'POST',
    body: payload,
  });
}

async function updateCustomSkill(customSkillId: string, payload: NewCustomSkillInput): Promise<CustomSkill> {
  return request<CustomSkill>(`/custom-skills/${customSkillId}`, {
    method: 'PUT',
    body: payload,
  });
}

async function deleteCustomSkill(customSkillId: string): Promise<void> {
  return request<void>(`/custom-skills/${customSkillId}`, { method: 'DELETE' });
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

export function useCreateCustomSkill(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewCustomSkillInput) => createCustomSkill(characterId, payload),
    onSuccess: (created) => {
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        customSkills: [...(sheet.customSkills ?? []), created],
      }));
    },
  });
}

export function useUpdateCustomSkill(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customSkillId, payload }: { customSkillId: string; payload: NewCustomSkillInput }) =>
      updateCustomSkill(customSkillId, payload),
    onSuccess: (updated) => {
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        customSkills: (sheet.customSkills ?? []).map((s) => (s.id === updated.id ? updated : s)),
      }));
    },
  });
}

export function useDeleteCustomSkill(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomSkill,
    onMutate: async (customSkillId) => {
      await qc.cancelQueries({ queryKey: characterKeys.detail(characterId) });
      const snapshot = qc.getQueryData<CharacterSheet>(characterKeys.detail(characterId));
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        customSkills: (sheet.customSkills ?? []).filter((s) => s.id !== customSkillId),
      }));
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(characterKeys.detail(characterId), ctx.snapshot);
    },
  });
}
