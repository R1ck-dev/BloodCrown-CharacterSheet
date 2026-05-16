/**
 * Bloco AÇÕES — pool por turno renderizado como barra de luzes compacta.
 * Cada luz acesa = 1 ação disponível; apagada = consumida.
 * Cores: verde (Padrão), âmbar (Bônus), azul (Movimento), roxo (Reação).
 *
 * Header: botão de edição (⚙) abre popover com 4 inputs pra alterar os máximos.
 *         Botão de turno (↻) chama advanceTurn (reseta pool no backend + form).
 *
 * Livres ficam fora — infinitas, não há contador.
 */
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { Sword, Sparkles, Wind, ShieldAlert, RefreshCw, Settings, X } from 'lucide-react';
import type { ActionType, CharacterSheet } from '@/types/character';
import { ACTION_COLORS, ACTION_LABELS } from '@/lib/actionTypes';
import { useAdvanceTurn } from '@/api/abilities';

interface Props {
  characterId: string;
  /** 'card' (default) = wrapper section com border/background/marginTop;
   *  'bare' = sem chrome externo (usado quando vai dentro do LeftDock). */
  chrome?: 'card' | 'bare';
}

interface RowDef {
  type: Exclude<ActionType, 'FREE'>;
  Icon: typeof Sword;
  maxField: `actionPool.${'maxStandard' | 'maxBonus' | 'maxMovement' | 'maxReaction'}`;
  curField: `actionPool.${'currentStandard' | 'currentBonus' | 'currentMovement' | 'currentReaction'}`;
}

const ROWS: RowDef[] = [
  { type: 'STANDARD', Icon: Sword,        maxField: 'actionPool.maxStandard',  curField: 'actionPool.currentStandard' },
  { type: 'BONUS',    Icon: Sparkles,     maxField: 'actionPool.maxBonus',     curField: 'actionPool.currentBonus' },
  { type: 'MOVEMENT', Icon: Wind,         maxField: 'actionPool.maxMovement',  curField: 'actionPool.currentMovement' },
  { type: 'REACTION', Icon: ShieldAlert,  maxField: 'actionPool.maxReaction',  curField: 'actionPool.currentReaction' },
];

const MAX_LIMIT = 12; // teto razoavel pra UI nao quebrar

export function ActionPoolBlock({ characterId, chrome = 'card' }: Props) {
  const { watch, setValue, getValues, register } = useFormContext<CharacterSheet>();
  const advanceTurn = useAdvanceTurn(characterId);
  const [editing, setEditing] = useState(false);
  const bare = chrome === 'bare';

  const handleAdvance = async () => {
    try {
      await advanceTurn.mutateAsync();
      // Sync do form local — sem isso, o auto-save manda os currents antigos
      // de volta pro backend, anulando o reset.
      for (const r of ROWS) {
        const max = getValues(r.maxField) ?? 0;
        setValue(r.curField, max);
      }
      toast.success('Novo turno. Ações renovadas.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao avançar turno.');
    }
  };

  return (
    <section
      style={{
        padding: bare ? '4px 0 0' : '14px 16px 12px',
        marginTop: bare ? 0 : 14,
        background: bare ? 'transparent' : 'var(--bc-gradient-surface)',
        border: bare ? 'none' : '1px solid var(--bc-edge)',
        borderRadius: bare ? 0 : 'var(--bc-radius-md)',
        position: 'relative',
      }}
    >
      {/* Header — quando bare, o dock já tem seu próprio header, não duplicamos título */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: '1px solid var(--bc-edge)',
        }}
      >
        {!bare && (
          <>
            <span style={{ color: 'var(--bc-gold)', fontSize: 12 }} aria-hidden="true">✦</span>
            <h2
              className="bc-cinzel bc-tracked"
              style={{ fontSize: 11, color: 'var(--bc-gold-bright)', fontWeight: 600, margin: 0, flex: 1 }}
            >
              AÇÕES DO TURNO
            </h2>
          </>
        )}
        {bare && <span style={{ flex: 1 }} />}
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-label="Editar máximos do pool"
          title="Editar máximos"
          style={iconBtnStyle(editing)}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bc-gold-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = editing ? 'var(--bc-gold-bright)' : 'var(--bc-ink-faint)')}
        >
          <Settings size={12} />
        </button>
        <button
          type="button"
          onClick={handleAdvance}
          disabled={advanceTurn.isPending}
          aria-label="Próximo turno"
          title="Próximo turno — reseta o pool"
          style={{
            ...iconBtnStyle(false),
            color: 'var(--bc-gold)',
            cursor: advanceTurn.isPending ? 'wait' : 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bc-gold-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bc-gold)')}
        >
          <RefreshCw size={12} />
        </button>
      </header>

      {/* Linhas de luzes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ROWS.map(({ type, Icon, maxField, curField }) => {
          const current = watch(curField) ?? 0;
          const max = watch(maxField) ?? 0;
          const color = ACTION_COLORS[type];
          return (
            <div
              key={type}
              style={{
                display: 'grid',
                gridTemplateColumns: '88px 1fr',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon size={11} color={color} />
                <span
                  className="bc-cinzel bc-tracked-soft"
                  style={{ fontSize: 9, color: 'var(--bc-ink-dim)', fontWeight: 600 }}
                >
                  {ACTION_LABELS[type].toUpperCase()}
                </span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}
                title={`${current}/${max}`}
              >
                {max === 0 ? (
                  <span style={{ fontSize: 10, color: 'var(--bc-ink-faint)', fontStyle: 'italic' }}>—</span>
                ) : (
                  Array.from({ length: Math.min(max, MAX_LIMIT) }).map((_, i) => {
                    const on = i < current;
                    return (
                      <span
                        key={i}
                        aria-hidden="true"
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: '50%',
                          background: on ? color : 'transparent',
                          border: `1px solid ${on ? color : 'rgba(255,255,255,0.15)'}`,
                          boxShadow: on ? `0 0 6px ${color}, inset 0 0 3px rgba(255,255,255,0.4)` : 'none',
                          transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
                        }}
                      />
                    );
                  })
                )}
                {max > MAX_LIMIT && (
                  <span className="bc-mono" style={{ fontSize: 10, color: 'var(--bc-ink-faint)' }}>+{max - MAX_LIMIT}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          fontSize: 9,
          color: 'var(--bc-ink-faint)',
          textAlign: 'center',
          fontStyle: 'italic',
          margin: '8px 0 0',
          letterSpacing: '0.08em',
        }}
      >
        Livres são infinitas
      </p>

      {/* Popover de edição — flutua sobre o bloco */}
      {editing && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            zIndex: 50,
            background: 'var(--bc-surface-2)',
            border: '1px solid var(--bc-edge)',
            borderRadius: 'var(--bc-radius-sm)',
            padding: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            minWidth: 220,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              paddingBottom: 6,
              borderBottom: '1px solid var(--bc-edge)',
            }}
          >
            <span
              className="bc-cinzel bc-tracked-soft"
              style={{ fontSize: 10, color: 'var(--bc-gold-bright)', fontWeight: 600 }}
            >
              MÁXIMOS DO POOL
            </span>
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label="Fechar"
              style={{ ...iconBtnStyle(false), padding: 2 }}
            >
              <X size={11} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROWS.map(({ type, maxField }) => (
              <div key={type} style={{ display: 'grid', gridTemplateColumns: '1fr 60px', alignItems: 'center', gap: 10 }}>
                <label
                  htmlFor={`pool-${type}`}
                  style={{ fontSize: 11, color: ACTION_COLORS[type], fontFamily: 'var(--bc-font-display)', letterSpacing: '0.12em' }}
                >
                  {ACTION_LABELS[type].toUpperCase()}
                </label>
                <input
                  id={`pool-${type}`}
                  type="number"
                  min={0}
                  max={MAX_LIMIT}
                  {...register(maxField, { valueAsNumber: true })}
                  className="bc-input bc-input--sm"
                  style={{ height: 28, textAlign: 'center', fontFamily: 'var(--bc-font-mono)' }}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 9, color: 'var(--bc-ink-faint)', fontStyle: 'italic', margin: '8px 0 0' }}>
            "Próximo Turno" reseta os atuais.
          </p>
        </div>
      )}
    </section>
  );
}

function iconBtnStyle(active: boolean): React.CSSProperties {
  return {
    background: 'transparent',
    border: 'none',
    color: active ? 'var(--bc-gold-bright)' : 'var(--bc-ink-faint)',
    cursor: 'pointer',
    padding: 4,
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'color var(--bc-duration-fast) var(--bc-ease-out-quart)',
  };
}
