/**
 * Cabecalho da ficha — nome/classe/nivel/heroico/cluster de acoes + save.
 * Le do FormContext (RHF) pra exibir/editar campos. Heroico (0/1 no
 * backend) controlado via Controller pra bool <-> int.
 *
 * Layout responsivo via styles/components/sheet-header.css:
 *   - mobile (<1024): 2 linhas (nome+actions / classe+nivel+heroico)
 *   - desktop (>=1024): grid 5-colunas original preservado
 * Botoes de icone usam .bc-sheet-header__icon-btn (44px mobile / 40px desktop
 * via WCAG; hover-state em CSS, sem onMouseEnter/Leave inline).
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

  return (
    <header className="bc-sheet-header">
      {/* Personagem */}
      <div className="bc-sheet-header__name">
        <label className="bc-sheet-header__field-label" htmlFor="charName">
          PERSONAGEM
        </label>
        <input
          id="charName"
          {...register('name')}
          placeholder="Sem nome"
          className="bc-sheet-header__input bc-sheet-header__input--name"
        />
      </div>

      {/* Bloco meta (classe + nivel + heroico) — em mobile vira 1 grid de 3 colunas
          na linha 2; em desktop os 3 ocupam as colunas 2/3/4 do header grid */}
      <div className="bc-sheet-header__meta">
        {/* Classe */}
        <div className="bc-sheet-header__class">
          <label className="bc-sheet-header__field-label" htmlFor="charClass">
            CLASSE
          </label>
          <input
            id="charClass"
            {...register('characterClass')}
            placeholder="Ex: Irregular"
            className="bc-sheet-header__input bc-sheet-header__input--class"
          />
        </div>

        {/* Nivel */}
        <div className="bc-sheet-header__level">
          <label className="bc-sheet-header__field-label" htmlFor="charLevel">
            NIVEL
          </label>
          <input
            id="charLevel"
            type="number"
            min={1}
            {...register('level', { valueAsNumber: true })}
            className="bc-sheet-header__input bc-sheet-header__input--level"
          />
        </div>

        {/* Heroico toggle */}
        <div className="bc-sheet-header__hero">
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
      </div>

      {/* Cluster de acoes */}
      <div className="bc-sheet-header__actions">
        <button
          type="button"
          onClick={onOpenNotepad}
          title="Bloco de notas"
          aria-label="Bloco de notas"
          className="bc-sheet-header__icon-btn"
        >
          <StickyNote size={15} />
        </button>

        <Link
          to="/dashboard"
          title="Voltar pra Mesa de Jogo"
          aria-label="Voltar pra Mesa de Jogo"
          className="bc-sheet-header__icon-btn"
        >
          <ArrowLeft size={15} />
        </Link>

        <button
          type="button"
          onClick={onRest}
          disabled={isResting}
          title="Descanso longo"
          aria-label="Descanso longo"
          className="bc-sheet-header__icon-btn"
        >
          <Tent size={15} />
        </button>

        <div className="bc-sheet-header__save-indicator">
          <SaveIndicator status={saveStatus} />
        </div>

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
