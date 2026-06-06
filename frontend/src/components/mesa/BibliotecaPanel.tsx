/**
 * Aba "Biblioteca" da mesa: tokens pré-carregados (templates), organizados em pastas (um nível)
 * e agrupados por versões (um token base + suas variações, ex.: "ferido"). O usuário adiciona
 * moldes (nome + imagem, opcionalmente em pasta e/ou como versão de um base) e clica num molde
 * pra COLOCAR um token na mesa. Tudo persistido na mesa (backend).
 */
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FolderPlus, MoreVertical, Plus, Trash2, X } from 'lucide-react';
import type { BibliotecaPasta, NovoTemplateInput, TokenTemplate } from '@/types/mesa';
import { AddTokenModal } from './AddTokenModal';

interface Props {
  biblioteca: TokenTemplate[];
  pastas: BibliotecaPasta[];
  uploadHabilitado: boolean;
  onClose: () => void;
  onColocar: (template: TokenTemplate) => void;
  onAdicionar: (data: NovoTemplateInput) => void;
  onRemover: (templateId: string) => void;
  onAdicionarPasta: (nome: string) => void;
  onRemoverPasta: (pastaId: string) => void;
  onMoverParaPasta: (templateId: string, pastaId: string | null) => void;
  onDefinirBase: (templateId: string, baseId: string | null) => void;
}

const RAIZ = '__raiz__';

export function BibliotecaPanel({
  biblioteca,
  pastas,
  uploadHabilitado,
  onClose,
  onColocar,
  onAdicionar,
  onRemover,
  onAdicionarPasta,
  onRemoverPasta,
  onMoverParaPasta,
  onDefinirBase,
}: Props) {
  const [modalAberto, setModalAberto] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);

  // Templates base/avulsos (cards principais) e o mapa base -> versões.
  const { cards, versoesPorBase, bases } = useMemo(() => {
    const baseIds = new Set(biblioteca.filter((t) => !t.baseId).map((t) => t.id));
    const versoesPorBase = new Map<string, TokenTemplate[]>();
    const cards: TokenTemplate[] = [];
    for (const t of biblioteca) {
      if (t.baseId && baseIds.has(t.baseId)) {
        const arr = versoesPorBase.get(t.baseId) ?? [];
        arr.push(t);
        versoesPorBase.set(t.baseId, arr);
      } else {
        cards.push(t); // base, avulso ou versão órfã (base removido) — vira card próprio
      }
    }
    const bases = biblioteca.filter((t) => !t.baseId);
    return { cards, versoesPorBase, bases };
  }, [biblioteca]);

  const grupos = useMemo(
    () => [
      { id: RAIZ, nome: 'Raiz', removivel: false, cards: cards.filter((c) => !c.pastaId) },
      ...pastas.map((p) => ({
        id: p.id,
        nome: p.nome ?? 'Pasta',
        removivel: true,
        cards: cards.filter((c) => c.pastaId === p.id),
      })),
    ],
    [cards, pastas],
  );

  const confirmarAdicao = (data: {
    nome: string;
    imagemUrl: string | null;
    baseId: string | null;
    pastaId: string | null;
  }) => {
    if (!data.imagemUrl) {
      toast.error('Um token da biblioteca precisa de uma imagem.');
      return;
    }
    onAdicionar({ nome: data.nome || 'Token', imagemUrl: data.imagemUrl, baseId: data.baseId, pastaId: data.pastaId });
  };

  const novaPasta = () => {
    const nome = window.prompt('Nome da pasta:');
    if (nome && nome.trim()) onAdicionarPasta(nome.trim());
  };

  return (
    <aside
      style={{
        width: 280,
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

      <div style={{ padding: 12, display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="bc-btn bc-btn--primary bc-btn--sm"
          style={{ flex: 1 }}
          onClick={() => setModalAberto(true)}
        >
          <Plus size={16} /> Token
        </button>
        <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={novaPasta} title="Nova pasta">
          <FolderPlus size={16} /> Pasta
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {biblioteca.length === 0 && (
          <p style={{ color: 'var(--bc-ink-faint)', fontStyle: 'italic', fontSize: 13 }}>
            Vazia. Adicione tokens (nome + imagem) e clique pra colocar na mesa.
          </p>
        )}

        {grupos.map((g) => {
          // Não renderiza a Raiz vazia se há pastas; pastas vazias sempre aparecem (pra organizar).
          if (g.id === RAIZ && g.cards.length === 0 && pastas.length > 0) return null;
          return (
            <section key={g.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bc-ink-dim)' }}>
                  {g.nome}
                </span>
                <span style={{ fontSize: 11, color: 'var(--bc-ink-faint)' }}>({g.cards.length})</span>
                <div style={{ flex: 1 }} />
                {g.removivel && (
                  <button
                    type="button"
                    title="Excluir pasta (tokens voltam pra raiz)"
                    onClick={() => onRemoverPasta(g.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--bc-ink-faint)', cursor: 'pointer', padding: 2, display: 'flex' }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start' }}>
                {g.cards.length === 0 && (
                  <p style={{ gridColumn: '1 / -1', color: 'var(--bc-ink-faint)', fontStyle: 'italic', fontSize: 12 }}>
                    (vazia)
                  </p>
                )}
                {g.cards.map((t) => (
                  <CardTemplate
                    key={t.id}
                    template={t}
                    versoes={versoesPorBase.get(t.id) ?? []}
                    pastas={pastas}
                    bases={bases}
                    menuAberto={menuId === t.id}
                    onToggleMenu={() => setMenuId((cur) => (cur === t.id ? null : t.id))}
                    onColocar={onColocar}
                    onRemover={onRemover}
                    onMoverParaPasta={onMoverParaPasta}
                    onDefinirBase={onDefinirBase}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {modalAberto && (
        <AddTokenModal
          uploadHabilitado={uploadHabilitado}
          titulo="Adicionar à biblioteca"
          pastas={pastas}
          bases={bases}
          onClose={() => setModalAberto(false)}
          onConfirm={confirmarAdicao}
        />
      )}
    </aside>
  );
}

interface CardProps {
  template: TokenTemplate;
  versoes: TokenTemplate[];
  pastas: BibliotecaPasta[];
  bases: TokenTemplate[];
  menuAberto: boolean;
  onToggleMenu: () => void;
  onColocar: (t: TokenTemplate) => void;
  onRemover: (id: string) => void;
  onMoverParaPasta: (id: string, pastaId: string | null) => void;
  onDefinirBase: (id: string, baseId: string | null) => void;
}

function CardTemplate({
  template,
  versoes,
  pastas,
  bases,
  menuAberto,
  onToggleMenu,
  onColocar,
  onRemover,
  onMoverParaPasta,
  onDefinirBase,
}: CardProps) {
  const temVersoes = versoes.length > 0;
  // Só pode virar versão de outro se não for, ele mesmo, base de versões (mantém um nível).
  const basesPossiveis = bases.filter((b) => b.id !== template.id);

  return (
    <div
      style={{
        position: 'relative',
        border: '1px solid var(--bc-edge)',
        borderRadius: 6,
        background: '#14121A',
        padding: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        onClick={() => onColocar(template)}
        title={`Colocar "${template.nome ?? 'token'}" na mesa`}
        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
      >
        {template.imagemUrl ? (
          <img src={template.imagemUrl} alt={template.nome ?? 'token'} style={{ width: '100%', height: 64, objectFit: 'contain' }} />
        ) : (
          <div style={{ height: 64, display: 'grid', placeItems: 'center', color: 'var(--bc-ink-faint)' }}>sem imagem</div>
        )}
        <span style={{ fontSize: 11, color: 'var(--bc-ink-dim)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
          {template.nome ?? 'Token'}
          {temVersoes && <span style={{ color: 'var(--bc-gold)' }}> +{versoes.length}</span>}
        </span>
      </div>

      {/* Faixa de versões: clica pra colocar aquela versão; × remove da biblioteca. */}
      {temVersoes && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {versoes.map((v) => (
            <div key={v.id} style={{ position: 'relative', width: 30, height: 30 }}>
              <button
                type="button"
                title={`Colocar versão "${v.nome ?? 'token'}"`}
                onClick={() => onColocar(v)}
                style={{ width: '100%', height: '100%', padding: 0, border: '1px solid var(--bc-edge)', borderRadius: 4, background: '#0A0507', cursor: 'pointer', overflow: 'hidden' }}
              >
                {v.imagemUrl ? (
                  <img src={v.imagemUrl} alt={v.nome ?? 'versão'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: 9, color: 'var(--bc-ink-faint)' }}>?</span>
                )}
              </button>
              <button
                type="button"
                title="Remover versão"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemover(v.id);
                }}
                style={{ position: 'absolute', top: -5, right: -5, width: 15, height: 15, padding: 0, display: 'grid', placeItems: 'center', background: '#0A0507', border: '1px solid var(--bc-edge)', borderRadius: '50%', color: '#fca5a5', cursor: 'pointer', lineHeight: 1 }}
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        title="Opções"
        onClick={onToggleMenu}
        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 4, color: 'var(--bc-ink-dim)', cursor: 'pointer', padding: 2, display: 'flex' }}
      >
        <MoreVertical size={13} />
      </button>

      {menuAberto && (
        <div
          style={{
            position: 'absolute',
            top: 22,
            right: 2,
            zIndex: 5,
            width: 200,
            background: 'var(--bc-surface-2)',
            border: '1px solid var(--bc-edge)',
            borderRadius: 6,
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <label style={{ fontSize: 11, color: 'var(--bc-ink-dim)' }}>Pasta</label>
          <select
            className="bc-input"
            value={template.pastaId ?? ''}
            onChange={(e) => onMoverParaPasta(template.id, e.target.value || null)}
          >
            <option value="">Raiz</option>
            {pastas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome ?? 'Pasta'}
              </option>
            ))}
          </select>

          {!temVersoes && (
            <>
              <label style={{ fontSize: 11, color: 'var(--bc-ink-dim)' }}>Versão de</label>
              <select
                className="bc-input"
                value={template.baseId ?? ''}
                onChange={(e) => onDefinirBase(template.id, e.target.value || null)}
              >
                <option value="">— (é base)</option>
                {basesPossiveis.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nome ?? 'Token'}
                  </option>
                ))}
              </select>
            </>
          )}

          <button type="button" className="bc-btn bc-btn--danger bc-btn--sm" onClick={() => onRemover(template.id)}>
            <Trash2 size={14} /> Remover
          </button>
        </div>
      )}
    </div>
  );
}
