/**
 * ThemePicker — dropdown gotico com 6 paletas.
 * Click fora ou ESC fecha. Aplica imediato e persiste em localStorage via useTheme.
 */
import { useEffect, useRef, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { THEMES, type ThemeKey } from '@/lib/theme';
import { useTheme } from '@/hooks/useTheme';

export function ThemePicker() {
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // ESC e click-fora fecham
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const active = THEMES.find((t) => t.key === theme) ?? THEMES[0];

  const handleSelect = (key: ThemeKey) => {
    setTheme(key);
    setOpen(false);
  };

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Selecionar tema"
        aria-expanded={open}
        aria-haspopup="menu"
        title={`Tema: ${active.label}`}
        style={{
          height: 36,
          padding: '0 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: open ? 'var(--bc-surface-2)' : 'transparent',
          border: '1px solid var(--bc-edge)',
          borderRadius: 'var(--bc-radius-sm)',
          color: 'var(--bc-ink-dim)',
          cursor: 'pointer',
          transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--bc-gold-bright)';
          e.currentTarget.style.borderColor = 'var(--bc-edge-bright)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--bc-ink-dim)';
          e.currentTarget.style.borderColor = 'var(--bc-edge)';
        }}
      >
        <Palette size={14} />
        <span
          aria-hidden="true"
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: active.swatch,
            boxShadow: `0 0 6px ${active.swatch}`,
            border: '1px solid rgba(0,0,0,0.4)',
          }}
        />
        <span
          className="bc-cinzel bc-tracked-soft"
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          {active.label}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 260,
            padding: 6,
            background: 'linear-gradient(180deg, var(--bc-surface-2), var(--bc-surface-1))',
            border: '1px solid var(--bc-edge)',
            borderRadius: 'var(--bc-radius-md)',
            boxShadow: 'var(--bc-shadow-lg)',
            backdropFilter: 'blur(12px)',
            zIndex: 'var(--bc-z-popover)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {THEMES.map((t) => {
            const isActive = t.key === theme;
            return (
              <button
                key={t.key}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => handleSelect(t.key)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '18px 1fr 14px',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  background: isActive ? 'color-mix(in srgb, var(--bc-gold) 12%, transparent)' : 'transparent',
                  border: isActive ? '1px solid var(--bc-edge-bright)' : '1px solid transparent',
                  borderRadius: 'var(--bc-radius-sm)',
                  color: isActive ? 'var(--bc-gold-bright)' : 'var(--bc-ink)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'color-mix(in srgb, var(--bc-purple) 12%, transparent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: t.swatch,
                    boxShadow: `0 0 8px ${t.swatch}`,
                    border: '1px solid rgba(0,0,0,0.4)',
                  }}
                />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                  <span
                    className="bc-cinzel bc-tracked-soft"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  >
                    {t.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--bc-ink-faint)',
                      fontStyle: 'italic',
                    }}
                  >
                    {t.subtitle}
                  </span>
                </span>
                {isActive && <Check size={12} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
