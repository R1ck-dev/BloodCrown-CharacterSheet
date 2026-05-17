import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CharacterPatch, CharacterSheet, CharacterSummary } from '@/types/character';
import { request } from './client';

export const characterKeys = {
  all: ['characters'] as const,
  list: () => [...characterKeys.all, 'list'] as const,
  detail: (id: string) => [...characterKeys.all, 'detail', id] as const,
};

async function listCharacters(): Promise<CharacterSummary[]> {
  return request<CharacterSummary[]>('/characters');
}

async function getCharacter(id: string): Promise<CharacterSheet> {
  return request<CharacterSheet>(`/characters/${id}`);
}

async function createCharacter(): Promise<CharacterSummary> {
  return request<CharacterSummary>('/characters', { method: 'POST' });
}

async function updateCharacter(payload: CharacterSheet): Promise<CharacterSheet> {
  return request<CharacterSheet>(`/characters/${payload.id}`, {
    method: 'PUT',
    body: payload,
  });
}

async function patchCharacter(id: string, patch: CharacterPatch): Promise<CharacterSheet> {
  return request<CharacterSheet>(`/characters/${id}`, {
    method: 'PATCH',
    body: patch,
  });
}

async function deleteCharacter(id: string): Promise<void> {
  return request<void>(`/characters/${id}`, { method: 'DELETE' });
}

async function restCharacter(id: string): Promise<CharacterSheet> {
  return request<CharacterSheet>(`/characters/${id}/rest`, { method: 'POST' });
}

// ---------- Hooks ----------

export function useCharacters() {
  return useQuery({
    queryKey: characterKeys.list(),
    queryFn: listCharacters,
  });
}

export function useCharacter(id: string | undefined) {
  return useQuery({
    queryKey: characterKeys.detail(id ?? ''),
    queryFn: () => getCharacter(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCharacter,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: characterKeys.list() });
    },
  });
}

export function useUpdateCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCharacter,
    onSuccess: (data) => {
      qc.setQueryData(characterKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: characterKeys.list() });
    },
  });
}

/**
 * Patch parcial — usado pelo useAutoSave pra mandar so dirtyFields em vez do
 * agregado inteiro. Backend retorna o CharacterSheet pos-patch pra atualizar
 * cache direto, sem GET extra. List e invalidada porque CharacterSummary
 * inclui name/level/health.
 */
export function usePatchCharacter(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: CharacterPatch) => patchCharacter(id, patch),
    onSuccess: (data) => {
      qc.setQueryData(characterKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: characterKeys.list() });
    },
  });
}

export function useDeleteCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCharacter,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: characterKeys.list() });
    },
  });
}

export function useRestCharacter(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => restCharacter(id),
    onSuccess: (sheet) => qc.setQueryData(characterKeys.detail(id), sheet),
  });
}
