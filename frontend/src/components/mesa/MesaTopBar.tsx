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
import { ArrowLeft, Copy, Library, Ruler, Tag, Wand2 } from 'lucide-react';
import type { Mesa } from '@/types/mesa';

interface Props {
  mesa: Mesa;
  conectado: boolean;
  onSair: () => void;
  modoRegua: boolean;
  onToggleRegua: () => void;
  mostrarNomes: boolean;
  onToggleNomes: () => void;
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

      <h1 className="bc-mesa-topbar__title">{mesa.nome}</h1>

      <button type="button" className="bc-mesa-code" onClick={copiarCodigo} title="Copiar código de convite">
        <span className="bc-mesa-code__label">código</span>
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
          active={bibliotecaAberta}
          onClick={onToggleBiblioteca}
          icon={<Library size={16} />}
          label="Biblioteca"
          title="Abrir a biblioteca de tokens"
        />

        {mesa.souDono && (
          <>
            <span className="bc-vsep" aria-hidden="true" />
            <ToolBtn
              active={mestreAberto}
              onClick={onToggleMestre}
              icon={<Wand2 size={16} />}
              label="Mestre"
              title="Ferramentas do mestre (mapa, grid, escala)"
            />
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
