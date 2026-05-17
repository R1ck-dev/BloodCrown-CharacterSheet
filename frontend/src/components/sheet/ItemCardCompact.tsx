/**
 * Card de item — header (nome + chip qty + chip efeito + Equipar/Usar + chevron)
 * sempre visivel. Body expandivel mostra descricao + botoes +/- qty + Editar/Deletar.
 *
 * Tipos de item:
 *   - Equipavel (defesa/economia): botao Equipar/Guardado no header
 *   - Pocao (RESTORE_*): botao Usar (rola useDice, aplica a barra, decrementa qty)
 *   - Comum: so chevron pra ver descricao
 *
 * Qty=0 marca o card como "Esgotado" e desabilita Equipar/Usar.
 */
import { type MouseEvent, useState, useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, FlaskRound, Minus, Package, PackageCheck, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { MarkdownView } from '@/components/ui/MarkdownView';
import { TARGET_LABELS } from '@/lib/buffTargets';
import type { InventoryItem } from '@/types/character';

interface Props {
  item: InventoryItem;
  onToggleEquip: () => void;
  onUse: () => void;
  onAdjustQty: (delta: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  busy?: boolean;
}

export function ItemCardCompact({ item, onToggleEquip, onUse, onAdjustQty, onEdit, onDelete, busy = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();

  const hasEffect = item.targetAttribute && item.targetAttribute !== 'none';
  const isPotion = item.targetAttribute?.startsWith('RESTORE') ?? false;
  const isEconomy = item.targetAttribute?.startsWith('REDUCE') ?? false;
  const targetLabel = hasEffect ? TARGET_LABELS[item.targetAttribute] || item.targetAttribute : null;
  const qty = item.quantity ?? 1;
  const exhausted = qty <= 0;

  // Composicao do chip de efeito conforme o tipo de target
  const effectChip = !hasEffect
    ? null
    : isPotion
      ? `${targetLabel}${item.useDice ? ` ${item.useDice}` : ''}`
      : isEconomy
        ? `-${item.effectValue || 0} ${targetLabel}`
        : `${item.effectValue >= 0 ? '+' : ''}${item.effectValue} ${targetLabel}`;

  const stopAndRun = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  const stripeClass = item.isEquipped
    ? 'bc-card-compact--gold'
    : isPotion
      ? 'bc-card-compact--purple'
      : 'bc-card-compact--muted';
  const stateClass = exhausted
    ? 'bc-card-compact--exhausted'
    : item.isEquipped
      ? 'bc-card-compact--active'
      : '';

  return (
    <div className={`bc-card-compact ${stripeClass} ${stateClass}`}>
      <button
        type="button"
        className="bc-card-compact__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={bodyId}
      >
        <span className="bc-card-compact__name">
          {item.name || 'Sem nome'}
          {exhausted && (
            <span style={{ marginLeft: 8, fontSize: 10, color: '#FCA5A5', fontStyle: 'italic' }}>
              (Esgotado)
            </span>
          )}
        </span>
        <span className="bc-card-compact__meta">
          {qty !== 1 && (
            <span
              className={`bc-card-compact__chip ${exhausted ? 'bc-card-compact__chip--warn' : ''}`}
              title={`${qty} unidade${qty === 1 ? '' : 's'}`}
            >
              x{qty}
            </span>
          )}
          {effectChip && (
            <span
              className={`bc-card-compact__chip ${isPotion ? '' : 'bc-card-compact__chip--gold'}`}
              title={String(targetLabel)}
              style={isPotion ? { color: '#C8A4FF', borderColor: 'rgba(157,78,221,0.4)' } : undefined}
            >
              {effectChip}
            </span>
          )}
          {isPotion ? (
            <span
              role="button"
              tabIndex={-1}
              onClick={stopAndRun(onUse)}
              aria-disabled={busy || exhausted || !item.useDice}
              aria-label="Usar pocao"
              className="bc-card-compact__action"
              style={
                busy || exhausted || !item.useDice
                  ? { opacity: 0.4, cursor: 'not-allowed' }
                  : { color: '#C8A4FF', borderColor: 'rgba(157,78,221,0.5)' }
              }
              title={
                !item.useDice
                  ? 'Defina uma formula (ex: 2d6+1) no item pra poder usar'
                  : exhausted
                    ? 'Esgotado'
                    : `Usar (rola ${item.useDice})`
              }
            >
              <FlaskRound size={11} />
              Usar
            </span>
          ) : (
            <span
              role="button"
              tabIndex={-1}
              onClick={stopAndRun(onToggleEquip)}
              aria-disabled={busy || exhausted}
              aria-label={item.isEquipped ? 'Desequipar' : 'Equipar'}
              className={`bc-card-compact__action ${item.isEquipped ? 'bc-card-compact__action--active' : ''}`}
              style={busy || exhausted ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
              title={
                exhausted
                  ? 'Esgotado'
                  : item.isEquipped
                    ? 'Clique pra desequipar'
                    : 'Clique pra equipar'
              }
            >
              {item.isEquipped ? <PackageCheck size={11} /> : <Package size={11} />}
              {item.isEquipped ? 'Equipado' : 'Guardado'}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`bc-card-compact__chevron ${expanded ? 'bc-card-compact__chevron--open' : ''}`}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            id={bodyId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="bc-card-compact__body">
              {hasEffect && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: isPotion ? 'rgba(123, 44, 191, 0.1)' : 'rgba(212, 175, 55, 0.08)',
                    border: `1px solid ${isPotion ? 'rgba(157, 78, 221, 0.3)' : 'rgba(212, 175, 55, 0.2)'}`,
                    padding: '4px 8px',
                    borderRadius: 'var(--bc-radius-sm)',
                    color: isPotion ? '#C8A4FF' : 'var(--bc-gold-bright)',
                    fontSize: 11,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Sparkles size={11} />
                  {effectChip}
                </div>
              )}
              {item.description ? (
                <MarkdownView source={item.description} />
              ) : (
                <p style={{ color: 'var(--bc-ink-faint)', fontStyle: 'italic', fontSize: 12, margin: 0 }}>
                  Sem descricao.
                </p>
              )}

              {/* Qty controls + edit + delete */}
              <div className="bc-card-compact__footer">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <button
                    type="button"
                    className="bc-card-compact__icon-btn"
                    onClick={stopAndRun(() => onAdjustQty(-1))}
                    disabled={busy || qty <= 0}
                    aria-label="Diminuir quantidade"
                    title="Diminuir"
                    style={{ padding: '4px 6px' }}
                  >
                    <Minus size={11} />
                  </button>
                  <span
                    className="bc-mono"
                    style={{
                      minWidth: 28,
                      textAlign: 'center',
                      fontSize: 12,
                      color: exhausted ? '#FCA5A5' : 'var(--bc-ink)',
                      fontWeight: 600,
                    }}
                    aria-label={`Quantidade: ${qty}`}
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    className="bc-card-compact__icon-btn"
                    onClick={stopAndRun(() => onAdjustQty(+1))}
                    disabled={busy}
                    aria-label="Aumentar quantidade"
                    title="Aumentar"
                    style={{ padding: '4px 6px' }}
                  >
                    <Plus size={11} />
                  </button>
                </div>
                <span className="bc-card-compact__footer-spacer" />
                <button
                  type="button"
                  className="bc-card-compact__icon-btn"
                  onClick={stopAndRun(onEdit)}
                  aria-label={`Editar ${item.name}`}
                >
                  <Pencil size={11} /> Editar
                </button>
                <button
                  type="button"
                  className="bc-card-compact__icon-btn bc-card-compact__icon-btn--danger"
                  onClick={stopAndRun(onDelete)}
                  aria-label={`Excluir ${item.name}`}
                >
                  <Trash2 size={11} /> Deletar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
