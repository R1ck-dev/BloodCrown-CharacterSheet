/**
 * Modal de criação de token: nome + imagem opcional (upload pro Cloudinary ou URL colada).
 * Sem imagem, o token vira um círculo colorido com a inicial. A URL é a fonte da verdade —
 * o botão "Upload" só preenche o campo com a secure_url do Cloudinary.
 *
 * Opcionalmente (quando `pastas`/`bases` são passados) permite escolher a pasta da biblioteca
 * e marcar o token como uma versão de um token base. Usa o Modal base (HeraldicFrame).
 */
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { Modal } from '@/components/sheet/modals/Modal';
import { Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadImagemCloudinary } from '@/lib/cloudinary';
import type { BibliotecaPasta, TokenTemplate } from '@/types/mesa';

interface Props {
  isOpen: boolean;
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
  isOpen,
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

  // Zera o formulário toda vez que abre.
  useEffect(() => {
    if (isOpen) {
      setNome('');
      setImagemUrl('');
      setPastaId(pastaPadrao ?? '');
      setBaseId(basePadrao ?? '');
      setEnviando(false);
    }
  }, [isOpen, pastaPadrao, basePadrao]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      maxWidth={460}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={enviando}>
            Adicionar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Goblin, Aragorn"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              confirmar();
            }
          }}
        />

        <div className="bc-field">
          <label className="bc-field__label" htmlFor="token-img">
            Imagem (opcional)
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="token-img"
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
        </div>

        {pastas && (
          <div className="bc-field">
            <label className="bc-field__label" htmlFor="token-pasta">
              Pasta
            </label>
            <select id="token-pasta" className="bc-input" value={pastaId} onChange={(e) => setPastaId(e.target.value)}>
              <option value="">Raiz da biblioteca</option>
              {pastas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome ?? 'Pasta'}
                </option>
              ))}
            </select>
          </div>
        )}

        {bases && (
          <div className="bc-field">
            <label className="bc-field__label" htmlFor="token-base">
              Versão de (token base)
            </label>
            <select id="token-base" className="bc-input" value={baseId} onChange={(e) => setBaseId(e.target.value)}>
              <option value="">Nenhum — é um token base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome ?? 'Token'}
                </option>
              ))}
            </select>
          </div>
        )}

        {imagemUrl && (
          <img
            src={imagemUrl}
            alt="prévia do token"
            style={{
              width: 72,
              height: 72,
              borderRadius: 6,
              objectFit: 'contain',
              border: '1px solid var(--bc-edge)',
              alignSelf: 'center',
            }}
          />
        )}
      </div>
    </Modal>
  );
}
