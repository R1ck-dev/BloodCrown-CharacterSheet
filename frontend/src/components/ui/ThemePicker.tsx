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
          padding: '0 14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 9,
          background: open ? 'var(--bc-surface-3)' : 'var(--bc-surface-2)',
          border: '1px solid var(--bc-edge)',
          borderRadius: 'var(--bc-radius-md)',
          color: 'var(--bc-ink-dim)',
          cursor: 'pointer',
          transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--bc-ink)';
          e.currentTarget.style.borderColor = 'var(--bc-edge-bright)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--bc-ink-dim)';
          e.currentTarget.style.borderColor = 'var(--bc-edge)';
        }}
      >
        <Palette size={15} />
        <span
          aria-hidden="true"
          style={{
            width: 13,
            height: 13,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${active.swatch}, color-mix(in srgb, ${active.swatch} 50%, black))`,
            boxShadow: '0 0 0 1px var(--bc-edge-strong)',
          }}
        />
        <span
          className="bc-cinzel"
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}
        >
          {active.label}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 320,
            padding: 8,
            background: 'linear-gradient(180deg, var(--bc-surface-2), var(--bc-surface-1))',
            border: '1px solid var(--bc-edge-strong)',
            borderRadius: 'var(--bc-radius-lg)',
            boxShadow: 'var(--bc-shadow-lg)',
            backdropFilter: 'blur(12px)',
            zIndex: 'var(--bc-z-popover)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <div
            className="bc-cinzel"
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--bc-ink-faint)',
              padding: '6px 8px 8px',
            }}
          >
            Temas
          </div>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 10px',
                  background: isActive
                    ? 'linear-gradient(90deg, color-mix(in srgb, var(--bc-purple) 16%, transparent), transparent)'
                    : 'transparent',
                  border: isActive ? '1px solid var(--bc-edge-strong)' : '1px solid transparent',
                  borderRadius: 'var(--bc-radius-md)',
                  color: 'var(--bc-ink)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'color-mix(in srgb, var(--bc-surface-3) 60%, transparent)';
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
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 32% 28%, ${t.sealColor} 0%, color-mix(in srgb, ${t.sealColor} 55%, black) 65%, color-mix(in srgb, ${t.sealColor} 30%, black) 100%)`,
                    border: '1px solid var(--bc-edge-strong)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25)',
                  }}
                />
                {/* Nome com tipografia do tema + subtitle + paleta de 4 swatches */}
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span
                    className="bc-cinzel"
                    style={{
                      fontSize: 12,
                      fontWeight: t.displayWeight,
                      letterSpacing: t.displayTracking,
                      textTransform: t.displayTransform,
                    }}
                  >
                    {t.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--bc-ink-dim)',
                    }}
                  >
                    {t.subtitle}
                  </span>
                  <span style={{ display: 'inline-flex', gap: 3, marginTop: 3 }}>
                    {t.swatches.map((c, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: 2,
                          background: c,
                        }}
                      />
                    ))}
                  </span>
                </span>
                {isActive && (
                  <Check size={15} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--bc-gold-bright)' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
