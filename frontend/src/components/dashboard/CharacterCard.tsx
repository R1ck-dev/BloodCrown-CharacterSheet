/**
 * Card de um personagem no Dashboard.
 *
 * Composicao:
 *   - Cantos filigrana superiores (decoracao discreta — via .bc-frame)
 *   - Botoes Mover + Trash (canto superior direito)
 *   - Avatar circular (clamp 60-76px): gradient acentuado por classe + inicial gigante + badge
 *     com glyph da classe (Skull, Sword, Flame, etc.)
 *   - Nome (Cinzel) + "Classe · Nv X" (Cinzel tracked)
 *   - HP mini bar (oculta se backend nao retornou HP)
 *   - Botao "Abrir Ficha" full-width
 *
 * onClick no card todo navega pra ficha (exceto se clicar em [data-stop-card]).
 * Hover-state via CSS (.bc-character-card:hover) — funciona em touch tambem.
 * Dimensoes fluidas via clamp() pra adaptar a viewport pequena.
 */
import { useState, useRef, useEffect } from 'react';
import { Trash2, BookOpen, FolderInput, Inbox, Folder as FolderIcon, Check } from 'lucide-react';
import type { CharacterSummary, Folder } from '@/types/character';
import { glyphForClass } from '@/lib/classGlyph';

interface Props {
  character: CharacterSummary;
  folders: Folder[];
  onOpen: () => void;
  onDelete: () => void;
  onMove: (folderId: string | null) => void;
}

export function CharacterCard({ character, folders, onOpen, onDelete, onMove }: Props) {
  const [moveOpen, setMoveOpen] = useState(false);
  const moveRef = useRef<HTMLDivElement>(null);

  // Click-outside fecha dropdown
  useEffect(() => {
    if (!moveOpen) return;
    const handler = (e: MouseEvent) => {
      if (moveRef.current && !moveRef.current.contains(e.target as Node)) {
        setMoveOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moveOpen]);

  const initial = character.name?.[0]?.toUpperCase() || '?';
  const klass = character.characterClass || 'Sem classe';
  const { Icon, base, bright } = glyphForClass(character.characterClass);

  const hasHp =
    typeof character.currentHealth === 'number' &&
    typeof character.maxHealth === 'number' &&
    character.maxHealth > 0;
  const hpPct = hasHp
    ? Math.max(
        0,
        Math.min(100, ((character.currentHealth as number) / (character.maxHealth as number)) * 100),
      )
    : 0;
  const hpCrit = hasHp && hpPct < 25;

  return (
    <article
      className="bc-frame bc-character-card"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-stop-card]')) return;
        onOpen();
      }}
    >
      {/* Cluster top-right: Mover + Trash */}
      <div
        data-stop-card
        ref={moveRef}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'inline-flex',
          gap: 4,
          zIndex: 2,
        }}
      >
        <button
          type="button"
          data-stop-card
          onClick={(e) => {
            e.stopPropagation();
            setMoveOpen((v) => !v);
          }}
          aria-label={`Mover ${character.name} pra outra pasta`}
          aria-expanded={moveOpen}
          title="Mover pra pasta"
          className="bc-character-card__action"
        >
          <FolderInput size={14} />
        </button>

        <button
          type="button"
          data-stop-card
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Excluir ficha de ${character.name}`}
          className="bc-character-card__action bc-character-card__action--danger"
        >
          <Trash2 size={14} />
        </button>

        {moveOpen && (
          <div
            role="menu"
            data-stop-card
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              minWidth: 180,
              maxHeight: 280,
              overflowY: 'auto',
              background: 'var(--bc-surface-2, #14121A)',
              border: '1px solid var(--bc-edge)',
              borderRadius: 'var(--bc-radius-sm)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              padding: 4,
              zIndex: 10,
            }}
          >
            <MoveMenuItem
              icon={<Inbox size={12} />}
              label="Sem pasta"
              active={!character.folderId}
              onClick={() => {
                onMove(null);
                setMoveOpen(false);
              }}
            />
            {folders.length > 0 && (
              <div style={{ height: 1, background: 'var(--bc-edge)', margin: '4px 2px' }} />
            )}
            {folders.map((f) => (
              <MoveMenuItem
                key={f.id}
                icon={<FolderIcon size={12} />}
                label={f.name}
                active={character.folderId === f.id}
                onClick={() => {
                  onMove(f.id);
                  setMoveOpen(false);
                }}
              />
            ))}
            {folders.length === 0 && (
              <p
                style={{
                  fontSize: 10,
                  color: 'var(--bc-ink-faint)',
                  fontStyle: 'italic',
                  padding: '6px 10px',
                  margin: 0,
                }}
              >
                Crie pastas na lateral.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Avatar circular com glyph badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <div
          className="bc-character-card__avatar"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${bright}66, ${base}88 50%, #0E0A12 100%)`,
          }}
        >
          {/* Aro dourado gravado */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 4,
              borderRadius: '50%',
              border: '1px solid rgba(212, 175, 55, 0.25)',
            }}
          />
          <span
            className="bc-cinzel"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(24px, 6vw, 30px)',
              color: 'var(--bc-ink)',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {initial}
          </span>
          {/* Glyph badge no canto inferior direito */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--bc-oled)',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bc-gold)',
            }}
          >
            <Icon size={11} />
          </div>
        </div>
      </div>

      {/* Nome + classe */}
      <div style={{ textAlign: 'center' }}>
        <div className="bc-character-card__name">{character.name}</div>
        <div
          className="bc-cinzel"
          style={{
            fontSize: 11,
            color: 'var(--bc-gold-dim)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {klass} · Nv {character.level}
        </div>
      </div>

      {/* HP mini bar — label "VIDA" + cur/max em mono acima, barra abaixo.
          CSS vars locais colorem a .bc-bar como vermelho-sangue. */}
      {hasHp && (
        <div
          className="bc-character-card__hp"
          style={{
            ['--bc-bar-bright' as never]: '#EF4444',
            ['--bc-bar-base' as never]: '#B91C1C',
            ['--bc-bar-dark' as never]: '#4A0303',
            ['--bc-bar-glow' as never]: 'rgba(220, 38, 38, 0.5)',
          }}
          title={`Vida: ${character.currentHealth}/${character.maxHealth}`}
        >
          <div className="bc-mono bc-character-card__hp-head">
            <span>VIDA</span>
            <span>
              {character.currentHealth}/{character.maxHealth}
            </span>
          </div>
          <div className={`bc-bar${hpCrit ? ' bc-bar--critical' : ''}`}>
            <div className="bc-bar__fill" style={{ width: `${hpPct}%` }} />
          </div>
        </div>
      )}

      {/* Botao Abrir Ficha */}
      <button
        type="button"
        data-stop-card
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="bc-cinzel bc-tracked bc-character-card__open"
      >
        <BookOpen size={12} />
        Abrir Ficha
      </button>
    </article>
  );
}

interface MoveMenuItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function MoveMenuItem({ icon, label, active, onClick }: MoveMenuItemProps) {
  return (
    <button
      type="button"
      data-stop-card
      role="menuitem"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`bc-character-card__menu-item${active ? ' bc-character-card__menu-item--active' : ''}`}
    >
      <span style={{ color: active ? 'var(--bc-gold)' : 'var(--bc-gold-dim)', display: 'inline-flex' }}>
        {icon}
      </span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {active && <Check size={11} color="var(--bc-gold-bright)" />}
    </button>
  );
}
