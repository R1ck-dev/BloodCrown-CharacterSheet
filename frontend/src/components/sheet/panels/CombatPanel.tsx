/**
 * Painel de combate (ataques preparados) — busca por nome + paginacao.
 * Sem chips porque a lista costuma ser curta (2-6 ataques). Filtro persiste
 * por personagem em localStorage (chave bc_filters_combat_<id>).
 */
import { useMemo } from 'react';
import { useListFilters } from '@/hooks/useListFilters';
import { ListFilters, ShowMore } from '@/components/ui/ListFilters';
import { AttackCardCompact } from '../AttackCardCompact';
import type { Attack } from '@/types/character';

interface CombatFilters extends Record<string, unknown> {
  query: string;
}

const DEFAULT_FILTERS: CombatFilters = { query: '' };
const PAGE_STEP = 10;

interface Props {
  characterId: string;
  attacks: Attack[];
  onRoll: (formula: string, source: string) => void;
  onDelete: (id: string) => void;
  onEdit: (atk: Attack) => void;
}

export function CombatPanel({ characterId, attacks, onRoll, onDelete, onEdit }: Props) {
  const f = useListFilters<CombatFilters>({
    storageKey: `bc_filters_combat_${characterId}`,
    defaultFilters: DEFAULT_FILTERS,
    initialPageSize: PAGE_STEP,
    pageStep: PAGE_STEP,
  });

  const filtered = useMemo(() => {
    const q = f.filters.query.trim().toLowerCase();
    return attacks
      .filter((a) => (q ? (a.name || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q) : true))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [attacks, f.filters]);

  const visible = filtered.slice(0, f.pageSize);
  const hasAny = attacks.length > 0;

  return (
    <>
      {hasAny && (
        <ListFilters
          query={f.filters.query}
          onQueryChange={(q) => f.setFilter('query', q)}
          searchPlaceholder="Buscar ataque..."
          visibleCount={visible.length}
          totalCount={attacks.length}
          activeCount={f.activeCount}
          onClear={f.resetFilters}
        />
      )}

      {!hasAny && <EmptyState text="Nenhum ataque ainda." />}
      {hasAny && filtered.length === 0 && <EmptyState text="Nenhum ataque bate com a busca." />}

      {visible.map((atk) => (
        <AttackCardCompact
          key={atk.id}
          attack={atk}
          onRoll={onRoll}
          onEdit={() => onEdit(atk)}
          onDelete={() => onDelete(atk.id)}
        />
      ))}

      <ShowMore
        visible={visible.length}
        total={filtered.length}
        step={PAGE_STEP}
        onShowMore={f.showMore}
        onShowAll={() => f.showAll(filtered.length)}
      />
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p
      style={{
        fontSize: 12,
        color: 'var(--bc-ink-faint)',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '24px 12px',
      }}
    >
      {text}
    </p>
  );
}
