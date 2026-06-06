import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ConfigurarGridInput,
  EntrarMesaInput,
  Mesa,
  MesaResumo,
  NovaMesaInput,
  NovoTemplateInput,
  NovoTokenInput,
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

async function resizeToken(id: string, tokenId: string, tamanho: number): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}/tokens/${tokenId}/tamanho`, { method: 'PUT', body: { tamanho } });
}

async function addTemplate(id: string, payload: NovoTemplateInput): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}/biblioteca`, { method: 'POST', body: payload });
}

async function removeTemplate(id: string, templateId: string): Promise<void> {
  return request<void>(`/mesas/${id}/biblioteca/${templateId}`, { method: 'DELETE' });
}

async function moveTemplateToPasta(id: string, templateId: string, pastaId: string | null): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}/biblioteca/${templateId}/pasta`, { method: 'PUT', body: { pastaId } });
}

async function setTemplateBase(id: string, templateId: string, baseId: string | null): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}/biblioteca/${templateId}/base`, { method: 'PUT', body: { baseId } });
}

async function addPasta(id: string, nome: string): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}/biblioteca/pastas`, { method: 'POST', body: { nome } });
}

async function removePasta(id: string, pastaId: string): Promise<void> {
  return request<void>(`/mesas/${id}/biblioteca/pastas/${pastaId}`, { method: 'DELETE' });
}

async function switchTokenVersion(id: string, tokenId: string, templateId: string): Promise<Mesa> {
  return request<Mesa>(`/mesas/${id}/tokens/${tokenId}/versao`, { method: 'PUT', body: { templateId } });
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

export function useResizeToken(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tokenId, tamanho }: { tokenId: string; tamanho: number }) =>
      resizeToken(id, tokenId, tamanho),
    onSuccess: (mesa) => qc.setQueryData(mesaKeys.detail(id), mesa),
  });
}

export function useAddTemplate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NovoTemplateInput) => addTemplate(id, payload),
    onSuccess: (mesa) => qc.setQueryData(mesaKeys.detail(id), mesa),
  });
}

export function useRemoveTemplate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => removeTemplate(id, templateId),
    onSuccess: (_data, templateId) => {
      qc.setQueryData<Mesa>(mesaKeys.detail(id), (prev) =>
        prev ? { ...prev, biblioteca: prev.biblioteca.filter((t) => t.id !== templateId) } : prev,
      );
    },
  });
}

export function useMoveTemplateToPasta(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, pastaId }: { templateId: string; pastaId: string | null }) =>
      moveTemplateToPasta(id, templateId, pastaId),
    onSuccess: (mesa) => qc.setQueryData(mesaKeys.detail(id), mesa),
  });
}

export function useSetTemplateBase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, baseId }: { templateId: string; baseId: string | null }) =>
      setTemplateBase(id, templateId, baseId),
    onSuccess: (mesa) => qc.setQueryData(mesaKeys.detail(id), mesa),
  });
}

export function useAddPasta(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => addPasta(id, nome),
    onSuccess: (mesa) => qc.setQueryData(mesaKeys.detail(id), mesa),
  });
}

export function useRemovePasta(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pastaId: string) => removePasta(id, pastaId),
    onSuccess: (_data, pastaId) => {
      qc.setQueryData<Mesa>(mesaKeys.detail(id), (prev) =>
        prev
          ? {
              ...prev,
              pastas: prev.pastas.filter((p) => p.id !== pastaId),
              biblioteca: prev.biblioteca.map((t) => (t.pastaId === pastaId ? { ...t, pastaId: null } : t)),
            }
          : prev,
      );
    },
  });
}

export function useSwitchTokenVersion(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tokenId, templateId }: { tokenId: string; templateId: string }) =>
      switchTokenVersion(id, tokenId, templateId),
    onSuccess: (mesa) => qc.setQueryData(mesaKeys.detail(id), mesa),
  });
}
