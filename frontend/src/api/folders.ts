import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Folder, NewFolderInput } from '@/types/character';
import { request } from './client';
import { characterKeys } from './characters';

export const folderKeys = {
  all: ['folders'] as const,
  list: () => [...folderKeys.all, 'list'] as const,
};

async function listFolders(): Promise<Folder[]> {
  return request<Folder[]>('/folders');
}

async function createFolder(payload: NewFolderInput): Promise<Folder> {
  return request<Folder>('/folders', { method: 'POST', body: payload });
}

async function renameFolder(folderId: string, payload: NewFolderInput): Promise<Folder> {
  return request<Folder>(`/folders/${folderId}`, { method: 'PUT', body: payload });
}

async function deleteFolder(folderId: string): Promise<void> {
  return request<void>(`/folders/${folderId}`, { method: 'DELETE' });
}

async function moveCharacter(characterId: string, folderId: string | null): Promise<void> {
  return request<void>(`/characters/${characterId}/folder`, {
    method: 'PATCH',
    body: { folderId },
  });
}

// ---------- Hooks ----------

export function useFolders() {
  return useQuery({
    queryKey: folderKeys.list(),
    queryFn: listFolders,
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => qc.invalidateQueries({ queryKey: folderKeys.list() }),
  });
}

export function useRenameFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, payload }: { folderId: string; payload: NewFolderInput }) =>
      renameFolder(folderId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: folderKeys.list() }),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      // Delete tambem move chars pra raiz no backend — invalida lista de chars
      qc.invalidateQueries({ queryKey: folderKeys.list() });
      qc.invalidateQueries({ queryKey: characterKeys.list() });
    },
  });
}

export function useMoveCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ characterId, folderId }: { characterId: string; folderId: string | null }) =>
      moveCharacter(characterId, folderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.list() }),
  });
}
