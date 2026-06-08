/**
 * Card de uma mesa no Dashboard (aba Mesas). Faixa-brasão (medalhão sobre radial
 * roxo) + corpo com nome em Cinzel, chip de papel (Mestre/Jogador) e código
 * copiável. Clique no card abre a mesa; lixeira (só dono) exclui.
 */
import { toast } from 'sonner';
import { Copy, Crown, Map, Trash2, User } from 'lucide-react';
import type { MesaResumo } from '@/types/mesa';
import { Medallion } from '@/components/ornaments/Medallion';

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

  const papelChip = mesa.souDono ? (
    <span className="bc-chip bc-chip--mestre">
      <Crown size={11} /> Mestre
    </span>
  ) : (
    <span className="bc-chip bc-chip--jogador">
      <User size={11} /> Jogador
    </span>
  );

  return (
    <article
      className="bc-frame bc-mesa-card"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-stop-card]')) return;
        onOpen();
      }}
    >
      {/* Faixa-brasão: medalhão sobre radial roxo + placeholder listrado.
          (O chip de papel vive no corpo, ao lado do nome — sem duplicar aqui.) */}
      <div className="bc-mesa-card__cover">
        <span className="bc-img-ph bc-mesa-card__cover-ph" aria-hidden="true" />
        <Medallion shape="round" size={52} icon={<Map size={26} />} />
      </div>

      <div className="bc-mesa-card__body">
        <div className="bc-mesa-card__head">
          <span className="bc-mesa-card__name">{mesa.nome}</span>
          {papelChip}
        </div>

        <div className="bc-mesa-card__foot">
          <button
            type="button"
            data-stop-card
            className="bc-mesa-card__code"
            title="Copiar código de convite"
            onClick={copiarCodigo}
          >
            <span className="bc-mesa-card__code-label">CÓDIGO</span>
            {mesa.codigoConvite}
            <Copy size={13} />
          </button>

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
        </div>
      </div>
    </article>
  );
}
