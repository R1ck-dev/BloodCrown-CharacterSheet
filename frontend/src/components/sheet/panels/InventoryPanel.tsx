/**
 * Painel de inventario — filtros agrupam targets em categorias amplas pra evitar
 * 30+ chips: Atributo, Defesa, Pericia, Economia, Sem efeito. Filtro persiste
 * por personagem em localStorage (chave bc_filters_inventory_<id>).
 */
import { useMemo } from 'react';
import { useListFilters } from '@/hooks/useListFilters';
import { ListFilters, ShowMore } from '@/components/ui/ListFilters';
import { ItemCardCompact } from '../ItemCardCompact';
import type { InventoryItem } from '@/types/character';

const TARGET_CATEGORY_OPTIONS = [
  { value: 'ATTR',    label: 'Atributo' },
  { value: 'DEFENSE', label: 'Defesa' },
  { value: 'SKILL',   label: 'Pericia' },
  { value: 'ECON',    label: 'Economia' },
  { value: 'NONE',    label: 'Sem efeito' },
];

function classifyTarget(target: string): string {
  if (!target || target === 'none') return 'NONE';
  if (target.startsWith('attr')) return 'ATTR';
  if (target.startsWith('skill')) return 'SKILL';
  if (target.startsWith('REDUCE')) return 'ECON';
  if (target.startsWith('def') || target.startsWith('res')) return 'DEFENSE';
  return 'NONE';
}

interface InventoryFilters extends Record<string, unknown> {
  query: string;
  targetCategories: string[];
  onlyEquipped: boolean;
}

const DEFAULT_FILTERS: InventoryFilters = {
  query: '',
  targetCategories: [],
  onlyEquipped: false,
};

const PAGE_STEP = 10;

interface Props {
  characterId: string;
  inventory: InventoryItem[];
  onToggleEquip: (id: string) => void;
  onUse: (id: string) => void;
  onAdjustQty: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
  onEdit: (item: InventoryItem) => void;
  busy: boolean;
}

export function InventoryPanel({ characterId, inventory, onToggleEquip, onUse, onAdjustQty, onDelete, onEdit, busy }: Props) {
  const f = useListFilters<InventoryFilters>({
    storageKey: `bc_filters_inventory_${characterId}`,
    defaultFilters: DEFAULT_FILTERS,
    initialPageSize: PAGE_STEP,
    pageStep: PAGE_STEP,
  });

  const filtered = useMemo(() => {
    const q = f.filters.query.trim().toLowerCase();
    return inventory
      .filter((it) => (q ? (it.name || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q) : true))
      .filter((it) =>
        f.filters.targetCategories.length
          ? f.filters.targetCategories.includes(classifyTarget(it.targetAttribute))
          : true,
      )
      .filter((it) => (f.filters.onlyEquipped ? it.isEquipped : true))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [inventory, f.filters]);

  const visible = filtered.slice(0, f.pageSize);
  const hasAny = inventory.length > 0;

  return (
    <>
      {hasAny && (
        <ListFilters
          query={f.filters.query}
          onQueryChange={(q) => f.setFilter('query', q)}
          searchPlaceholder="Buscar item..."
          visibleCount={visible.length}
          totalCount={inventory.length}
          activeCount={f.activeCount}
          onClear={f.resetFilters}
          expanded={f.expanded}
          onToggleExpanded={f.setExpanded}
          chipGroups={[
            {
              id: 'targets',
              label: 'Efeito',
              mode: 'multi',
              options: TARGET_CATEGORY_OPTIONS,
              selected: f.filters.targetCategories,
              onChange: (next) => f.setFilter('targetCategories', next),
            },
          ]}
          toggles={[
            {
              id: 'equipped',
              label: 'So equipados',
              checked: f.filters.onlyEquipped,
              onChange: (v) => f.setFilter('onlyEquipped', v),
            },
          ]}
        />
      )}

      {!hasAny && <EmptyState text="Mochila vazia." />}
      {hasAny && filtered.length === 0 && <EmptyState text="Nenhum item bate com os filtros." />}

      {visible.map((it) => (
        <ItemCardCompact
          key={it.id}
          item={it}
          onToggleEquip={() => onToggleEquip(it.id)}
          onUse={() => onUse(it.id)}
          onAdjustQty={(delta) => onAdjustQty(it.id, delta)}
          onEdit={() => onEdit(it)}
          onDelete={() => onDelete(it.id)}
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
