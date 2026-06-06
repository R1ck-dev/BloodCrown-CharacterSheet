import { useRef } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Copy,
  Grid3x3,
  Library,
  Link2,
  Lock,
  Ruler,
  Scaling,
  Tag,
  Trash2,
  Unlock,
  Upload,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { Mesa } from '@/types/mesa';

interface ToolbarProps {
  mesa: Mesa;
  conectado: boolean;
  onSair: () => void;
  bibliotecaAberta: boolean;
  onToggleBiblioteca: () => void;
  tokenSelecionado: boolean;
  /** nomeVisivel do token selecionado (null = nenhum selecionado). */
  tokenNomeVisivel: boolean | null;
  onApagarToken: () => void;
  onToggleNomeToken: () => void;
  /** Toggle global (preferência de quem olha) de mostrar/ocultar todos os nomes. */
  mostrarNomes: boolean;
  onToggleNomes: () => void;
  /** Modo régua de medição. */
  modoRegua: boolean;
  onToggleRegua: () => void;
  mapaUrlAtual: string | null;
  /** Mapa da cena travado como fundo. */
  cenaTravada: boolean;
  temMapa: boolean;
  onToggleTravaMapa: () => void;
  onSetMapaUrl: (url: string) => void;
  onUploadMapa: (file: File) => void;
  /** Mostra o botão Upload só quando o host de imagem (Cloudinary) está configurado. */
  uploadHabilitado: boolean;
  onToggleGrid: () => void;
  onConfigurarEscala: () => void;
}

export function MesaToolbar({
  mesa,
  conectado,
  onSair,
  bibliotecaAberta,
  onToggleBiblioteca,
  tokenSelecionado,
  tokenNomeVisivel,
  onApagarToken,
  onToggleNomeToken,
  mostrarNomes,
  onToggleNomes,
  modoRegua,
  onToggleRegua,
  mapaUrlAtual,
  cenaTravada,
  temMapa,
  onToggleTravaMapa,
  onSetMapaUrl,
  onUploadMapa,
  uploadHabilitado,
  onToggleGrid,
  onConfigurarEscala,
}: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(mesa.codigoConvite);
      toast.success(`Código "${mesa.codigoConvite}" copiado.`);
    } catch {
      toast.message(`Código: ${mesa.codigoConvite}`);
    }
  };

  const mapaPorUrl = () => {
    const url = window.prompt('URL da imagem do mapa (cole um link público):', mapaUrlAtual ?? '');
    if (url !== null) onSetMapaUrl(url.trim());
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadMapa(file);
    e.target.value = '';
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderBottom: '1px solid var(--bc-edge)',
        background: 'rgba(10, 5, 7, 0.85)',
        flexWrap: 'wrap',
      }}
    >
      <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={onSair}>
        <ArrowLeft size={16} /> Sair
      </button>

      <h1 className="bc-cinzel bc-tracked" style={{ fontSize: 18, color: 'var(--bc-ink)', margin: 0 }}>
        {mesa.nome}
      </h1>

      <button
        type="button"
        onClick={copiarCodigo}
        title="Copiar código de convite"
        className="bc-btn bc-btn--ghost bc-btn--sm"
        style={{ gap: 6 }}
      >
        <Copy size={14} /> {mesa.codigoConvite}
      </button>

      <span
        title={conectado ? 'Conectado em tempo real' : 'Reconectando...'}
        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: conectado ? '#86efac' : '#fca5a5' }}
      >
        {conectado ? <Wifi size={15} /> : <WifiOff size={15} />}
        {conectado ? 'ao vivo' : 'off'}
      </span>

      <div style={{ flex: 1 }} />

      {tokenSelecionado && (
        <>
          <button
            type="button"
            className={`bc-btn bc-btn--sm ${tokenNomeVisivel ? 'bc-btn--primary' : 'bc-btn--ghost'}`}
            onClick={onToggleNomeToken}
            title="Mostrar/esconder o nome deste token"
          >
            <Tag size={16} /> Nome
          </button>
          <button
            type="button"
            className="bc-btn bc-btn--danger bc-btn--sm"
            onClick={onApagarToken}
            title="Apagar token selecionado (Delete)"
          >
            <Trash2 size={16} /> Apagar
          </button>
        </>
      )}

      <button
        type="button"
        className={`bc-btn bc-btn--sm ${modoRegua ? 'bc-btn--primary' : 'bc-btn--ghost'}`}
        onClick={onToggleRegua}
        title="Régua de medição (clicar e arrastar no mapa)"
      >
        <Ruler size={16} /> Régua
      </button>

      <button
        type="button"
        className={`bc-btn bc-btn--sm ${mostrarNomes ? 'bc-btn--primary' : 'bc-btn--ghost'}`}
        onClick={onToggleNomes}
        title="Mostrar/ocultar todos os nomes"
      >
        <Tag size={16} /> Nomes
      </button>

      <button
        type="button"
        className={`bc-btn bc-btn--sm ${bibliotecaAberta ? 'bc-btn--primary' : 'bc-btn--ghost'}`}
        onClick={onToggleBiblioteca}
      >
        <Library size={16} /> Biblioteca
      </button>

      {mesa.souDono && (
        <>
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={onToggleGrid} title="Ligar/desligar grid">
            <Grid3x3 size={16} /> Grid
          </button>
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={onConfigurarEscala} title="Tamanho da célula e escala de medição">
            <Scaling size={16} /> Escala
          </button>
          {temMapa && (
            <button
              type="button"
              className={`bc-btn bc-btn--sm ${cenaTravada ? 'bc-btn--ghost' : 'bc-btn--primary'}`}
              onClick={onToggleTravaMapa}
              title={cenaTravada ? 'Mapa travado como fundo — clique pra destravar e mover/redimensionar' : 'Mapa livre — clique pra travar como fundo'}
            >
              {cenaTravada ? <Lock size={16} /> : <Unlock size={16} />} Mapa
            </button>
          )}
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={mapaPorUrl}>
            <Link2 size={16} /> Mapa (URL)
          </button>
          {uploadHabilitado && (
            <>
              <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={() => fileRef.current?.click()}>
                <Upload size={16} /> Upload
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
            </>
          )}
        </>
      )}
    </header>
  );
}
