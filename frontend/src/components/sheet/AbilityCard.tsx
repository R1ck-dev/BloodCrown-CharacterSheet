/**
 * Card de uma habilidade — toggle ativar/desativar (com hierarquia D&D-like de ações),
 * recuperar uso (consumindo recurso), exibir formula de rolagem (clicavel se houver),
 * delete. Indica usos restantes e turnos remanescentes.
 *
 * Hierarquia: ao tentar ativar, se o pool do actionType tá zerado mas há substitutos
 * (ex: Padrão → Bônus), abre dropdown perguntando qual gastar.
 */
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Dice5, Trash2, Power, Sparkles, Clock, Pencil } from 'lucide-react';
import type { Ability, AbilityResource, ActionType, CharacterSheet } from '@/types/character';
import { TARGET_LABELS } from '@/lib/buffTargets';
import { ACTION_COLORS, ACTION_LABELS, availableSubstitutes, poolRemaining } from '@/lib/actionTypes';
import { MarkdownView } from '@/components/ui/MarkdownView';

interface Props {
  ability: Ability;
  onToggle: (spendAs?: ActionType) => void;
  onRecover: (resource: AbilityResource) => void;
  onDelete: () => void;
  onEdit: () => void;
  onRoll: (formula: string, source: string) => void;
  busy?: boolean;
}

const RESOURCE_LABEL: Record<AbilityResource, string> = {
  MANA: 'Mana',
  STAMINA: 'Estamina',
  HYBRID: 'Mana ou Estamina',
};

const RESOURCE_SHORT: Record<AbilityResource, string> = {
  MANA: 'MP',
  STAMINA: 'SP',
  HYBRID: '',
};

export function AbilityCard({ ability, onToggle, onRecover, onDelete, onEdit, onRoll, busy = false }: Props) {
  const [showRecover, setShowRecover] = useState(false);
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const { watch } = useFormContext<CharacterSheet>();
  const pool = watch('actionPool');

  const isExhausted = ability.maxUses > 0 && ability.currentUses <= 0;
  const isOnCooldown = ability.turnsRemaining !== null && ability.turnsRemaining > 0;
  const required = ability.actionType;
  const hasDirectPool = required === 'FREE' || poolRemaining(pool, required) > 0;
  const subs = availableSubstitutes(pool, required);
  const noActionsAvailable = !hasDirectPool && subs.length === 0;

  const handleToggleClick = () => {
    // Desativar é sempre livre (não consome pool).
    if (ability.isActive) {
      onToggle();
      return;
    }
    if (hasDirectPool) {
      onToggle();
      return;
    }
    if (subs.length > 0) {
      setShowSubstitutes(true);
      return;
    }
    // Sem opções: chama mesmo assim pro backend retornar a mensagem de erro consistente.
    onToggle();
  };

  const stripe = ability.isActive ? 'var(--bc-gold)' : 'var(--bc-purple)';
  const stripeBg = ability.isActive ? 'rgba(212, 175, 55, 0.05)' : 'rgba(123, 44, 191, 0.04)';

  return (
    <article
      style={{
        background: stripeBg,
        border: '1px solid var(--bc-edge)',
        borderLeft: `3px solid ${stripe}`,
        borderRadius: 'var(--bc-radius-sm)',
        padding: '12px 14px',
        marginBottom: 10,
        position: 'relative',
        transition: 'all var(--bc-duration-base) var(--bc-ease-out-quart)',
      }}
    >
      {/* Cluster top-right: editar + deletar */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${ability.name}`}
          title="Editar habilidade"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--bc-ink-faint)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            transition: 'color var(--bc-duration-fast) var(--bc-ease-out-quart)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bc-gold-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bc-ink-faint)')}
        >
          <Pencil size={12} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Excluir ${ability.name}`}
          title="Excluir habilidade"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--bc-ink-faint)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            transition: 'color var(--bc-duration-fast) var(--bc-ease-out-quart)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FCA5A5')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bc-ink-faint)')}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Header — paddingRight reserva espaco pro cluster edit+trash do canto */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8, paddingRight: 56 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="bc-cinzel"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--bc-ink)',
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ability.name || 'Sem nome'}
          </div>
          <div
            className="bc-cinzel"
            style={{
              fontSize: 10,
              color: ACTION_COLORS[required],
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
            title={
              required === 'FULL'
                ? 'Consome todas as ações (exceto reações). Requer pool intacto.'
                : required === 'FREE'
                  ? 'Ação Livre — não consome pool'
                  : `Custa 1 Ação ${ACTION_LABELS[required]}`
            }
          >
            {ACTION_LABELS[required]}
          </div>
        </div>

        {/* Toggle ativo */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={busy || (isExhausted && !ability.isActive) || (noActionsAvailable && !ability.isActive)}
            aria-label={ability.isActive ? 'Desativar habilidade' : 'Ativar habilidade'}
            title={
              isExhausted && !ability.isActive
                ? 'Sem usos restantes — recupere primeiro'
                : noActionsAvailable && !ability.isActive
                  ? required === 'FULL'
                    ? 'Ação Completa exige pool intacto (nenhuma outra ação gasta no turno)'
                    : `Sem Ação ${ACTION_LABELS[required]} nem substitutos disponíveis`
                  : ability.isActive
                    ? 'Clique para desativar'
                    : required === 'FULL'
                      ? 'Ativar (consome Padrão + Bônus + Movimento)'
                      : `Ativar (custa 1 ${ACTION_LABELS[required]})`
            }
            style={{
              background: ability.isActive ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              border: `1px solid ${ability.isActive ? 'var(--bc-edge-strong)' : 'var(--bc-edge)'}`,
              color: ability.isActive ? 'var(--bc-gold-bright)' : 'var(--bc-ink-dim)',
              cursor: busy ? 'wait' : 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--bc-radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontFamily: 'var(--bc-font-display)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: (isExhausted || noActionsAvailable) && !ability.isActive ? 0.4 : 1,
            }}
          >
            <Power size={10} />
            {ability.isActive ? 'Ativa' : 'Off'}
          </button>
          {showSubstitutes && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                background: 'var(--bc-surface-2)',
                border: '1px solid var(--bc-edge)',
                borderRadius: 'var(--bc-radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 20,
                minWidth: 180,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              <div
                className="bc-cinzel bc-tracked-soft"
                style={{
                  fontSize: 9,
                  color: 'var(--bc-ink-faint)',
                  padding: '8px 10px 4px',
                  borderBottom: '1px solid var(--bc-edge)',
                }}
              >
                SEM {ACTION_LABELS[required].toUpperCase()} — GASTAR:
              </div>
              {subs.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setShowSubstitutes(false);
                    onToggle(sub);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: ACTION_COLORS[sub],
                    cursor: 'pointer',
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontFamily: 'var(--bc-font-body)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{ACTION_LABELS[sub]}</span>
                  <span className="bc-mono" style={{ fontSize: 10, opacity: 0.7 }}>
                    ({poolRemaining(pool, sub)} restantes)
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowSubstitutes(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderTop: '1px solid var(--bc-edge)',
                  color: 'var(--bc-ink-faint)',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  textAlign: 'center',
                  fontSize: 10,
                  fontStyle: 'italic',
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Descricao (markdown) */}
      {ability.description && (
        <div style={{ marginBottom: 10 }}>
          <MarkdownView source={ability.description} />
        </div>
      )}

      {/* Linha de meta: usos + duracao + dice + effects */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 11 }}>
        {ability.maxUses > 0 && (
          <span
            className="bc-mono"
            style={{
              color: isExhausted ? '#FCA5A5' : 'var(--bc-ink)',
              padding: '2px 6px',
              border: `1px solid ${isExhausted ? 'rgba(220,38,38,0.4)' : 'var(--bc-edge)'}`,
              borderRadius: 'var(--bc-radius-sm)',
              fontSize: 10,
            }}
            title={`Recurso: ${RESOURCE_LABEL[ability.resourceType]}`}
          >
            {ability.currentUses}/{ability.maxUses} usos
          </span>
        )}

        {isOnCooldown && (
          <span
            className="bc-mono"
            style={{
              color: '#FDE68A',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              borderRadius: 'var(--bc-radius-sm)',
              fontSize: 10,
            }}
          >
            <Clock size={10} /> {ability.turnsRemaining} trn
          </span>
        )}

        {ability.diceRoll && (
          <button
            type="button"
            onClick={() => onRoll(ability.diceRoll, ability.name || 'Habilidade')}
            style={{
              background: 'rgba(123, 44, 191, 0.18)',
              border: '1px solid rgba(157, 78, 221, 0.4)',
              color: '#C8A4FF',
              cursor: 'pointer',
              fontFamily: 'var(--bc-font-display)',
              fontWeight: 600,
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 'var(--bc-radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Dice5 size={11} />
            {ability.diceRoll}
          </button>
        )}

        {ability.effects && ability.effects.length > 0 && (
          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', color: 'var(--bc-gold-bright)' }}>
            <Sparkles size={10} />
            {ability.effects.map((e, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  background: 'rgba(212, 175, 55, 0.08)',
                  padding: '2px 6px',
                  borderRadius: 'var(--bc-radius-sm)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                }}
              >
                {e.value >= 0 ? `+${e.value}` : e.value} {TARGET_LABELS[e.target] || e.target}
              </span>
            ))}
          </span>
        )}

        {/* Recover button */}
        {ability.maxUses > 0 && ability.currentUses < ability.maxUses && (
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                if (ability.resourceType === 'HYBRID') {
                  setShowRecover((v) => !v);
                } else {
                  onRecover(ability.resourceType);
                }
              }}
              disabled={busy}
              title={
                ability.resourceType === 'HYBRID'
                  ? 'Escolher recurso pra gastar (-50, descontos de itens aplicam)'
                  : `Recuperar 1 uso (-50 ${RESOURCE_SHORT[ability.resourceType]}, descontos de itens aplicam)`
              }
              style={{
                background: 'transparent',
                border: '1px solid var(--bc-edge)',
                color: 'var(--bc-gold-dim)',
                cursor: busy ? 'wait' : 'pointer',
                padding: '3px 8px',
                borderRadius: 'var(--bc-radius-sm)',
                fontSize: 10,
                fontFamily: 'var(--bc-font-display)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              + Recuperar
            </button>
            {showRecover && ability.resourceType === 'HYBRID' && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: 'var(--bc-surface-2)',
                  border: '1px solid var(--bc-edge)',
                  borderRadius: 'var(--bc-radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 10,
                  minWidth: 120,
                }}
              >
                {(['MANA', 'STAMINA'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => {
                      setShowRecover(false);
                      onRecover(res);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--bc-ink)',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontFamily: 'var(--bc-font-body)',
                    }}
                  >
                    Gastar {RESOURCE_LABEL[res]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
