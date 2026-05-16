import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InventoryItem, NewItemInput } from '@/types/character';
import { request } from './client';
import { characterKeys } from './characters';

async function createItem(characterId: string, payload: NewItemInput): Promise<InventoryItem> {
  return request<InventoryItem>(`/items/${characterId}`, {
    method: 'POST',
    body: payload,
  });
}

async function updateItem(itemId: string, payload: NewItemInput): Promise<InventoryItem> {
  return request<InventoryItem>(`/items/${itemId}`, {
    method: 'PUT',
    body: payload,
  });
}

async function toggleItem(itemId: string): Promise<void> {
  return request<void>(`/items/${itemId}/toggle`, { method: 'POST' });
}

async function deleteItem(itemId: string): Promise<void> {
  return request<void>(`/items/${itemId}`, { method: 'DELETE' });
}

export function useCreateItem(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewItemInput) => createItem(characterId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}

export function useUpdateItem(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: NewItemInput }) =>
      updateItem(itemId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}

export function useToggleItem(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}

export function useDeleteItem(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: characterKeys.detail(characterId) }),
  });
}
