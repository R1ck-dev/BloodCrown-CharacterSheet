import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CharacterSheet, InventoryItem, NewItemInput } from '@/types/character';
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

async function toggleItem(itemId: string): Promise<CharacterSheet> {
  return request<CharacterSheet>(`/items/${itemId}/toggle`, { method: 'POST' });
}

async function deleteItem(itemId: string): Promise<void> {
  return request<void>(`/items/${itemId}`, { method: 'DELETE' });
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

export function useCreateItem(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewItemInput) => createItem(characterId, payload),
    onSuccess: (created) => {
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        inventory: [...sheet.inventory, created],
      }));
    },
  });
}

export function useUpdateItem(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: NewItemInput }) =>
      updateItem(itemId, payload),
    onSuccess: (updated) => {
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        inventory: sheet.inventory.map((i) => (i.id === updated.id ? updated : i)),
      }));
    },
  });
}

export function useToggleItem(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleItem,
    onSuccess: (sheet) => qc.setQueryData(characterKeys.detail(characterId), sheet),
  });
}

export function useDeleteItem(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: characterKeys.detail(characterId) });
      const snapshot = qc.getQueryData<CharacterSheet>(characterKeys.detail(characterId));
      patchSheet(qc, characterId, (sheet) => ({
        ...sheet,
        inventory: sheet.inventory.filter((i) => i.id !== itemId),
      }));
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(characterKeys.detail(characterId), ctx.snapshot);
    },
  });
}
