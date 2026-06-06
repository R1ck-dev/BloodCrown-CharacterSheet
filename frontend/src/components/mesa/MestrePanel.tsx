/**
 * MestrePanel — painel recolhível (overlay no canto do tabuleiro) com as ferramentas
 * do mestre: mapa (URL/upload/travar) e grid+escala. Só renderiza pro dono e quando
 * há cena ativa. Os diálogos (URL do mapa, grid/escala) são modais temáticos próprios.
 */
import { useRef, useState } from 'react';
import {
  Grid3x3,
  Image as ImageIcon,
  Link2,
  Lock,
  Scaling,
  Unlock,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import type { Cena, ConfigurarGridInput } from '@/types/mesa';
import { PromptModal } from '@/components/ui/PromptModal';
import { GridEscalaModal } from './GridEscalaModal';

interface Props {
  cena: Cena;
  uploadHabilitado: boolean;
  onClose: () => void;
  onSetMapaUrl: (url: string) => void;
  onUploadMapa: (file: File) => void;
  onToggleTravaMapa: () => void;
  /** Toggle rápido do grid (sem toast — evita ruído a cada clique). */
  onConfigurarGrid: (payload: ConfigurarGridInput) => void;
  /** Salvar pelo modal Grid e escala (com toast de sucesso). */
  onSalvarGridEscala: (payload: ConfigurarGridInput) => void;
}

export function MestrePanel({
  cena,
  uploadHabilitado,
  onClose,
  onSetMapaUrl,
  onUploadMapa,
  onToggleTravaMapa,
  onConfigurarGrid,
  onSalvarGridEscala,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mapaUrlAberto, setMapaUrlAberto] = useState(false);
  const [gridEscalaAberto, setGridEscalaAberto] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadMapa(file);
    e.target.value = '';
  };

  const toggleGrid = () =>
    onConfigurarGrid({
      tamanhoCelula: cena.grid.tamanhoCelula,
      visivel: !cena.grid.visivel,
      cor: cena.grid.cor,
      escalaValor: cena.escalaValor,
      escalaUnidade: cena.escalaUnidade ?? 'm',
    });

  return (
    <aside className="bc-mestre-panel" aria-label="Ferramentas do mestre">
      <header className="bc-mestre-panel__header">
        <Wand2 size={15} color="var(--bc-gold)" aria-hidden="true" />
        <h2 className="bc-mestre-panel__title">Mestre</h2>
        <button type="button" className="bc-icon-btn" onClick={onClose} aria-label="Fechar painel do mestre">
          <X size={15} />
        </button>
      </header>

      <div className="bc-mestre-panel__body">
        {/* ----- Mapa ----- */}
        <section className="bc-mestre-section">
          <span className="bc-mestre-section__title">
            <ImageIcon size={12} /> Mapa
          </span>

          {cena.mapaUrl ? (
            <img className="bc-mestre-map-preview" src={cena.mapaUrl} alt="prévia do mapa da cena" />
          ) : (
            <p className="bc-mestre-empty">Sem mapa nesta cena.</p>
          )}

          <div className="bc-mestre-actions">
            <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={() => setMapaUrlAberto(true)}>
              <Link2 size={15} /> URL
            </button>
            {uploadHabilitado && (
              <>
                <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={() => fileRef.current?.click()}>
                  <Upload size={15} /> Upload
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
              </>
            )}
          </div>

          {cena.mapaUrl && (
            <button
              type="button"
              className={`bc-btn bc-btn--sm bc-btn--block ${cena.mapaTravado ? 'bc-btn--ghost' : 'bc-btn--primary'}`}
              onClick={onToggleTravaMapa}
              title={
                cena.mapaTravado
                  ? 'Mapa travado como fundo — clique pra destravar e mover/redimensionar'
                  : 'Mapa livre — clique pra travar como fundo'
              }
            >
              {cena.mapaTravado ? <Lock size={15} /> : <Unlock size={15} />}
              {cena.mapaTravado ? 'Mapa travado' : 'Mapa livre — travar'}
            </button>
          )}
        </section>

        {/* ----- Grid & Escala ----- */}
        <section className="bc-mestre-section">
          <span className="bc-mestre-section__title">
            <Grid3x3 size={12} /> Grid & Escala
          </span>

          <label className="bc-switch-wrap">
            <input
              type="checkbox"
              className="bc-switch-wrap__input"
              checked={cena.grid.visivel}
              onChange={toggleGrid}
            />
            <span className="bc-switch" aria-hidden="true" />
            <span className="bc-switch-wrap__label">Grid visível</span>
          </label>

          <p className="bc-mestre-empty" style={{ fontStyle: 'normal', color: 'var(--bc-ink-dim)' }}>
            1 célula = {cena.escalaValor} {cena.escalaUnidade ?? 'm'} · {cena.grid.tamanhoCelula}px
          </p>

          <button
            type="button"
            className="bc-btn bc-btn--ghost bc-btn--sm bc-btn--block"
            onClick={() => setGridEscalaAberto(true)}
          >
            <Scaling size={15} /> Configurar grid e escala
          </button>
        </section>
      </div>

      <PromptModal
        isOpen={mapaUrlAberto}
        title="Mapa por URL"
        label="URL da imagem do mapa"
        placeholder="cole um link público (https://...)"
        initialValue={cena.mapaUrl ?? ''}
        confirmText="Definir mapa"
        hint="Deixe vazio pra remover o mapa da cena."
        allowEmpty
        onConfirm={onSetMapaUrl}
        onClose={() => setMapaUrlAberto(false)}
      />

      <GridEscalaModal
        isOpen={gridEscalaAberto}
        cena={cena}
        onClose={() => setGridEscalaAberto(false)}
        onSubmit={onSalvarGridEscala}
      />
    </aside>
  );
}
