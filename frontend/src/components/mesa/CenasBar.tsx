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
 * Criar/renomear/excluir abrem modais temáticos (geridos pela MesaPage).
 */
export function CenasBar({ cenas, cenaAtivaId, onAtivar, onAdicionar, onRenomear, onRemover }: CenasBarProps) {
  const ordenadas = [...cenas].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="bc-cena-bar">
      <span className="bc-cena-bar__label">Cenas</span>

      {ordenadas.map((c) => {
        const ativa = c.id === cenaAtivaId;
        return (
          <div key={c.id} className={`bc-cena${ativa ? ' bc-cena--ativa' : ''}`}>
            <button
              type="button"
              className="bc-cena__btn"
              onClick={() => onAtivar(c.id)}
              onDoubleClick={() => onRenomear(c.id)}
              title={ativa ? 'Cena ativa (2 cliques renomeia)' : 'Ativar cena'}
            >
              {c.nome ?? 'Cena'}
            </button>
            {ativa && (
              <>
                <button
                  type="button"
                  className="bc-cena__action"
                  onClick={() => onRenomear(c.id)}
                  title="Renomear cena"
                  aria-label="Renomear cena"
                >
                  <Pencil size={13} />
                </button>
                {cenas.length > 1 && (
                  <button
                    type="button"
                    className="bc-cena__action bc-cena__action--danger"
                    onClick={() => onRemover(c.id)}
                    title="Excluir cena"
                    aria-label="Excluir cena"
                  >
                    <X size={13} />
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}

      <button type="button" className="bc-tool-btn" onClick={onAdicionar} title="Nova cena" aria-label="Nova cena" style={{ marginLeft: 2 }}>
        <Plus size={14} />
        <span className="bc-tool-btn__label">Cena</span>
      </button>
    </div>
  );
}
