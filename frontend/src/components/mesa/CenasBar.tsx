import { Pencil, Plus, X } from 'lucide-react';
import type { Cena } from '@/types/mesa';

interface CenasBarProps {
  cenas: Cena[];
  cenaAtivaId: string | null;
  onAtivar: (cenaId: string) => void;
  onAdicionar: () => void;
  onRenomear: (cenaId: string) => void;
  onRemover: (cenaId: string) => void;
}

/**
 * Barra de cenas (só o mestre). Cada cena é uma aba: clicar troca a cena exibida pra todos.
 * Na aba ativa, ✎ renomeia e ✕ exclui (some quando há só uma cena). "+ Cena" cria uma nova.
 */
export function CenasBar({ cenas, cenaAtivaId, onAtivar, onAdicionar, onRenomear, onRemover }: CenasBarProps) {
  const ordenadas = [...cenas].sort((a, b) => a.ordem - b.ordem);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderBottom: '1px solid var(--bc-edge)',
        background: 'rgba(10, 5, 7, 0.7)',
        overflowX: 'auto',
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--bc-ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Cenas
      </span>
      {ordenadas.map((c) => {
        const ativa = c.id === cenaAtivaId;
        return (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
              border: ativa ? '1px solid var(--bc-gold)' : '1px solid var(--bc-edge)',
              background: ativa ? 'rgba(212,175,55,0.12)' : 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            <button
              type="button"
              onClick={() => onAtivar(c.id)}
              onDoubleClick={() => onRenomear(c.id)}
              title={ativa ? 'Cena ativa' : 'Ativar cena'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: ativa ? 'var(--bc-gold)' : 'var(--bc-ink-dim)',
                fontSize: 13,
                fontWeight: ativa ? 700 : 500,
                padding: 0,
              }}
            >
              {c.nome ?? 'Cena'}
            </button>
            {ativa && (
              <>
                <button
                  type="button"
                  onClick={() => onRenomear(c.id)}
                  title="Renomear cena"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bc-ink-faint)', padding: 0, display: 'flex' }}
                >
                  <Pencil size={13} />
                </button>
                {cenas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemover(c.id)}
                    title="Excluir cena"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: 0, display: 'flex' }}
                  >
                    <X size={13} />
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
      <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={onAdicionar} style={{ gap: 4 }}>
        <Plus size={14} /> Cena
      </button>
    </div>
  );
}
