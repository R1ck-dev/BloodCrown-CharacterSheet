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
            minWidth: 320,
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
                  gridTemplateColumns: '32px 1fr 14px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
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
                {/* Mini-seal: preview do ornamento principal do tema */}
                <span
                  aria-hidden="true"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 30%, ${t.sealColor} 0%, color-mix(in srgb, ${t.sealColor} 55%, black) 60%, #0a0507 100%)`,
                    boxShadow:
                      'inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.5)',
                  }}
                />
                {/* Nome com tipografia do tema + subtitle + paleta de 4 swatches */}
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <span
                    className="bc-cinzel"
                    style={{
                      fontSize: 13,
                      fontWeight: t.displayWeight,
                      letterSpacing: t.displayTracking,
                      textTransform: t.displayTransform,
                    }}
                  >
                    {t.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--bc-ink-faint)',
                      fontStyle: 'italic',
                      marginTop: -2,
                    }}
                  >
                    {t.subtitle}
                  </span>
                  <span style={{ display: 'inline-flex', gap: 4, marginTop: 2 }}>
                    {t.swatches.map((c, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: c,
                          border: '1px solid rgba(0,0,0,0.45)',
                          boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                        }}
                      />
                    ))}
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
