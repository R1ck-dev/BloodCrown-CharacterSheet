import { useRef } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Copy, Grid3x3, Link2, Plus, Upload, Wifi, WifiOff } from 'lucide-react';
import type { Mesa } from '@/types/mesa';

interface ToolbarProps {
  mesa: Mesa;
  conectado: boolean;
  onSair: () => void;
  onAddToken: (nome: string) => void;
  onSetMapaUrl: (url: string) => void;
  onUploadMapa: (file: File) => void;
  onToggleGrid: () => void;
}

export function MesaToolbar({
  mesa,
  conectado,
  onSair,
  onAddToken,
  onSetMapaUrl,
  onUploadMapa,
  onToggleGrid,
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

  const adicionar = () => {
    const nome = window.prompt('Nome do token (ex.: Goblin, Aragorn):', '');
    if (nome !== null) onAddToken(nome.trim());
  };

  const mapaPorUrl = () => {
    const url = window.prompt('URL da imagem do mapa (cole um link público):', mesa.mapaUrl ?? '');
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

      <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={adicionar}>
        <Plus size={16} /> Token
      </button>

      {mesa.souDono && (
        <>
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={onToggleGrid} title="Ligar/desligar grid">
            <Grid3x3 size={16} /> Grid
          </button>
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={mapaPorUrl}>
            <Link2 size={16} /> Mapa (URL)
          </button>
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Upload
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
        </>
      )}
    </header>
  );
}
