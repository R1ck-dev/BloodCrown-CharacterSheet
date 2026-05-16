/**
 * Cabecalho da ficha — nome/classe/nivel/heroico/cluster de acoes + save.
 * Le do FormContext (RHF) pra exibir/editar campos. Heroico (0/1 no
 * backend) controlado via Controller pra bool <-> int.
 */
import { Link } from 'react-router-dom';
import { Controller, useFormContext } from 'react-hook-form';
import { StickyNote, ArrowLeft, Tent, Save } from 'lucide-react';
import type { CharacterSheet } from '@/types/character';
import { Button } from '@/components/ui/Button';
import { SaveIndicator } from './SaveIndicator';
import type { SaveStatus } from '@/hooks/useAutoSave';

interface Props {
  saveStatus: SaveStatus;
  onSaveNow: () => void;
  onOpenNotepad: () => void;
  onRest: () => void;
  isSaving: boolean;
  isResting: boolean;
}

export function SheetHeader({
  saveStatus,
  onSaveNow,
  onOpenNotepad,
  onRest,
  isSaving,
  isResting,
}: Props) {
  const { register, control } = useFormContext<CharacterSheet>();

  const headerInputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--bc-edge)',
    fontFamily: 'var(--bc-font-display)',
    color: 'var(--bc-ink)',
    padding: '6px 0',
    borderRadius: 0,
    outline: 'none',
    width: '100%',
  };

  const iconBtnStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 'var(--bc-radius-sm)',
    background: 'color-mix(in srgb, var(--bc-surface-2) 85%, transparent)',
    border: '1px solid var(--bc-edge)',
    color: 'var(--bc-ink-dim)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
  };

  return (
    <header
      style={{
        height: 68,
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'minmax(160px, 2fr) minmax(140px, 1.4fr) 80px auto auto',
        alignItems: 'center',
        gap: 16,
        background: 'linear-gradient(180deg, var(--bc-surface-1) 0%, var(--bc-oled) 100%)',
        borderBottom: '1px solid var(--bc-edge)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--bc-z-sticky)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 1,
          background:
            'linear-gradient(90deg, transparent, color-mix(in srgb, var(--bc-gold) 50%, transparent) 20%, color-mix(in srgb, var(--bc-gold) 50%, transparent) 80%, transparent)',
        }}
      />

      {/* Personagem */}
      <div>
        <label
          className="bc-cinzel bc-tracked"
          style={{ fontSize: 9, color: 'var(--bc-gold-dim)', display: 'block' }}
          htmlFor="charName"
        >
          PERSONAGEM
        </label>
        <input
          id="charName"
          {...register('name')}
          placeholder="Sem nome"
          style={{ ...headerInputStyle, fontSize: 19, fontWeight: 600 }}
        />
      </div>

      {/* Classe */}
      <div>
        <label
          className="bc-cinzel bc-tracked"
          style={{ fontSize: 9, color: 'var(--bc-gold-dim)', display: 'block' }}
          htmlFor="charClass"
        >
          CLASSE
        </label>
        <input
          id="charClass"
          {...register('characterClass')}
          placeholder="Ex: Irregular"
          style={{ ...headerInputStyle, fontSize: 15 }}
        />
      </div>

      {/* Nivel + Heroico (compactos lado a lado) */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label
            className="bc-cinzel bc-tracked"
            style={{ fontSize: 9, color: 'var(--bc-gold-dim)', display: 'block' }}
            htmlFor="charLevel"
          >
            NIVEL
          </label>
          <input
            id="charLevel"
            type="number"
            min={1}
            {...register('level', { valueAsNumber: true })}
            style={{
              ...headerInputStyle,
              fontSize: 19,
              fontWeight: 600,
              color: 'var(--bc-gold-bright)',
              textAlign: 'left',
            }}
          />
        </div>
      </div>

      {/* Heroico toggle */}
      <div style={{ paddingLeft: 12, borderLeft: '1px solid color-mix(in srgb, var(--bc-gold) 10%, transparent)' }}>
        <Controller
          control={control}
          name="heroPoint"
          render={({ field }) => (
            <label className="bc-switch-wrap">
              <input
                className="bc-switch-wrap__input"
                type="checkbox"
                checked={field.value === 1}
                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
              <span className="bc-switch" aria-hidden="true" />
              <span className="bc-switch-wrap__label">Heroico</span>
            </label>
          )}
        />
      </div>

      {/* Cluster de acoes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onOpenNotepad}
          title="Bloco de notas"
          aria-label="Bloco de notas"
          style={iconBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--bc-edge-strong)';
            e.currentTarget.style.color = 'var(--bc-gold-bright)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--bc-edge)';
            e.currentTarget.style.color = 'var(--bc-ink-dim)';
          }}
        >
          <StickyNote size={15} />
        </button>

        <Link
          to="/dashboard"
          title="Voltar pra Mesa de Jogo"
          aria-label="Voltar pra Mesa de Jogo"
          style={{ ...iconBtnStyle, textDecoration: 'none' }}
        >
          <ArrowLeft size={15} />
        </Link>

        <button
          type="button"
          onClick={onRest}
          disabled={isResting}
          title="Descanso longo"
          aria-label="Descanso longo"
          style={{
            ...iconBtnStyle,
            cursor: isResting ? 'wait' : 'pointer',
            opacity: isResting ? 0.6 : 1,
          }}
        >
          <Tent size={15} />
        </button>

        <SaveIndicator status={saveStatus} />

        <Button onClick={onSaveNow} loading={isSaving} size="md" style={{ padding: '10px 18px' }}>
          <span style={{ color: 'var(--bc-gold-bright)', display: 'inline-flex' }}>
            <Save size={13} />
          </span>
          Salvar
        </Button>
      </div>
    </header>
  );
}
