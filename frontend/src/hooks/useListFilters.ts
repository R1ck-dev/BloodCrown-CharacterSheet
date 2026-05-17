/**
 * Estado de filtros + paginacao incremental pra listas longas (habilidades,
 * itens, ataques). O hook nao conhece os dados — gerencia o state, persiste
 * em localStorage por chave e expoe controles. O parent aplica os filtros
 * com useMemo e fatia pela pageSize devolvida.
 *
 * Uso:
 *   const f = useListFilters({
 *     storageKey: `bc_filters_abilities_${charId}_${cat}`,
 *     defaultFilters: { query: '', actionTypes: [] as string[], onlyActive: false },
 *   });
 *   const filtered = useMemo(() => abilities.filter(a => ...), [abilities, f.filters]);
 *   const visible = filtered.slice(0, f.pageSize);
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Options<TFilters extends Record<string, unknown>> {
  /** Chave de localStorage. Quando muda (ex: trocar categoria), recarrega persistencia. */
  storageKey: string;
  /** Valores iniciais — tambem usados pra detectar "filtros ativos" e pra resetar. */
  defaultFilters: TFilters;
  /** Quantos itens mostrar antes do "Mostrar mais". Default 10. */
  initialPageSize?: number;
  /** Incremento do "Mostrar mais". Default 10. */
  pageStep?: number;
}

interface Result<TFilters> {
  filters: TFilters;
  setFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
  resetFilters: () => void;
  /** Numero de filtros que diferem do default. Usado pra mostrar "Limpar". */
  activeCount: number;
  pageSize: number;
  showMore: () => void;
  showAll: (total: number) => void;
  resetPageSize: () => void;
  /** Painel de filtros colapsado/expandido. Persistido em chave separada. */
  expanded: boolean;
  setExpanded: (next: boolean) => void;
}

export function useListFilters<TFilters extends Record<string, unknown>>({
  storageKey,
  defaultFilters,
  initialPageSize = 10,
  pageStep = 10,
}: Options<TFilters>): Result<TFilters> {
  // Mantem referencia estavel do default — parent pode passar literal a cada render
  const defaultRef = useRef(defaultFilters);
  const defaultJson = useMemo(() => JSON.stringify(defaultFilters), [defaultFilters]);

  const readPersisted = useCallback((): TFilters => {
    if (typeof window === 'undefined') return defaultRef.current;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return defaultRef.current;
      const parsed = JSON.parse(raw) as Partial<TFilters>;
      // Merge defensivo: campos novos no default vencem
      return { ...defaultRef.current, ...parsed };
    } catch {
      return defaultRef.current;
    }
  }, [storageKey]);

  const [filters, setFilters] = useState<TFilters>(readPersisted);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Expanded: persiste em chave separada pra nao poluir o JSON dos filtros.
  // Default = colapsado quando nao ha filtros aplicados; expandido quando ha.
  const expandedStorageKey = `${storageKey}_expanded`;
  const readExpanded = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(expandedStorageKey);
      if (raw === '1') return true;
      if (raw === '0') return false;
      // Sem preferencia salva: expande se ha filtros aplicados, senao colapsa
      const persistedFilters = localStorage.getItem(storageKey);
      return !!persistedFilters;
    } catch {
      return false;
    }
  }, [expandedStorageKey, storageKey]);
  const [expanded, setExpandedState] = useState<boolean>(readExpanded);

  // Quando storageKey muda (ex: troca de categoria), recarrega state
  useEffect(() => {
    setFilters(readPersisted());
    setPageSize(initialPageSize);
    setExpandedState(readExpanded());
  }, [storageKey, readPersisted, initialPageSize, readExpanded]);

  // Persiste alteracoes (skip quando igual ao default — evita lixo)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (JSON.stringify(filters) === defaultJson) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(filters));
      }
    } catch {
      // localStorage cheio ou desabilitado — ignora
    }
  }, [filters, storageKey, defaultJson]);

  const setFilter = useCallback(<K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPageSize(initialPageSize); // volta pro topo quando filtro muda
  }, [initialPageSize]);

  const resetFilters = useCallback(() => {
    setFilters(defaultRef.current);
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  const activeCount = useMemo(() => {
    let count = 0;
    const def = defaultRef.current;
    for (const key of Object.keys(def) as Array<keyof TFilters>) {
      const cur = filters[key];
      const dft = def[key];
      if (Array.isArray(cur) && Array.isArray(dft)) {
        if (cur.length !== dft.length || cur.some((v, i) => v !== dft[i])) count++;
      } else if (cur !== dft) {
        // string vazia vs default '' conta como ativo so se diferente
        count++;
      }
    }
    return count;
  }, [filters]);

  const showMore = useCallback(() => {
    setPageSize((s) => s + pageStep);
  }, [pageStep]);

  const showAll = useCallback((total: number) => {
    setPageSize(total);
  }, []);

  const resetPageSize = useCallback(() => {
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  const setExpanded = useCallback((next: boolean) => {
    setExpandedState(next);
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(expandedStorageKey, next ? '1' : '0');
    } catch {
      // localStorage cheio ou desabilitado — ignora
    }
  }, [expandedStorageKey]);

  return {
    filters,
    setFilter,
    resetFilters,
    activeCount,
    pageSize,
    showMore,
    showAll,
    resetPageSize,
    expanded,
    setExpanded,
  };
}
