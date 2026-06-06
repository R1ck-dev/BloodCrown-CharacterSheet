/**
 * Aba "Biblioteca" da mesa: tokens pré-carregados (templates). O usuário adiciona moldes
 * (nome + imagem) e clica num molde pra COLOCAR um token na mesa (pode colocar vários).
 * Persistida na mesa (backend). Auto-contida quanto ao modal de adicionar.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';
import type { TokenTemplate } from '@/types/mesa';
import { AddTokenModal } from './AddTokenModal';

interface Props {
  biblioteca: TokenTemplate[];
  uploadHabilitado: boolean;
  onClose: () => void;
  onColocar: (template: TokenTemplate) => void;
  onAdicionar: (data: { nome: string; imagemUrl: string }) => void;
  onRemover: (templateId: string) => void;
}

export function BibliotecaPanel({
  biblioteca,
  uploadHabilitado,
  onClose,
  onColocar,
  onAdicionar,
  onRemover,
}: Props) {
  const [modalAberto, setModalAberto] = useState(false);

  const confirmarAdicao = ({ nome, imagemUrl }: { nome: string; imagemUrl: string | null }) => {
    if (!imagemUrl) {
      toast.error('Um token da biblioteca precisa de uma imagem.');
      return;
    }
    onAdicionar({ nome: nome || 'Token', imagemUrl });
  };

  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        borderLeft: '1px solid var(--bc-edge)',
        background: 'rgba(10, 5, 7, 0.92)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderBottom: '1px solid var(--bc-edge)' }}>
        <h2 className="bc-cinzel bc-tracked" style={{ margin: 0, fontSize: 15, color: 'var(--bc-ink)' }}>
          BIBLIOTECA
        </h2>
        <div style={{ flex: 1 }} />
        <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={onClose} aria-label="Fechar biblioteca">
          <X size={16} />
        </button>
      </header>

      <div style={{ padding: 12 }}>
        <button
          type="button"
          className="bc-btn bc-btn--primary bc-btn--sm"
          style={{ width: '100%' }}
          onClick={() => setModalAberto(true)}
        >
          <Plus size={16} /> Adicionar token
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start' }}>
        {biblioteca.length === 0 && (
          <p style={{ gridColumn: '1 / -1', color: 'var(--bc-ink-faint)', fontStyle: 'italic', fontSize: 13 }}>
            Vazia. Adicione tokens (nome + imagem) e clique pra colocar na mesa.
          </p>
        )}
        {biblioteca.map((t) => (
          <div
            key={t.id}
            onClick={() => onColocar(t)}
            title={`Colocar "${t.nome ?? 'token'}" na mesa`}
            style={{
              position: 'relative',
              cursor: 'pointer',
              border: '1px solid var(--bc-edge)',
              borderRadius: 6,
              background: '#14121A',
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {t.imagemUrl ? (
              <img src={t.imagemUrl} alt={t.nome ?? 'token'} style={{ width: '100%', height: 72, objectFit: 'contain' }} />
            ) : (
              <div style={{ height: 72, display: 'grid', placeItems: 'center', color: 'var(--bc-ink-faint)' }}>sem imagem</div>
            )}
            <span style={{ fontSize: 11, color: 'var(--bc-ink-dim)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
              {t.nome ?? 'Token'}
            </span>
            <button
              type="button"
              title="Remover da biblioteca"
              onClick={(e) => {
                e.stopPropagation();
                onRemover(t.id);
              }}
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: 4,
                color: '#fca5a5',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {modalAberto && (
        <AddTokenModal
          uploadHabilitado={uploadHabilitado}
          titulo="Adicionar à biblioteca"
          onClose={() => setModalAberto(false)}
          onConfirm={confirmarAdicao}
        />
      )}
    </aside>
  );
}
