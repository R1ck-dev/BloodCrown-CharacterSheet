/**
 * Linha de status (Vida/Mana/Sanidade/Estamina).
 * Label colorida + valor atual/max editavel inline + barra preenchida.
 * Quando critical=true, dispara animacao bc-hp-pulse via classe.
 */
import { Controller, useFormContext } from 'react-hook-form';
import type { CharacterSheet } from '@/types/character';

export type StatusColor = 'red' | 'blue' | 'green' | 'yellow';

interface ColorPalette {
  bright: string;
  base: string;
  dark: string;
  glow: string;
  text: string;
}

const COLORS: Record<StatusColor, ColorPalette> = {
  red:    { bright: '#EF4444', base: '#B91C1C', dark: '#4A0303', glow: 'rgba(220, 38, 38, 0.6)', text: '#FCA5A5' },
  blue:   { bright: '#3B82F6', base: '#1D4ED8', dark: '#0F1A4A', glow: 'rgba(59, 130, 246, 0.5)', text: '#93C5FD' },
  green:  { bright: '#22C55E', base: '#15803D', dark: '#0A3D1F', glow: 'rgba(34, 197, 94, 0.5)', text: '#86EFAC' },
  yellow: { bright: '#EAB308', base: '#CA8A04', dark: '#4A3503', glow: 'rgba(234, 179, 8, 0.5)', text: '#FDE68A' },
};

interface Props {
  label: string;
  color: StatusColor;
  currentField: 'currentHealth' | 'currentSanity' | 'currentMana' | 'currentStamina';
  maxField: 'maxHealth' | 'maxSanity' | 'maxMana' | 'maxStamina';
  /** Aplica pulso vermelho quando valor relativo < 0.25 */
  criticalAware?: boolean;
}

export function StatusBar({ label, color, currentField, maxField, criticalAware = false }: Props) {
  const { control } = useFormContext<CharacterSheet>();
  const p = COLORS[color];

  return (
    <Controller
      control={control}
      name={`status.${currentField}`}
      render={({ field: curField }) => (
        <Controller
          control={control}
          name={`status.${maxField}`}
          render={({ field: mxField }) => {
            const cur = Number(curField.value) || 0;
            const max = Number(mxField.value) || 0;
            const pct = max > 0 ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;
            const isCritical = criticalAware && max > 0 && cur > 0 && cur / max < 0.25;

            return (
              <div
                className="bc-bar-row"
                style={{
                  marginBottom: 12,
                  ['--bc-bar-bright' as never]: p.bright,
                  ['--bc-bar-base' as never]: p.base,
                  ['--bc-bar-dark' as never]: p.dark,
                  ['--bc-bar-glow' as never]: p.glow,
                  ['--bc-bar-text' as never]: p.text,
                }}
              >
                <div className="bc-bar-row__head">
                  <span className="bc-bar-row__label">{label}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <input
                      type="number"
                      value={cur}
                      onChange={(e) => curField.onChange(parseInt(e.target.value) || 0)}
                      onBlur={curField.onBlur}
                      ref={curField.ref}
                      aria-label={`${label} atual`}
                      style={{
                        width: 44,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: p.text,
                        textAlign: 'right',
                        fontFamily: 'var(--bc-font-display)',
                        fontSize: 13,
                      }}
                    />
                    <span className="bc-bar-row__value-divider">/</span>
                    <input
                      type="number"
                      value={max}
                      onChange={(e) => mxField.onChange(parseInt(e.target.value) || 0)}
                      onBlur={mxField.onBlur}
                      ref={mxField.ref}
                      aria-label={`${label} maximo`}
                      style={{
                        width: 44,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: p.text,
                        textAlign: 'left',
                        fontFamily: 'var(--bc-font-display)',
                        fontSize: 13,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
                <div className={`bc-bar ${isCritical ? 'bc-bar--critical' : ''}`}>
                  <div className="bc-bar__fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          }}
        />
      )}
    />
  );
}
