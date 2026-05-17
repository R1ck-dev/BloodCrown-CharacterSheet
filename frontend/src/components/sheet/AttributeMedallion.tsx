/**
 * Medalhao clicavel de um atributo. Le valor base via useFormContext,
 * exibe valor base + buff (se houver). Click dispara rolagem de atributo.
 *
 * Buff visual: aura dourada pulsante via .bc-medallion--buffed.
 * Click: usa o hook useDiceRoll injetado via prop (evita criar uma toast
 * factory dentro do componente — separation of concerns).
 */
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { CharacterSheet } from '@/types/character';
import type { AttributeField } from '@/lib/buffTargets';

interface Props {
  /** Path do form RHF — ex: 'attributes.forca' */
  field: AttributeField;
  /** Label uppercase exibida acima — ex: 'FOR' */
  label: string;
  /** Nome amigavel pra rolagem — ex: 'Teste de Forca' */
  rollName: string;
  /** Buff total ativo nesse atributo (vindo de useActiveEffects) */
  buff: number;
  /** Handler de rolagem (vem do useDiceRoll do parent) */
  onRoll: (source: string, value: number) => void;
}

export function AttributeMedallion({ field, label, rollName, buff, onRoll }: Props) {
  const { control } = useFormContext<CharacterSheet>();
  const [editing, setEditing] = useState(false);
  const isBuffed = buff !== 0;

  return (
    <div className="bc-medallion-wrap">
      <span className="bc-medallion__label">{label}</span>
      <Controller
        control={control}
        name={`attributes.${field}` as `attributes.forca`}
        render={({ field: rhfField }) => {
          const base = Number(rhfField.value) || 0;
          const displayed = base + buff;

          return (
            <button
              type="button"
              className={`bc-medallion ${isBuffed ? 'bc-medallion--buffed' : ''}`}
              aria-label={`Atributo ${label}, valor ${displayed}${isBuffed ? ` (base ${base} + buff ${buff})` : ''}. Clique para rolar.`}
              onClick={() => {
                if (editing) return;
                onRoll(rollName, displayed);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >
              {editing ? (
                <input
                  autoFocus
                  type="number"
                  defaultValue={base}
                  onBlur={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    rhfField.onChange(v);
                    setEditing(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    } else if (e.key === 'Escape') {
                      setEditing(false);
                    }
                  }}
                  style={{
                    width: '70%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    textAlign: 'center',
                    fontFamily: 'var(--bc-font-display)',
                    fontWeight: 600,
                    fontSize: 'clamp(22px, 2.8vw, 30px)',
                    color: 'var(--bc-ink)',
                  }}
                />
              ) : (
                <span className="bc-medallion__num">{displayed}</span>
              )}
            </button>
          );
        }}
      />
    </div>
  );
}
