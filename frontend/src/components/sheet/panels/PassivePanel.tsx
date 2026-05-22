/**
 * Painel de habilidades passivas — lista puramente textual.
 *
 * Passiva nao tem usos/turnos/custo/efeitos, entao o painel e enxuto: so
 * busca + paginacao incremental + render dos cards. Sem chips nem toggles.
 * Estado de busca persiste por personagem em localStorage.
 */
import { useMemo } from 'react';
import { useListFilters } from '@/hooks/useListFilters';
import { ListFilters, ShowMore } from '@/components/ui/ListFilters';
import { AbilityCardCompactPassive } from '../AbilityCardCompactPassive';
import type { Ability } from '@/types/character';

interface PassiveFilters extends Record<string, unknown> {
  query: string;
}

const DEFAULT_FILTERS: PassiveFilters = { query: '' };

const PAGE_STEP = 10;

interface Props {
  characterId: string;
  abilities: Ability[];
  onDelete: (id: string) => void;
  onEdit: (ab: Ability) => void;
  busy: boolean;
}

export function PassivePanel({ characterId, abilities, onDelete, onEdit, busy }: Props) {
  const f = useListFilters<PassiveFilters>({
    storageKey: `bc_filters_passive_${characterId}`,
    defaultFilters: DEFAULT_FILTERS,
    initialPageSize: PAGE_STEP,
    pageStep: PAGE_STEP,
  });

  const filtered = useMemo(() => {
    const q = f.filters.query.trim().toLowerCase();
    return abilities
      .filter((a) => a.category === 'PASSIVE')
      .filter((a) =>
        q
          ? (a.name || '').toLowerCase().includes(q) ||
            (a.description || '').toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [abilities, f.filters]);

  const totalPassive = useMemo(
    () => abilities.filter((a) => a.category === 'PASSIVE').length,
    [abilities],
  );

  const visible = filtered.slice(0, f.pageSize);
  const hasAny = totalPassive > 0;

  return (
    <>
      {hasAny && (
        <ListFilters
          query={f.filters.query}
          onQueryChange={(q) => f.setFilter('query', q)}
          searchPlaceholder="Buscar passiva..."
          visibleCount={visible.length}
          totalCount={totalPassive}
          activeCount={f.activeCount}
          onClear={f.resetFilters}
        />
      )}

      {!hasAny && <EmptyState text="Nenhuma habilidade passiva." />}
      {hasAny && filtered.length === 0 && <EmptyState text="Nenhuma passiva bate com a busca." />}

      {visible.map((ab) => (
        <AbilityCardCompactPassive
          key={ab.id}
          ability={ab}
          onEdit={() => onEdit(ab)}
          onDelete={() => onDelete(ab.id)}
          busy={busy}
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
