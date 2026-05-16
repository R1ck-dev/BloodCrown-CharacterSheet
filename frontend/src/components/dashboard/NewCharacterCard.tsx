/**
 * Card "+ Forje uma nova lenda" — borda tracejada dourada, hover ilumina.
 * Acionado por click ou Enter/Space (acessivel via teclado).
 */
import { Plus } from 'lucide-react';

interface Props {
  onClick: () => void;
  loading?: boolean;
}

export function NewCharacterCard({ onClick, loading = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Criar novo personagem"
      style={{
        borderRadius: 'var(--bc-radius-md)',
        padding: 20,
        minHeight: 280,
        border: '1.5px dashed rgba(212, 175, 55, 0.3)',
        background: 'rgba(255, 255, 255, 0.005)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition:
          'border-color var(--bc-duration-base) var(--bc-ease-out-quart), background var(--bc-duration-base) var(--bc-ease-out-quart), transform var(--bc-duration-fast) var(--bc-ease-out-quart)',
        color: 'var(--bc-gold-dim)',
        font: 'inherit',
        opacity: loading ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (loading) return;
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.7)';
        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.04)';
      }}
      onMouseLeave={(e) => {
        if (loading) return;
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.005)';
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bc-gold)',
          boxShadow: 'inset 0 0 12px rgba(212, 175, 55, 0.1)',
        }}
      >
        <Plus size={24} strokeWidth={1.4} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div
          className="bc-cinzel bc-tracked"
          style={{
            fontSize: 12,
            color: 'var(--bc-gold-bright)',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {loading ? 'Forjando...' : 'Novo Personagem'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--bc-ink-dim)', fontStyle: 'italic' }}>
          Forje uma nova lenda
        </div>
      </div>
    </button>
  );
}
