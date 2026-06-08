/**
 * MesaTopBar — barra superior enxuta da mesa (layout híbrido).
 * Esquerda: voltar, nome da mesa, código copiável, status de conexão ao vivo.
 * Direita: toggles frequentes pra todos (Régua, Nomes, Biblioteca) + botão Mestre
 * (só dono) que abre o painel de ferramentas de mapa/grid/escala.
 *
 * Ações de token NÃO ficam aqui — vivem no popover ancorado no token (Board).
 */
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Copy, Crown, Heart, Library, Map, Ruler, Tag } from 'lucide-react';
import type { Mesa } from '@/types/mesa';
import { Medallion } from '@/components/ornaments/Medallion';

interface Props {
  mesa: Mesa;
  conectado: boolean;
  onSair: () => void;
  modoRegua: boolean;
  onToggleRegua: () => void;
  mostrarNomes: boolean;
  onToggleNomes: () => void;
  mostrarStatus: boolean;
  onToggleStatus: () => void;
  bibliotecaAberta: boolean;
  onToggleBiblioteca: () => void;
  mestreAberto: boolean;
  onToggleMestre: () => void;
}

export function MesaTopBar({
  mesa,
  conectado,
  onSair,
  modoRegua,
  onToggleRegua,
  mostrarNomes,
  onToggleNomes,
  mostrarStatus,
  onToggleStatus,
  bibliotecaAberta,
  onToggleBiblioteca,
  mestreAberto,
  onToggleMestre,
}: Props) {
  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(mesa.codigoConvite);
      toast.success(`Código "${mesa.codigoConvite}" copiado.`);
    } catch {
      toast.message(`Código: ${mesa.codigoConvite}`);
    }
  };

  return (
    <header className="bc-mesa-topbar">
      <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={onSair}>
        <ArrowLeft size={16} /> Sair
      </button>

      <div className="bc-mesa-topbar__crest">
        <Medallion shape="square" size={32} icon={<Map size={16} />} />
        <h1 className="bc-mesa-topbar__title">{mesa.nome}</h1>
      </div>

      <button type="button" className="bc-mesa-code" onClick={copiarCodigo} title="Copiar código de convite">
        <span className="bc-mesa-code__label">CÓDIGO</span>
        {mesa.codigoConvite}
        <Copy size={13} />
      </button>

      <span
        className={`bc-mesa-conn ${conectado ? 'bc-mesa-conn--on' : 'bc-mesa-conn--off'}`}
        role="status"
        aria-live="polite"
        aria-label={conectado ? 'Conexão em tempo real: ao vivo' : 'Conexão em tempo real: reconectando'}
        title={conectado ? 'Conectado em tempo real' : 'Reconectando...'}
      >
        <span className="bc-mesa-conn__dot" aria-hidden="true" />
        {conectado ? 'ao vivo' : 'reconectando'}
      </span>

      <div className="bc-mesa-spacer" />

      <div className="bc-mesa-toggles">
        <ToolBtn
          active={modoRegua}
          onClick={onToggleRegua}
          icon={<Ruler size={16} />}
          label="Régua"
          title="Régua de medição (clicar e arrastar no mapa)"
        />
        <ToolBtn
          active={mostrarNomes}
          onClick={onToggleNomes}
          icon={<Tag size={16} />}
          label="Nomes"
          title="Mostrar/ocultar todos os nomes"
        />
        <ToolBtn
          active={mostrarStatus}
          onClick={onToggleStatus}
          icon={<Heart size={16} />}
          label="Status"
          title="Mostrar/ocultar as barras de status"
        />
        <ToolBtn
          active={bibliotecaAberta}
          onClick={onToggleBiblioteca}
          icon={<Library size={16} />}
          label="Biblioteca"
          title="Abrir a biblioteca de tokens"
        />

        {mesa.souDono && (
          <>
            <span className="bc-vsep" aria-hidden="true" />
            <button
              type="button"
              className={`bc-btn bc-btn--sm ${mestreAberto ? 'bc-btn--gold' : 'bc-btn--ghost'}`}
              onClick={onToggleMestre}
              title="Ferramentas do mestre (mapa, grid, escala)"
              aria-pressed={mestreAberto}
            >
              <Crown size={15} />
              <span className="bc-tool-btn__label">Mestre</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function ToolBtn({
  active,
  onClick,
  icon,
  label,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      className={`bc-tool-btn${active ? ' bc-tool-btn--active' : ''}`}
      onClick={onClick}
      title={title}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
      <span className="bc-tool-btn__label">{label}</span>
    </button>
  );
}
