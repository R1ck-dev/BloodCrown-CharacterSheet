/**
 * EffectsPanel — lateral flutuante direita.
 *
 * Lista habilidades atualmente ativas, com stripe colorido por categoria
 * (gold/blood/purple), duracao restante, e efeitos resumidos. Botao
 * "Passar Turno" no rodape — substitui o que estava no RightColumn,
 * mantendo a acao perto do contexto (efeitos visiveis).
 *
 * Comportamento:
 *   - Some quando nao ha habilidades ativas
 *   - Botao flutuante pequeno minimiza/expande
 *   - Animado com motion (slide-in/out)
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Zap, Clock, Hourglass, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Ability } from '@/types/character';
import { TARGET_LABELS } from '@/lib/buffTargets';

interface Props {
  activeAbilities: Ability[];
  onAdvanceTurn: () => void;
  isAdvancing?: boolean;
}

const CATEGORY_COLOR: Record<string, { stripe: string; text: string }> = {
  CLASS:          { stripe: '#9D4EDD', text: '#C8A4FF' },
  MAGIC:          { stripe: '#3B82F6', text: '#93C5FD' },
  AWAKEN:         { stripe: '#EAB308', text: '#FDE68A' },
  WEAPON:         { stripe: '#9D4EDD', text: '#C8A4FF' },
  TRANSFORMATION: { stripe: '#B91C1C', text: '#FCA5A5' },
  SPECIAL:        { stripe: '#22C55E', text: '#86EFAC' },
  INVENTORY:      { stripe: '#D4AF37', text: '#F5D76E' },
};

export function EffectsPanel({ activeAbilities, onAdvanceTurn, isAdvancing = false }: Props) {
  const [open, setOpen] = useState(true);
  const hasAny = activeAbilities.length > 0;

  return (
    <>
      {/* Botao flutuante pequeno quando minimizado */}
      <AnimatePresence>
        {hasAny && !open && (
          <motion.button
            type="button"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            onClick={() => setOpen(true)}
            aria-label="Mostrar efeitos ativos"
            style={{
              position: 'fixed',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '14px 8px 14px 14px',
              background: 'linear-gradient(180deg, rgba(26,24,32,0.95), rgba(14,10,18,0.95))',
              border: '1px solid var(--bc-edge)',
              borderRight: 'none',
              borderRadius: 'var(--bc-radius-md) 0 0 var(--bc-radius-md)',
              color: 'var(--bc-gold-bright)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--bc-shadow-md)',
              zIndex: 1000,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Zap size={14} />
            <span
              style={{
                fontSize: 10,
                background: 'var(--bc-blood-bright)',
                color: '#fff',
                padding: '1px 6px',
                borderRadius: 'var(--bc-radius-pill)',
                fontFamily: 'var(--bc-font-display)',
                fontWeight: 600,
              }}
            >
              {activeAbilities.length}
            </span>
            <ChevronLeft size={12} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasAny && open && (
          <motion.aside
            initial={{ x: 280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 280, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            aria-label="Painel de efeitos ativos"
            style={{
              position: 'fixed',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 260,
              maxHeight: '70vh',
              background: 'linear-gradient(180deg, rgba(26,24,32,0.95), rgba(14,10,18,0.96))',
              border: '1px solid var(--bc-edge)',
              borderRadius: 'var(--bc-radius-md)',
              boxShadow: 'var(--bc-shadow-lg), inset 0 1px 0 rgba(212,175,55,0.08)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <header
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--bc-edge)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(180deg, rgba(123, 44, 191, 0.18), transparent)',
              }}
            >
              <Zap size={14} color="#F5D76E" />
              <span
                className="bc-cinzel bc-tracked"
                style={{ fontSize: 10, color: 'var(--bc-gold-bright)', fontWeight: 600, flex: 1 }}
              >
                ATIVOS
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: 'var(--bc-gold-dim)',
                  background: 'rgba(212, 175, 55, 0.08)',
                  padding: '2px 6px',
                  borderRadius: 'var(--bc-radius-sm)',
                  fontFamily: 'var(--bc-font-display)',
                }}
              >
                {activeAbilities.length}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Minimizar painel"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--bc-ink-faint)',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <ChevronRight size={14} />
              </button>
            </header>

            {/* Lista */}
            <div
              className="bc-scroll"
              style={{
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {activeAbilities.map((ab) => {
                const colors = CATEGORY_COLOR[ab.category] || CATEGORY_COLOR.CLASS;
                const durationLabel =
                  ab.turnsRemaining === null
                    ? 'Cena'
                    : ab.turnsRemaining > 0
                      ? `${ab.turnsRemaining} trn`
                      : 'Fim';
                return (
                  <div
                    key={ab.id}
                    style={{
                      padding: '9px 10px',
                      background: 'rgba(10, 5, 7, 0.5)',
                      borderLeft: `2px solid ${colors.stripe}`,
                      borderRadius: 'var(--bc-radius-sm)',
                      fontSize: 11,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 3,
                      }}
                    >
                      <span
                        className="bc-cinzel"
                        style={{
                          fontWeight: 600,
                          color: 'var(--bc-ink)',
                          fontSize: 12,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ab.name}
                      </span>
                      <span
                        className="bc-mono"
                        style={{
                          fontSize: 9,
                          color: colors.text,
                          letterSpacing: '0.1em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          flex: '0 0 auto',
                        }}
                      >
                        <Clock size={9} /> {durationLabel}
                      </span>
                    </div>
                    {ab.effects && ab.effects.length > 0 && (
                      <div
                        style={{
                          fontSize: 10,
                          color: colors.text,
                          fontStyle: 'italic',
                          lineHeight: 1.4,
                        }}
                      >
                        {ab.effects
                          .map(
                            (e) =>
                              `${e.value >= 0 ? '+' : ''}${e.value} ${TARGET_LABELS[e.target] || e.target}`,
                          )
                          .join(' · ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Passar Turno */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--bc-edge)' }}>
              <button
                type="button"
                onClick={onAdvanceTurn}
                disabled={isAdvancing}
                className="bc-cinzel bc-tracked"
                style={{
                  width: '100%',
                  background: 'linear-gradient(180deg, rgba(212,175,55,0.18), rgba(123,44,191,0.18))',
                  border: '1px solid var(--bc-edge-strong)',
                  color: 'var(--bc-gold-bright)',
                  padding: '8px 12px',
                  fontSize: 10,
                  borderRadius: 'var(--bc-radius-sm)',
                  cursor: isAdvancing ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  opacity: isAdvancing ? 0.6 : 1,
                }}
              >
                <Hourglass size={11} />
                Passar Turno
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
