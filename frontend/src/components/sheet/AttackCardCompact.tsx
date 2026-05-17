/**
 * Card de ataque — header sempre visivel (nome + dado + botao Rolar),
 * body expandivel ao clicar mostra descricao + botoes Editar/Deletar.
 * Animacao via motion (slide-down + fade).
 */
import { type MouseEvent, useState, useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Dice5, Pencil, Trash2 } from 'lucide-react';
import { MarkdownView } from '@/components/ui/MarkdownView';
import type { Attack } from '@/types/character';

interface Props {
  attack: Attack;
  onRoll: (formula: string, source: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AttackCardCompact({ attack, onRoll, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();

  const handleRoll = (e: MouseEvent) => {
    e.stopPropagation();
    onRoll(attack.damageDice || '0', attack.name || 'Ataque');
  };

  const stopAndRun = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className="bc-card-compact bc-card-compact--blood">
      <button
        type="button"
        className="bc-card-compact__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={bodyId}
      >
        <span className="bc-card-compact__name">{attack.name || 'Sem nome'}</span>
        <span className="bc-card-compact__meta">
          <span
            className="bc-card-compact__action bc-card-compact__action--blood"
            onClick={handleRoll}
            role="button"
            tabIndex={-1}
            aria-label={`Rolar ${attack.damageDice}`}
            title="Rolar dano"
          >
            <Dice5 size={11} />
            {attack.damageDice || '—'}
          </span>
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
              {attack.description ? (
                <MarkdownView source={attack.description} />
              ) : (
                <p style={{ color: 'var(--bc-ink-faint)', fontStyle: 'italic', fontSize: 12, margin: 0 }}>
                  Sem descricao.
                </p>
              )}
              <div className="bc-card-compact__footer">
                <span className="bc-card-compact__footer-spacer" />
                <button
                  type="button"
                  className="bc-card-compact__icon-btn"
                  onClick={stopAndRun(onEdit)}
                  aria-label={`Editar ${attack.name}`}
                >
                  <Pencil size={11} /> Editar
                </button>
                <button
                  type="button"
                  className="bc-card-compact__icon-btn bc-card-compact__icon-btn--danger"
                  onClick={stopAndRun(onDelete)}
                  aria-label={`Excluir ${attack.name}`}
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
