/**
 * Card de uma mesa no Dashboard (aba Mesas). Mesma linguagem do CharacterCard:
 * moldura .bc-frame, brasão + nome em Cinzel, chip de papel (Mestre/Jogador) e
 * código copiável. Clique no card abre a mesa; lixeira (só dono) exclui.
 */
import { toast } from 'sonner';
import { Copy, Crown, Map, Trash2 } from 'lucide-react';
import type { MesaResumo } from '@/types/mesa';

interface Props {
  mesa: MesaResumo;
  onOpen: () => void;
  onDelete: () => void;
}

export function MesaCard({ mesa, onOpen, onDelete }: Props) {
  const copiarCodigo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(mesa.codigoConvite);
      toast.success(`Código "${mesa.codigoConvite}" copiado.`);
    } catch {
      toast.message(`Código: ${mesa.codigoConvite}`);
    }
  };

  return (
    <article
      className="bc-frame bc-mesa-card"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-stop-card]')) return;
        onOpen();
      }}
    >
      {mesa.souDono && (
        <div className="bc-mesa-card__actions" data-stop-card>
          <button
            type="button"
            data-stop-card
            className="bc-icon-btn bc-icon-btn--danger"
            title="Excluir mesa"
            aria-label={`Excluir mesa ${mesa.nome}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="bc-mesa-card__top">
        <div className="bc-mesa-card__crest" aria-hidden="true">
          <Map size={22} />
        </div>
        <div className="bc-mesa-card__head">
          <span className="bc-mesa-card__name">{mesa.nome}</span>
          <span className={`bc-chip${mesa.souDono ? ' bc-chip--mestre' : ''}`}>
            {mesa.souDono ? (
              <>
                <Crown size={10} /> Mestre
              </>
            ) : (
              'Jogador'
            )}
          </span>
        </div>
      </div>

      <button
        type="button"
        data-stop-card
        className="bc-mesa-card__code"
        title="Copiar código de convite"
        onClick={copiarCodigo}
      >
        <span className="bc-mesa-card__code-label">código</span>
        {mesa.codigoConvite}
        <Copy size={13} />
      </button>
    </article>
  );
}
