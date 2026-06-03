/**
 * Painel de habilidades pra uma categoria especifica (CLASS, MAGIC, etc.).
 *
 * Encapsula: filtros (chips de actionType/resourceType + toggles) + busca +
 * paginacao incremental + render dos AbilityCards. Estado de filtro persiste
 * por personagem+categoria em localStorage (chave bc_filters_ability_<id>_<cat>).
 */
import { useMemo } from 'react';
import { useListFilters } from '@/hooks/useListFilters';
import { ListFilters, ShowMore } from '@/components/ui/ListFilters';
import { AbilityCardCompact } from '../AbilityCardCompact';
import type { Ability, AbilityCategory, ActionType, AbilityResource, CustomSkill } from '@/types/character';

const ACTION_TYPE_OPTIONS = [
  { value: 'STANDARD',   label: 'Padrao' },
  { value: 'BONUS',      label: 'Bonus' },
  { value: 'MOVEMENT',   label: 'Movimento' },
  { value: 'REACTION',   label: 'Reacao' },
  { value: 'FREE',       label: 'Livre' },
  { value: 'FULL',       label: 'Completa' },
];

const RESOURCE_OPTIONS = [
  { value: 'MANA',    label: 'Mana' },
  { value: 'STAMINA', label: 'Estamina' },
  { value: 'HYBRID',  label: 'Hibrida' },
];

interface AbilityFilters extends Record<string, unknown> {
  query: string;
  actionTypes: string[];
  resourceTypes: string[];
  onlyActive: boolean;
  hasUses: boolean;
}

const DEFAULT_FILTERS: AbilityFilters = {
  query: '',
  actionTypes: [],
  resourceTypes: [],
  onlyActive: false,
  hasUses: false,
};

const PAGE_STEP = 10;

interface Props {
  characterId: string;
  category: AbilityCategory;
  abilities: Ability[];
  onToggle: (id: string, spendAs?: ActionType) => void;
  onRecover: (id: string, res: AbilityResource) => void;
  onDelete: (id: string) => void;
  onEdit: (ab: Ability) => void;
  onRoll: (formula: string, source: string) => void;
  customSkills: CustomSkill[];
  busy: boolean;
}

export function AbilityPanel({
  characterId,
  category,
  abilities,
  onToggle,
  onRecover,
  onDelete,
  onEdit,
  onRoll,
  customSkills,
  busy,
}: Props) {
  const f = useListFilters<AbilityFilters>({
    storageKey: `bc_filters_ability_${characterId}_${category}`,
    defaultFilters: DEFAULT_FILTERS,
    initialPageSize: PAGE_STEP,
    pageStep: PAGE_STEP,
  });

  const filtered = useMemo(() => {
    const q = f.filters.query.trim().toLowerCase();
    return abilities
      .filter((a) => a.category === category)
      .filter((a) => (q ? (a.name || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q) : true))
      .filter((a) => (f.filters.actionTypes.length ? f.filters.actionTypes.includes(a.actionType) : true))
      .filter((a) => (f.filters.resourceTypes.length ? f.filters.resourceTypes.includes(a.resourceType) : true))
      .filter((a) => (f.filters.onlyActive ? a.isActive : true))
      .filter((a) => (f.filters.hasUses ? (a.maxUses === 0 || a.currentUses > 0) : true))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [abilities, category, f.filters]);

  const totalInCategory = useMemo(
    () => abilities.filter((a) => a.category === category).length,
    [abilities, category],
  );

  const visible = filtered.slice(0, f.pageSize);
  const hasAnyInCategory = totalInCategory > 0;

  return (
    <>
      {hasAnyInCategory && (
        <ListFilters
          query={f.filters.query}
          onQueryChange={(q) => f.setFilter('query', q)}
          searchPlaceholder="Buscar habilidade..."
          visibleCount={visible.length}
          totalCount={totalInCategory}
          activeCount={f.activeCount}
          onClear={f.resetFilters}
          expanded={f.expanded}
          onToggleExpanded={f.setExpanded}
          chipGroups={[
            {
              id: 'action',
              label: 'Acao',
              mode: 'multi',
              options: ACTION_TYPE_OPTIONS,
              selected: f.filters.actionTypes,
              onChange: (next) => f.setFilter('actionTypes', next),
            },
            {
              id: 'resource',
              label: 'Recurso',
              mode: 'multi',
              options: RESOURCE_OPTIONS,
              selected: f.filters.resourceTypes,
              onChange: (next) => f.setFilter('resourceTypes', next),
            },
          ]}
          toggles={[
            {
              id: 'active',
              label: 'So ativas',
              checked: f.filters.onlyActive,
              onChange: (v) => f.setFilter('onlyActive', v),
            },
            {
              id: 'hasUses',
              label: 'Com usos',
              checked: f.filters.hasUses,
              onChange: (v) => f.setFilter('hasUses', v),
            },
          ]}
        />
      )}

      {!hasAnyInCategory && <EmptyState text="Nenhuma habilidade nesta categoria." />}
      {hasAnyInCategory && filtered.length === 0 && <EmptyState text="Nenhuma habilidade bate com os filtros." />}

      {visible.map((ab) => (
        <AbilityCardCompact
          key={ab.id}
          ability={ab}
          onToggle={(spendAs) => onToggle(ab.id, spendAs)}
          onRecover={(res) => onRecover(ab.id, res)}
          onRoll={onRoll}
          onEdit={() => onEdit(ab)}
          onDelete={() => onDelete(ab.id)}
          customSkills={customSkills}
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
