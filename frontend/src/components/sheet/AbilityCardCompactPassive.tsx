/**
 * Card de habilidade passiva — puramente textual: nome + descricao.
 * Passiva nao tem usos, turnos, custo de acao nem efeitos automatizados;
 * serve de documentacao do que ela concede ao personagem.
 *
 * Header (nome + chevron) sempre visivel; click expande o body com a
 * descricao em Markdown e os botoes Editar/Deletar. Reaproveita as classes
 * .bc-card-compact* (sem CSS proprio).
 */
import { type MouseEvent, useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { MarkdownView } from '@/components/ui/MarkdownView';
import type { Ability } from '@/types/character';

interface Props {
  ability: Ability;
  onEdit: () => void;
  onDelete: () => void;
  busy?: boolean;
}

export function AbilityCardCompactPassive({ ability, onEdit, onDelete, busy = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();

  const stopAndRun = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className="bc-card-compact bc-card-compact--gold">
      <button
        type="button"
        className="bc-card-compact__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={bodyId}
      >
        <span className="bc-card-compact__name">{ability.name || 'Sem nome'}</span>
        <span className="bc-card-compact__meta">
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
              {/* Descricao */}
              {ability.description ? (
                <MarkdownView source={ability.description} />
              ) : (
                <p style={{ color: 'var(--bc-ink-faint)', fontStyle: 'italic', fontSize: 12, margin: 0 }}>
                  Sem descricao.
                </p>
              )}

              {/* Footer: Editar + Deletar */}
              <div className="bc-card-compact__footer">
                <span className="bc-card-compact__footer-spacer" />
                <button
                  type="button"
                  className="bc-card-compact__icon-btn"
                  onClick={stopAndRun(onEdit)}
                  aria-label={`Editar ${ability.name}`}
                >
                  <Pencil size={11} /> Editar
                </button>
                <button
                  type="button"
                  className="bc-card-compact__icon-btn bc-card-compact__icon-btn--danger"
                  onClick={stopAndRun(onDelete)}
                  disabled={busy}
                  aria-label={`Excluir ${ability.name}`}
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
