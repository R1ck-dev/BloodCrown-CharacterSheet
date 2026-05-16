import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CharacterSheet, CharacterSummary } from '@/types/character';
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

async function deleteCharacter(id: string): Promise<void> {
  return request<void>(`/characters/${id}`, { method: 'DELETE' });
}

async function restCharacter(id: string): Promise<void> {
  return request<void>(`/characters/${id}/rest`, { method: 'POST' });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: characterKeys.detail(id) });
    },
  });
}
