/**
 * Indicador visual do estado do auto-save (idle/saving/saved/error).
 * Dot colorido + label uppercase pequena.
 */
import type { SaveStatus } from '@/hooks/useAutoSave';

interface Props {
  status: SaveStatus;
}

const CONFIG: Record<SaveStatus, { color: string; bg: string; border: string; label: string; pulse: boolean }> = {
  idle: {
    color: 'var(--bc-success)',
    bg: 'color-mix(in srgb, var(--bc-success) 6%, transparent)',
    border: 'color-mix(in srgb, var(--bc-success) 25%, transparent)',
    label: 'Salvo',
    pulse: false,
  },
  saving: {
    color: 'var(--bc-warning)',
    bg: 'color-mix(in srgb, var(--bc-warning) 8%, transparent)',
    border: 'color-mix(in srgb, var(--bc-warning) 35%, transparent)',
    label: 'Salvando...',
    pulse: true,
  },
  saved: {
    color: 'var(--bc-success)',
    bg: 'color-mix(in srgb, var(--bc-success) 12%, transparent)',
    border: 'color-mix(in srgb, var(--bc-success) 45%, transparent)',
    label: 'Salvo',
    pulse: true,
  },
  error: {
    color: 'var(--bc-blood-bright)',
    bg: 'color-mix(in srgb, var(--bc-blood-bright) 10%, transparent)',
    border: 'color-mix(in srgb, var(--bc-blood-bright) 50%, transparent)',
    label: 'Erro ao salvar',
    pulse: false,
  },
};

export function SaveIndicator({ status }: Props) {
  const cfg = CONFIG[status];
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 'var(--bc-radius-sm)',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: cfg.color,
          boxShadow: `0 0 8px ${cfg.color}`,
          animation: cfg.pulse ? 'bc-buff-pulse 1.4s ease-in-out infinite' : undefined,
        }}
      />
      <span
        className="bc-tracked-soft"
        style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}
      >
        {cfg.label}
      </span>
    </div>
  );
}
