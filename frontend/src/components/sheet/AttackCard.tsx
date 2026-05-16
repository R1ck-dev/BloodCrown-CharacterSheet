/**
 * Card de um ataque — nome + descricao + botao com formula de dano
 * (clicavel pra rolar). Trash no canto direito.
 */
import { Dice5, Trash2, Pencil } from 'lucide-react';
import type { Attack } from '@/types/character';
import { MarkdownView } from '@/components/ui/MarkdownView';

interface Props {
  attack: Attack;
  onRoll: (formula: string, source: string) => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function AttackCard({ attack, onRoll, onDelete, onEdit }: Props) {
  return (
    <article
      style={{
        background: 'linear-gradient(180deg, rgba(26, 24, 32, 0.6), rgba(14, 10, 18, 0.8))',
        border: '1px solid var(--bc-edge)',
        borderLeft: '3px solid var(--bc-blood)',
        borderRadius: 'var(--bc-radius-sm)',
        padding: '12px 14px',
        marginBottom: 10,
        position: 'relative',
      }}
    >
      {/* Cluster top-right: editar + deletar */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ataque ${attack.name}`}
          title="Editar ataque"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--bc-ink-faint)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            transition: 'color var(--bc-duration-fast) var(--bc-ease-out-quart)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bc-gold-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bc-ink-faint)')}
        >
          <Pencil size={12} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Excluir ataque ${attack.name}`}
          title="Excluir ataque"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--bc-ink-faint)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            transition: 'color var(--bc-duration-fast) var(--bc-ease-out-quart)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FCA5A5')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bc-ink-faint)')}
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: attack.description ? 8 : 0, paddingRight: 56 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="bc-cinzel"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--bc-ink)',
              letterSpacing: '0.04em',
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {attack.name || 'Ataque sem nome'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRoll(attack.damageDice || '0', attack.name || 'Ataque')}
          aria-label={`Rolar dano: ${attack.damageDice}`}
          style={{
            background: 'rgba(138, 3, 3, 0.15)',
            border: '1px solid rgba(185, 28, 28, 0.4)',
            color: '#FCA5A5',
            cursor: 'pointer',
            fontFamily: 'var(--bc-font-display)',
            fontWeight: 600,
            fontSize: 13,
            padding: '5px 10px',
            borderRadius: 'var(--bc-radius-sm)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            flex: '0 0 auto',
            transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(185, 28, 28, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(138, 3, 3, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(185, 28, 28, 0.4)';
          }}
        >
          <Dice5 size={12} />
          {attack.damageDice || '—'}
        </button>
      </div>

      {attack.description && <MarkdownView source={attack.description} />}
    </article>
  );
}
