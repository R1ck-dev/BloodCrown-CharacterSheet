/**
 * Bloco EFEITOS ATIVOS — lista de habilidades ativas + footer "Passar Turno".
 *
 * Extraido do antigo EffectsPanel pra rodar dentro do FloatingPanel do LeftDock
 * (sem chrome/header/animacao proprios — quem hospeda fornece esses).
 */
import { Clock, Hourglass } from 'lucide-react';
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

export function ActiveEffectsBlock({ activeAbilities, onAdvanceTurn, isAdvancing = false }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
      <div
        className="bc-scroll"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          overflowY: 'auto',
          maxHeight: '50vh',
        }}
      >
        {activeAbilities.length === 0 ? (
          <p
            style={{
              fontSize: 11,
              color: 'var(--bc-ink-faint)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '12px 0',
              margin: 0,
            }}
          >
            Nenhum efeito ativo.
          </p>
        ) : (
          activeAbilities.map((ab) => {
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
          })
        )}
      </div>

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
  );
}
