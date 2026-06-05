import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ConfigurarGridInput,
  EntrarMesaInput,
  Mesa,
  MesaResumo,
  NovaMesaInput,
  NovoTokenInput,
  UploadUrlResponse,
} from '@/types/mesa';
import { request } from './client';

export const mesaKeys = {
  all: ['mesas'] as const,
  list: () => [...mesaKeys.all, 'list'] as const,
  detail: (id: string) => [...mesaKeys.all, 'detail', id] as const,
};

// ---------- Fetchers ----------

async function listMesas(): Promise<MesaResumo[]> {
  return request<MesaResumo[]>('/mesas');
}

async function getMesa(id: string): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}`);
}

async function createMesa(payload: NovaMesaInput): Promise<Mesa> {
  return request<Mesa>('/mesas', { method: 'POST', body: payload });
}

async function entrarMesa(payload: EntrarMesaInput): Promise<Mesa> {
  return request<Mesa>('/mesas/entrar', { method: 'POST', body: payload });
}

async function deleteMesa(id: string): Promise<void> {
  return request<void>(`/mesas/${id}`, { method: 'DELETE' });
}

async function uploadMapaUrl(id: string, contentType: string): Promise<UploadUrlResponse> {
  return request<UploadUrlResponse>(`/mesas/${id}/mapa/upload-url`, {
    method: 'POST',
    body: { contentType },
  });
}

async function setMapa(id: string, mapaUrl: string | null): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}/mapa`, { method: 'PUT', body: { mapaUrl } });
}

async function configurarGrid(id: string, payload: ConfigurarGridInput): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}/grid`, { method: 'PUT', body: payload });
}

async function addToken(id: string, payload: NovoTokenInput): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}/tokens`, { method: 'POST', body: payload });
}

async function moveTokenPersist(id: string, tokenId: string, x: number, y: number): Promise<void> {
  return request<void>(`/mesas/${id}/tokens/${tokenId}`, { method: 'PUT', body: { x, y } });
}

async function removeToken(id: string, tokenId: string): Promise<void> {
  return request<void>(`/mesas/${id}/tokens/${tokenId}`, { method: 'DELETE' });
}

// ---------- Hooks ----------

export function useMesas() {
  return useQuery({ queryKey: mesaKeys.list(), queryFn: listMesas });
}

export function useMesa(id: string | undefined) {
  return useQuery({
    queryKey: mesaKeys.detail(id ?? ''),
    queryFn: () => getMesa(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMesa,
    onSuccess: () => qc.invalidateQueries({ queryKey: mesaKeys.list() }),
  });
}

export function useEntrarMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: entrarMesa,
    onSuccess: (mesa) => {
      qc.setQueryData(mesaKeys.detail(mesa.id), mesa);
      qc.invalidateQueries({ queryKey: mesaKeys.list() });
    },
  });
}

export function useDeleteMesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMesa,
    onSuccess: () => qc.invalidateQueries({ queryKey: mesaKeys.list() }),
  });
}

/** Pede a URL PUT pré-assinada (R2). Não mexe em cache — é só um passo do upload. */
export function useUploadMapaUrl(id: string) {
  return useMutation({
    mutationFn: (contentType: string) => uploadMapaUrl(id, contentType),
  });
}

export function useSetMapa(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mapaUrl: string | null) => setMapa(id, mapaUrl),
    onSuccess: (mesa) => qc.setQueryData(mesaKeys.detail(id), mesa),
  });
}

export function useConfigurarGrid(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfigurarGridInput) => configurarGrid(id, payload),
    onSuccess: (mesa) => qc.setQueryData(mesaKeys.detail(id), mesa),
  });
}

export function useAddToken(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NovoTokenInput) => addToken(id, payload),
    onSuccess: (mesa) => qc.setQueryData(mesaKeys.detail(id), mesa),
  });
}

/** Persiste a posição final (drag-end). O movimento ao vivo já trafegou pelo STOMP. */
export function useMoveTokenPersist(id: string) {
  return useMutation({
    mutationFn: ({ tokenId, x, y }: { tokenId: string; x: number; y: number }) =>
      moveTokenPersist(id, tokenId, x, y),
  });
}

export function useRemoveToken(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tokenId: string) => removeToken(id, tokenId),
    onSuccess: (_data, tokenId) => {
      qc.setQueryData<Mesa>(mesaKeys.detail(id), (prev) =>
        prev ? { ...prev, tokens: prev.tokens.filter((t) => t.id !== tokenId) } : prev,
      );
    },
  });
}
