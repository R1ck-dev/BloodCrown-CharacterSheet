/**
 * Card de habilidade — header (nome + chips + Ativar/Off + chevron) sempre
 * visivel. Click no header expande o body com descricao, efeitos, dice,
 * substitutos de acao (se sem pool) e botoes Recuperar/Editar/Deletar.
 *
 * Substitutos: quando ativar sem pool direto, o dropdown aparece DENTRO do
 * body expandido em vez de flutuar — UX mais limpa pra um card inline.
 */
import { type MouseEvent, useState, useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown, Clock, Dice5, Pencil, Power, Sparkles, Trash2 } from 'lucide-react';
import { MarkdownView } from '@/components/ui/MarkdownView';
import { resolveTargetLabel } from '@/lib/buffTargets';
import { ACTION_COLORS, ACTION_LABELS, availableSubstitutes, poolRemaining } from '@/lib/actionTypes';
import type { Ability, AbilityResource, ActionType, CharacterSheet, CustomSkill } from '@/types/character';

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

interface Props {
  ability: Ability;
  onToggle: (spendAs?: ActionType) => void;
  onRecover: (res: AbilityResource) => void;
  onRoll: (formula: string, source: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  busy?: boolean;
  /** Perícias personalizadas — pra resolver o nome em badges de efeito (customSkill:<id>). */
  customSkills?: CustomSkill[];
}

export function AbilityCardCompact({
  ability,
  onToggle,
  onRecover,
  onRoll,
  onEdit,
  onDelete,
  busy = false,
  customSkills = [],
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const bodyId = useId();
  const { watch } = useFormContext<CharacterSheet>();
  const pool = watch('actionPool');

  const isExhausted = ability.maxUses > 0 && ability.currentUses <= 0;
  const isOnCooldown = ability.turnsRemaining !== null && ability.turnsRemaining > 0;
  const required = ability.actionType;
  const hasDirectPool = required === 'FREE' || poolRemaining(pool, required) > 0;
  const subs = availableSubstitutes(pool, required);
  const noActionsAvailable = !hasDirectPool && subs.length === 0;
  const disableToggle = busy || ((isExhausted || noActionsAvailable) && !ability.isActive);

  const stripeClass = ability.isActive ? 'bc-card-compact--gold' : 'bc-card-compact--purple';
  const stateClass = ability.isActive
    ? 'bc-card-compact--active'
    : isExhausted
      ? 'bc-card-compact--exhausted'
      : '';

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    if (ability.isActive || hasDirectPool) {
      onToggle();
      return;
    }
    if (subs.length > 0) {
      // Sem pool direto: garante body aberto e mostra dropdown de substitutos
      setExpanded(true);
      setShowSubstitutes(true);
      return;
    }
    onToggle();
  };

  const stopAndRun = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className={`bc-card-compact ${stripeClass} ${stateClass}`}>
      <button
        type="button"
        className="bc-card-compact__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={bodyId}
      >
        <span className="bc-card-compact__name">{ability.name || 'Sem nome'}</span>
        <span className="bc-card-compact__meta">
          <span
            className="bc-card-compact__chip"
            style={{ color: ACTION_COLORS[required], borderColor: 'currentColor' }}
            title={`Custa 1 acao ${ACTION_LABELS[required]}`}
          >
            {ACTION_LABELS[required]}
          </span>
          {ability.maxUses > 0 && (
            <span
              className={`bc-card-compact__chip ${isExhausted ? 'bc-card-compact__chip--warn' : ''}`}
              title={`${ability.currentUses}/${ability.maxUses} usos restantes`}
            >
              {ability.currentUses}/{ability.maxUses}
            </span>
          )}
          {isOnCooldown && (
            <span className="bc-card-compact__chip" style={{ color: '#FDE68A', borderColor: 'rgba(234,179,8,0.4)' }}>
              <Clock size={9} /> {ability.turnsRemaining}
            </span>
          )}
          <span
            role="button"
            tabIndex={-1}
            onClick={handleToggle}
            aria-disabled={disableToggle}
            aria-label={ability.isActive ? 'Desativar habilidade' : 'Ativar habilidade'}
            className={`bc-card-compact__action ${ability.isActive ? 'bc-card-compact__action--active' : ''}`}
            style={disableToggle ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            title={
              isExhausted && !ability.isActive
                ? 'Sem usos restantes — recupere primeiro'
                : noActionsAvailable && !ability.isActive
                  ? 'Sem acao disponivel'
                  : ability.isActive
                    ? 'Clique pra desativar'
                    : 'Ativar habilidade'
            }
          >
            <Power size={11} />
            {ability.isActive ? 'Ativa' : 'Off'}
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
              {/* Substitutos inline (so visivel quando ativacao requer escolha) */}
              {showSubstitutes && subs.length > 0 && (
                <div
                  style={{
                    border: '1px solid var(--bc-edge)',
                    borderRadius: 'var(--bc-radius-sm)',
                    background: 'rgba(123, 44, 191, 0.08)',
                    padding: 10,
                  }}
                >
                  <div
                    className="bc-cinzel bc-tracked-soft"
                    style={{ fontSize: 10, color: 'var(--bc-ink-faint)', marginBottom: 8 }}
                  >
                    SEM {ACTION_LABELS[required].toUpperCase()} — GASTAR:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {subs.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        className="bc-card-compact__icon-btn"
                        style={{ color: ACTION_COLORS[sub], borderColor: 'currentColor' }}
                        onClick={stopAndRun(() => {
                          setShowSubstitutes(false);
                          onToggle(sub);
                        })}
                      >
                        {ACTION_LABELS[sub]} <span style={{ opacity: 0.6 }}>({poolRemaining(pool, sub)})</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="bc-card-compact__icon-btn"
                      onClick={stopAndRun(() => setShowSubstitutes(false))}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Efeitos */}
              {ability.effects && ability.effects.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', color: 'var(--bc-gold-bright)' }}>
                  <Sparkles size={11} />
                  {ability.effects.map((e, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        background: 'rgba(212, 175, 55, 0.08)',
                        padding: '2px 6px',
                        borderRadius: 'var(--bc-radius-sm)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                      }}
                    >
                      {e.value >= 0 ? `+${e.value}` : e.value} {resolveTargetLabel(e.target, customSkills)}
                    </span>
                  ))}
                </div>
              )}

              {/* Dado rolavel */}
              {ability.diceRoll && (
                <button
                  type="button"
                  onClick={stopAndRun(() => onRoll(ability.diceRoll, ability.name || 'Habilidade'))}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'rgba(123, 44, 191, 0.18)',
                    border: '1px solid rgba(157, 78, 221, 0.4)',
                    color: '#C8A4FF',
                    cursor: 'pointer',
                    fontFamily: 'var(--bc-font-display)',
                    fontWeight: 600,
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 'var(--bc-radius-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Dice5 size={11} /> {ability.diceRoll}
                </button>
              )}

              {/* Descricao */}
              {ability.description ? (
                <MarkdownView source={ability.description} />
              ) : (
                <p style={{ color: 'var(--bc-ink-faint)', fontStyle: 'italic', fontSize: 12, margin: 0 }}>
                  Sem descricao.
                </p>
              )}

              {/* Footer: Recuperar uso + Editar + Deletar */}
              <div className="bc-card-compact__footer">
                {ability.maxUses > 0 && ability.currentUses < ability.maxUses && (
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="bc-card-compact__icon-btn"
                      onClick={stopAndRun(() => {
                        if (ability.resourceType === 'HYBRID') {
                          setShowRecover((v) => !v);
                        } else {
                          onRecover(ability.resourceType);
                        }
                      })}
                      disabled={busy}
                      title={
                        ability.resourceType === 'HYBRID'
                          ? 'Escolher recurso pra gastar (-50, descontos de itens aplicam)'
                          : `Recuperar 1 uso (-50 ${RESOURCE_SHORT[ability.resourceType]}, descontos de itens aplicam)`
                      }
                    >
                      + Recuperar
                    </button>
                    {showRecover && ability.resourceType === 'HYBRID' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: 4,
                          background: 'var(--bc-surface-2)',
                          border: '1px solid var(--bc-edge)',
                          borderRadius: 'var(--bc-radius-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          zIndex: 10,
                          minWidth: 140,
                        }}
                      >
                        {(['MANA', 'STAMINA'] as const).map((res) => (
                          <button
                            key={res}
                            type="button"
                            onClick={stopAndRun(() => {
                              setShowRecover(false);
                              onRecover(res);
                            })}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--bc-ink)',
                              cursor: 'pointer',
                              padding: '6px 10px',
                              textAlign: 'left',
                              fontSize: 11,
                            }}
                          >
                            Gastar {RESOURCE_LABEL[res]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
