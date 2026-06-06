/**
 * Modal de criação de token: nome + imagem opcional (upload pro Cloudinary ou URL colada).
 * Sem imagem, o token vira um círculo colorido com a inicial. A URL é a fonte da verdade —
 * o botão "Upload" só preenche o campo com a secure_url do Cloudinary.
 *
 * Opcionalmente (quando `pastas`/`bases` são passados) permite escolher a pasta da biblioteca
 * e marcar o token como uma versão de um token base.
 */
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { uploadImagemCloudinary } from '@/lib/cloudinary';
import type { BibliotecaPasta, TokenTemplate } from '@/types/mesa';

interface Props {
  uploadHabilitado: boolean;
  titulo?: string;
  pastas?: BibliotecaPasta[];
  bases?: TokenTemplate[];
  pastaPadrao?: string | null;
  basePadrao?: string | null;
  onClose: () => void;
  onConfirm: (data: {
    nome: string;
    imagemUrl: string | null;
    baseId: string | null;
    pastaId: string | null;
  }) => void;
}

export function AddTokenModal({
  uploadHabilitado,
  titulo = 'Novo token',
  pastas,
  bases,
  pastaPadrao = null,
  basePadrao = null,
  onClose,
  onConfirm,
}: Props) {
  const [nome, setNome] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [pastaId, setPastaId] = useState<string>(pastaPadrao ?? '');
  const [baseId, setBaseId] = useState<string>(basePadrao ?? '');
  const [enviando, setEnviando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setEnviando(true);
    try {
      const url = await uploadImagemCloudinary(file);
      setImagemUrl(url);
      toast.success('Imagem enviada.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha no upload.');
    } finally {
      setEnviando(false);
    }
  };

  const confirmar = () => {
    onConfirm({
      nome: nome.trim(),
      imagemUrl: imagemUrl.trim() || null,
      baseId: baseId || null,
      pastaId: pastaId || null,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center', zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(92vw, 420px)',
          background: 'var(--bc-surface-2)',
          border: '1px solid var(--bc-edge)',
          borderRadius: 'var(--bc-radius-md)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ImageIcon size={18} color="var(--bc-gold)" aria-hidden="true" />
          <h2 className="bc-cinzel bc-tracked" style={{ margin: 0, fontSize: 18, color: 'var(--bc-ink)' }}>
            {titulo}
          </h2>
          <div style={{ flex: 1 }} />
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <label style={{ fontSize: 12, color: 'var(--bc-ink-dim)' }}>Nome</label>
        <input
          className="bc-input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Goblin, Aragorn"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && confirmar()}
        />

        <label style={{ fontSize: 12, color: 'var(--bc-ink-dim)' }}>Imagem (opcional)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="bc-input"
            style={{ flex: 1 }}
            value={imagemUrl}
            onChange={(e) => setImagemUrl(e.target.value)}
            placeholder="cole uma URL ou envie um arquivo"
          />
          {uploadHabilitado && (
            <button
              type="button"
              className="bc-btn bc-btn--ghost bc-btn--sm"
              onClick={() => fileRef.current?.click()}
              disabled={enviando}
            >
              <Upload size={16} /> {enviando ? 'Enviando...' : 'Upload'}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </div>

        {pastas && (
          <>
            <label style={{ fontSize: 12, color: 'var(--bc-ink-dim)' }}>Pasta</label>
            <select className="bc-input" value={pastaId} onChange={(e) => setPastaId(e.target.value)}>
              <option value="">Raiz da biblioteca</option>
              {pastas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome ?? 'Pasta'}
                </option>
              ))}
            </select>
          </>
        )}

        {bases && (
          <>
            <label style={{ fontSize: 12, color: 'var(--bc-ink-dim)' }}>Versão de (token base)</label>
            <select className="bc-input" value={baseId} onChange={(e) => setBaseId(e.target.value)}>
              <option value="">Nenhum — é um token base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome ?? 'Token'}
                </option>
              ))}
            </select>
          </>
        )}

        {imagemUrl && (
          <img
            src={imagemUrl}
            alt="prévia do token"
            style={{ width: 72, height: 72, borderRadius: 6, objectFit: 'contain', border: '1px solid var(--bc-edge)', alignSelf: 'center' }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="bc-btn bc-btn--primary bc-btn--sm" onClick={confirmar} disabled={enviando}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
