/**
 * Barra de filtros pra listas longas (habilidades, itens, ataques).
 * Layout: busca compacta + grupos de chips + toggles + contador + "Limpar".
 *
 * Stateless — recebe filtros e callbacks. Estado mora em useListFilters.
 *
 * Variantes de chip:
 *   - 'single' : seleciona 1 opcao por vez (re-clicar limpa)
 *   - 'multi'  : seleciona varias (toggle individual)
 */
import { type ReactNode, useId } from 'react';
import { Search, X, RotateCcw, ChevronDown } from 'lucide-react';

export interface ChipOption {
  value: string;
  label: string;
  /** Icone Lucide opcional renderizado antes do label */
  icon?: ReactNode;
}

export interface ChipGroupProps {
  /** Identificador unico do grupo — usado como key visual */
  id: string;
  /** Label uppercase pequeno acima dos chips */
  label?: string;
  options: ChipOption[];
  /** Selecao corrente — sempre array (single = max 1 elemento) */
  selected: string[];
  onChange: (next: string[]) => void;
  mode?: 'single' | 'multi';
}

export interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  /** Placeholder do input — default "Buscar..." */
  searchPlaceholder?: string;
  chipGroups?: ChipGroupProps[];
  toggles?: ToggleProps[];
  /** Numero de itens apos filtro */
  visibleCount: number;
  totalCount: number;
  /** Quantos filtros estao ativos. Quando >0 mostra botao Limpar. */
  activeCount: number;
  onClear: () => void;
  /** Quando false, esconde chips/toggles (mantem busca + contador + Limpar visiveis). */
  expanded?: boolean;
  onToggleExpanded?: (next: boolean) => void;
}

export function ListFilters({
  query,
  onQueryChange,
  searchPlaceholder = 'Buscar...',
  chipGroups = [],
  toggles = [],
  visibleCount,
  totalCount,
  activeCount,
  onClear,
  expanded = true,
  onToggleExpanded,
}: Props) {
  const panelId = useId();
  const hasCollapsible = (chipGroups.length > 0 || toggles.length > 0) && !!onToggleExpanded;
  const showPanel = !hasCollapsible || expanded;
  return (
    <div className="bc-listfilters">
      {/* Linha 1: busca + contador + limpar + chevron */}
      <div className="bc-listfilters__row">
        <div className="bc-input-wrap bc-listfilters__search">
          <span className="bc-input-icon bc-input-icon--left" aria-hidden="true">
            <Search size={14} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="bc-input bc-input--with-icon-left bc-input--sm"
            aria-label="Buscar"
          />
          {query && (
            <button
              type="button"
              className="bc-input-icon bc-input-icon--right bc-input-icon--clickable"
              onClick={() => onQueryChange('')}
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="bc-listfilters__meta">
          <span className="bc-listfilters__count" aria-live="polite">
            {visibleCount === totalCount
              ? `${totalCount} ${totalCount === 1 ? 'item' : 'itens'}`
              : `${visibleCount} de ${totalCount}`}
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              className="bc-listfilters__clear"
              onClick={onClear}
              aria-label="Limpar filtros"
            >
              <RotateCcw size={11} />
              Limpar
            </button>
          )}
          {hasCollapsible && (
            <button
              type="button"
              className={`bc-listfilters__chevron ${expanded ? 'bc-listfilters__chevron--open' : ''}`}
              onClick={() => onToggleExpanded?.(!expanded)}
              aria-expanded={expanded}
              aria-controls={panelId}
              aria-label={expanded ? 'Recolher filtros' : 'Expandir filtros'}
              title={expanded ? 'Recolher filtros' : 'Expandir filtros'}
            >
              <ChevronDown size={14} />
              {activeCount > 0 && !expanded && (
                <span className="bc-listfilters__chevron-badge" aria-hidden="true">{activeCount}</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Painel colapsavel: chips + toggles */}
      {showPanel && (chipGroups.length > 0 || toggles.length > 0) && (
        <div id={panelId} className="bc-listfilters__panel">
          {chipGroups.map((group) => (
            <ChipGroup key={group.id} {...group} />
          ))}
          {toggles.length > 0 && (
            <div className="bc-listfilters__toggles">
              {toggles.map((t) => (
                <FilterToggle key={t.id} {...t} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChipGroup({ id, label, options, selected, onChange, mode = 'multi' }: ChipGroupProps) {
  const toggle = (value: string) => {
    if (mode === 'single') {
      onChange(selected.includes(value) ? [] : [value]);
    } else {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value],
      );
    }
  };

  return (
    <div className="bc-listfilters__group" role="group" aria-labelledby={label ? `${id}-label` : undefined}>
      {label && (
        <span id={`${id}-label`} className="bc-listfilters__group-label">
          {label}
        </span>
      )}
      <div className="bc-chip-row">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              className={`bc-chip ${active ? 'bc-chip--active' : ''}`}
              onClick={() => toggle(opt.value)}
              aria-pressed={active}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterToggle({ id, label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      className={`bc-chip bc-chip--toggle ${checked ? 'bc-chip--active' : ''}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span
        className="bc-chip__dot"
        data-on={checked || undefined}
        aria-hidden="true"
      />
      <span>{label}</span>
    </button>
  );
}

// ============================================================================
// ShowMore — botoes "Mostrar mais (+N)" / "Mostrar todos" pra paginacao
// incremental. Renderiza nada quando ja esta mostrando tudo.
// ============================================================================

interface ShowMoreProps {
  visible: number;
  total: number;
  step: number;
  onShowMore: () => void;
  onShowAll: () => void;
}

export function ShowMore({ visible, total, step, onShowMore, onShowAll }: ShowMoreProps) {
  if (visible >= total) return null;
  const remaining = total - visible;
  const nextChunk = Math.min(step, remaining);
  return (
    <div className="bc-listfilters__showmore">
      <button type="button" className="bc-chip bc-chip--ghost" onClick={onShowMore}>
        Mostrar mais (+{nextChunk})
      </button>
      {remaining > step && (
        <button type="button" className="bc-chip bc-chip--ghost" onClick={onShowAll}>
          Mostrar todos ({total})
        </button>
      )}
    </div>
  );
}
