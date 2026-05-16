/**
 * Card de item do inventario. Toggle equipar/desequipar + delete +
 * mostra efeito magico (se houver) com label do target.
 */
import { Trash2, Sparkles, Package, PackageCheck, Pencil } from 'lucide-react';
import type { InventoryItem } from '@/types/character';
import { TARGET_LABELS } from '@/lib/buffTargets';
import { MarkdownView } from '@/components/ui/MarkdownView';

interface Props {
  item: InventoryItem;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  busy?: boolean;
}

export function ItemCard({ item, onToggle, onDelete, onEdit, busy = false }: Props) {
  const stripe = item.isEquipped ? 'var(--bc-gold)' : 'var(--bc-edge)';
  const hasEffect = item.targetAttribute && item.targetAttribute !== 'none';
  const targetLabel = hasEffect ? TARGET_LABELS[item.targetAttribute] || item.targetAttribute : null;

  return (
    <article
      style={{
        background: item.isEquipped ? 'rgba(212, 175, 55, 0.05)' : 'rgba(26, 24, 32, 0.5)',
        border: '1px solid var(--bc-edge)',
        borderLeft: `3px solid ${stripe}`,
        borderRadius: 'var(--bc-radius-sm)',
        padding: '12px 14px',
        marginBottom: 10,
        position: 'relative',
        transition: 'all var(--bc-duration-base) var(--bc-ease-out-quart)',
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
          aria-label={`Editar ${item.name}`}
          title="Editar item"
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
          aria-label={`Excluir ${item.name}`}
          title="Excluir item"
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

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: item.description ? 8 : 0, paddingRight: 56 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="bc-cinzel"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--bc-ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name || 'Sem nome'}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          aria-label={item.isEquipped ? 'Desequipar' : 'Equipar'}
          title={item.isEquipped ? 'Clique para desequipar' : 'Clique para equipar'}
          style={{
            background: item.isEquipped ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
            border: `1px solid ${item.isEquipped ? 'var(--bc-edge-strong)' : 'var(--bc-edge)'}`,
            color: item.isEquipped ? 'var(--bc-gold-bright)' : 'var(--bc-ink-dim)',
            cursor: busy ? 'wait' : 'pointer',
            padding: '4px 8px',
            borderRadius: 'var(--bc-radius-sm)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            fontFamily: 'var(--bc-font-display)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            flex: '0 0 auto',
          }}
        >
          {item.isEquipped ? <PackageCheck size={11} /> : <Package size={11} />}
          {item.isEquipped ? 'Equipado' : 'Guardado'}
        </button>
      </div>

      {item.description && (
        <div style={{ marginBottom: 8 }}>
          <MarkdownView source={item.description} />
        </div>
      )}

      {hasEffect && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            padding: '3px 8px',
            borderRadius: 'var(--bc-radius-sm)',
            color: 'var(--bc-gold-bright)',
            fontSize: 10,
          }}
        >
          <Sparkles size={10} />
          {item.targetAttribute.startsWith('REDUCE')
            ? targetLabel
            : `${item.effectValue >= 0 ? '+' : ''}${item.effectValue} ${targetLabel}`}
        </div>
      )}
    </article>
  );
}
