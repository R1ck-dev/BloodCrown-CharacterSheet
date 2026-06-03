/**
 * SoundToggle — controle de som no header da ficha. Ícone de alto-falante que
 * abre um popover com toggle de mudo + slider de volume. Estado global e
 * persistido via useSound (localStorage 'bc_sound'). Fecha em clique-fora/Escape.
 */
import { useEffect, useRef, useState } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import { preloadSounds } from '@/lib/sound';

export function SoundToggle() {
  const { muted, volume, toggleMuted, setVolume } = useSound();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Aquece o cache dos sons assim que a ficha abre, pra 1ª reprodução ser instantânea.
  useEffect(() => {
    preloadSounds();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const Icon = muted || volume <= 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Som"
        aria-label="Configuracoes de som"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="bc-sheet-header__icon-btn"
      >
        <Icon size={15} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Configuracoes de som"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 50,
            width: 200,
            padding: 12,
            background: 'var(--bc-gradient-surface)',
            border: '1px solid var(--bc-edge-strong)',
            borderRadius: 'var(--bc-radius-md)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={toggleMuted}
            className="bc-cinzel bc-tracked"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: '1px solid var(--bc-edge)',
              color: muted ? 'var(--bc-ink-dim)' : 'var(--bc-gold-bright)',
              padding: '6px 10px',
              borderRadius: 'var(--bc-radius-sm)',
              cursor: 'pointer',
              fontSize: 10,
            }}
          >
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            {muted ? 'Som desligado' : 'Som ligado'}
          </button>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              className="bc-cinzel"
              style={{
                fontSize: 9,
                letterSpacing: '0.16em',
                color: 'var(--bc-gold-dim)',
                textTransform: 'uppercase',
              }}
            >
              Volume
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              disabled={muted}
              aria-label="Volume"
              style={{ width: '100%', accentColor: 'var(--bc-gold)', cursor: muted ? 'not-allowed' : 'pointer' }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
