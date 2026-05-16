/**
 * Card de um personagem no Dashboard.
 *
 * Composicao:
 *   - Cantos filigrana superiores (decoracao discreta)
 *   - Botao trash (canto superior direito) — onDelete
 *   - Avatar circular: gradient acentuado por classe + inicial gigante + badge
 *     com glyph da classe (Skull, Sword, Flame, etc.)
 *   - Nome (Cinzel) + "Classe · Nv X" (Cinzel tracked)
 *   - HP mini bar (oculta se backend nao retornou HP)
 *   - Botao "Abrir Ficha" full-width
 *
 * onClick no card todo navega pra ficha (exceto se clicar no trash).
 */
import { Trash2, BookOpen } from 'lucide-react';
import type { CharacterSummary } from '@/types/character';
import { glyphForClass } from '@/lib/classGlyph';

interface Props {
  character: CharacterSummary;
  onOpen: () => void;
  onDelete: () => void;
}

export function CharacterCard({ character, onOpen, onDelete }: Props) {
  const initial = character.name?.[0]?.toUpperCase() || '?';
  const klass = character.characterClass || 'Sem classe';
  const { Icon, base, bright } = glyphForClass(character.characterClass);

  const hasHp =
    typeof character.currentHealth === 'number' && typeof character.maxHealth === 'number' && character.maxHealth > 0;
  const hpPct = hasHp
    ? Math.max(0, Math.min(100, ((character.currentHealth as number) / (character.maxHealth as number)) * 100))
    : 0;

  return (
    <article
      className="bc-frame"
      style={{
        borderRadius: 'var(--bc-radius-md)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'pointer',
        transition:
          'transform var(--bc-duration-base) var(--bc-ease-out-quart), border-color var(--bc-duration-base) var(--bc-ease-out-quart), box-shadow var(--bc-duration-base) var(--bc-ease-out-quart)',
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-stop-card]')) return;
        onOpen();
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(-3px)';
        el.style.borderColor = 'rgba(157, 78, 221, 0.45)';
        el.style.boxShadow =
          '0 0 0 1px rgba(157, 78, 221, 0.25), 0 16px 40px -10px rgba(123, 44, 191, 0.55), inset 0 1px 0 rgba(212, 175, 55, 0.15)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = '';
        el.style.borderColor = '';
        el.style.boxShadow = '';
      }}
    >
      {/* Trash */}
      <button
        type="button"
        data-stop-card
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Excluir ficha de ${character.name}`}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'transparent',
          border: '1px solid rgba(185, 28, 28, 0.25)',
          color: 'rgba(229, 99, 94, 0.7)',
          width: 26,
          height: 26,
          borderRadius: 'var(--bc-radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
          zIndex: 2,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(185, 28, 28, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
          e.currentTarget.style.color = '#FCA5A5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(185, 28, 28, 0.25)';
          e.currentTarget.style.color = 'rgba(229, 99, 94, 0.7)';
        }}
      >
        <Trash2 size={13} />
      </button>

      {/* Avatar circular com glyph badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            position: 'relative',
            background: `radial-gradient(circle at 30% 25%, ${bright}66, ${base}88 50%, #0E0A12 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -3px 6px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(212,175,55,0.3), 0 4px 12px rgba(0,0,0,0.6)',
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
              fontSize: 30,
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
        <div
          className="bc-cinzel"
          style={{
            fontWeight: 600,
            fontSize: 17,
            color: 'var(--bc-ink)',
            letterSpacing: '0.04em',
            lineHeight: 1.2,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {character.name}
        </div>
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

      {/* HP mini bar */}
      {hasHp && (
        <div
          // CSS vars locais colorem a .bc-bar como vermelho-sangue
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: -2,
            ['--bc-bar-bright' as never]: '#EF4444',
            ['--bc-bar-base' as never]: '#B91C1C',
            ['--bc-bar-dark' as never]: '#4A0303',
            ['--bc-bar-glow' as never]: 'rgba(220, 38, 38, 0.5)',
          }}
          title={`Vida: ${character.currentHealth}/${character.maxHealth}`}
        >
          <span
            className="bc-mono"
            style={{
              fontSize: 9,
              color: '#FCA5A5',
              minWidth: 38,
              letterSpacing: '0.05em',
            }}
          >
            {character.currentHealth}/{character.maxHealth}
          </span>
          <div className="bc-bar bc-bar--xs" style={{ flex: 1 }}>
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
        className="bc-cinzel bc-tracked"
        style={{
          background: 'linear-gradient(180deg, rgba(123, 44, 191, 0.25), rgba(123, 44, 191, 0.10))',
          color: 'var(--bc-gold-bright)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          padding: '10px 14px',
          fontSize: 11,
          marginTop: 4,
          borderRadius: 'var(--bc-radius-sm)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(180deg, rgba(157, 78, 221, 0.4), rgba(123, 44, 191, 0.2))';
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(180deg, rgba(123, 44, 191, 0.25), rgba(123, 44, 191, 0.10))';
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
        }}
      >
        <BookOpen size={12} />
        Abrir Ficha
      </button>
    </article>
  );
}
