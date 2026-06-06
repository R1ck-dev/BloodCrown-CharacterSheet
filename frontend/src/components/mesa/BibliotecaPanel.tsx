/**
 * Aba "Biblioteca" da mesa: tokens pré-carregados (templates), organizados em pastas (um nível)
 * e agrupados por versões (um token base + suas variações, ex.: "ferido"). O usuário adiciona
 * moldes (nome + imagem, opcionalmente em pasta e/ou como versão de um base) e clica num molde
 * pra COLOCAR um token na mesa. Tudo persistido na mesa (backend).
 *
 * As opções de um molde (pasta / versão de / remover) abrem num modal temático — antes era um
 * dropdown absoluto que estourava a largura do card e quebrava o layout.
 */
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FolderPlus, MoreVertical, Plus, Trash2, X } from 'lucide-react';
import type { BibliotecaPasta, NovoTemplateInput, TokenTemplate } from '@/types/mesa';
import { Modal } from '@/components/sheet/modals/Modal';
import { Button } from '@/components/ui/Button';
import { PromptModal } from '@/components/ui/PromptModal';
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
  const [pastaModalAberta, setPastaModalAberta] = useState(false);
  // Id do template cujo modal de opções está aberto (null = fechado).
  const [opcoesId, setOpcoesId] = useState<string | null>(null);

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

  // Template do modal de opções (busca na biblioteca toda pra sobreviver a virar versão).
  const opcoesTemplate = opcoesId ? biblioteca.find((t) => t.id === opcoesId) ?? null : null;
  const opcoesTemVersoes = opcoesTemplate ? (versoesPorBase.get(opcoesTemplate.id)?.length ?? 0) > 0 : false;

  return (
    <aside className="bc-biblioteca-panel">
      <header className="bc-lib-header">
        <h2 className="bc-cinzel bc-tracked bc-lib-header__title">BIBLIOTECA</h2>
        <button type="button" className="bc-icon-btn" onClick={onClose} aria-label="Fechar biblioteca">
          <X size={16} />
        </button>
      </header>

      <div className="bc-lib-actions">
        <button
          type="button"
          className="bc-btn bc-btn--primary bc-btn--sm"
          style={{ flex: 1 }}
          onClick={() => setModalAberto(true)}
        >
          <Plus size={16} /> Token
        </button>
        <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={() => setPastaModalAberta(true)} title="Nova pasta">
          <FolderPlus size={16} /> Pasta
        </button>
      </div>

      <div className="bc-lib-scroll">
        {biblioteca.length === 0 && (
          <p className="bc-lib-empty">
            Vazia. Adicione tokens (nome + imagem) e clique pra colocar na mesa.
          </p>
        )}

        {grupos.map((g) => {
          // Não renderiza a Raiz vazia se há pastas; pastas vazias sempre aparecem (pra organizar).
          if (g.id === RAIZ && g.cards.length === 0 && pastas.length > 0) return null;
          return (
            <section key={g.id} className="bc-lib-group">
              <div className="bc-lib-group__head">
                <span className="bc-lib-group__title">{g.nome}</span>
                <span className="bc-lib-group__count">({g.cards.length})</span>
                <div style={{ flex: 1 }} />
                {g.removivel && (
                  <button
                    type="button"
                    className="bc-icon-btn bc-icon-btn--danger"
                    title="Excluir pasta (tokens voltam pra raiz)"
                    aria-label={`Excluir pasta ${g.nome}`}
                    onClick={() => onRemoverPasta(g.id)}
                    style={{ width: 24, height: 24 }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div className="bc-lib-grid">
                {g.cards.length === 0 && <p className="bc-lib-empty">(vazia)</p>}
                {g.cards.map((t) => (
                  <LibCard
                    key={t.id}
                    template={t}
                    versoes={versoesPorBase.get(t.id) ?? []}
                    onColocar={onColocar}
                    onRemover={onRemover}
                    onAbrirOpcoes={() => setOpcoesId(t.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <AddTokenModal
        isOpen={modalAberto}
        uploadHabilitado={uploadHabilitado}
        titulo="Adicionar à biblioteca"
        pastas={pastas}
        bases={bases}
        onClose={() => setModalAberto(false)}
        onConfirm={confirmarAdicao}
      />

      <PromptModal
        isOpen={pastaModalAberta}
        title="Nova pasta"
        label="Nome da pasta"
        placeholder="Ex.: Inimigos, NPCs, Chefes"
        confirmText="Criar pasta"
        onConfirm={(nome) => onAdicionarPasta(nome)}
        onClose={() => setPastaModalAberta(false)}
      />

      {/* Opções do molde — modal temático (substitui o dropdown que estourava o card) */}
      <Modal
        isOpen={opcoesId !== null}
        onClose={() => setOpcoesId(null)}
        title="Opções do token"
        maxWidth={380}
        footer={
          <Button variant="ghost" onClick={() => setOpcoesId(null)}>
            Fechar
          </Button>
        }
      >
        {opcoesTemplate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}
            >
              {opcoesTemplate.imagemUrl ? (
                <img
                  src={opcoesTemplate.imagemUrl}
                  alt={opcoesTemplate.nome ?? 'token'}
                  style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 'var(--bc-radius-sm)', border: '1px solid var(--bc-edge)' }}
                />
              ) : null}
              <span className="bc-cinzel" style={{ fontSize: 14, color: 'var(--bc-ink)' }}>
                {opcoesTemplate.nome ?? 'Token'}
              </span>
            </div>

            <div className="bc-field">
              <label className="bc-field__label" htmlFor="opt-pasta">
                Pasta
              </label>
              <select
                id="opt-pasta"
                className="bc-input"
                value={opcoesTemplate.pastaId ?? ''}
                onChange={(e) => onMoverParaPasta(opcoesTemplate.id, e.target.value || null)}
              >
                <option value="">Raiz da biblioteca</option>
                {pastas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome ?? 'Pasta'}
                  </option>
                ))}
              </select>
            </div>

            {!opcoesTemVersoes && (
              <div className="bc-field">
                <label className="bc-field__label" htmlFor="opt-base">
                  Versão de (token base)
                </label>
                <select
                  id="opt-base"
                  className="bc-input"
                  value={opcoesTemplate.baseId ?? ''}
                  onChange={(e) => onDefinirBase(opcoesTemplate.id, e.target.value || null)}
                >
                  <option value="">Nenhum — é um token base</option>
                  {bases
                    .filter((b) => b.id !== opcoesTemplate.id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nome ?? 'Token'}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <Button
              variant="danger"
              onClick={() => {
                onRemover(opcoesTemplate.id);
                setOpcoesId(null);
              }}
            >
              <Trash2 size={14} /> Remover da biblioteca
            </Button>
          </div>
        )}
      </Modal>
    </aside>
  );
}

interface CardProps {
  template: TokenTemplate;
  versoes: TokenTemplate[];
  onColocar: (t: TokenTemplate) => void;
  onRemover: (id: string) => void;
  onAbrirOpcoes: () => void;
}

function LibCard({ template, versoes, onColocar, onRemover, onAbrirOpcoes }: CardProps) {
  const temVersoes = versoes.length > 0;

  return (
    <div className="bc-lib-card">
      <button
        type="button"
        className="bc-lib-card__btn"
        onClick={() => onColocar(template)}
        title={`Colocar "${template.nome ?? 'token'}" na mesa`}
      >
        {template.imagemUrl ? (
          <img className="bc-lib-card__img" src={template.imagemUrl} alt={template.nome ?? 'token'} />
        ) : (
          <span className="bc-lib-card__noimg">sem imagem</span>
        )}
        <span className="bc-lib-card__name">
          {template.nome ?? 'Token'}
          {temVersoes && <span className="bc-lib-card__count"> +{versoes.length}</span>}
        </span>
      </button>

      {/* Faixa de versões: clica pra colocar aquela versão; × remove da biblioteca. */}
      {temVersoes && (
        <div className="bc-lib-versions">
          {versoes.map((v) => (
            <div key={v.id} className="bc-lib-ver">
              <button
                type="button"
                className="bc-lib-ver__btn"
                title={`Colocar versão "${v.nome ?? 'token'}"`}
                onClick={() => onColocar(v)}
              >
                {v.imagemUrl ? (
                  <img src={v.imagemUrl} alt={v.nome ?? 'versão'} />
                ) : (
                  <span style={{ fontSize: 9, color: 'var(--bc-ink-faint)' }}>?</span>
                )}
              </button>
              <button
                type="button"
                className="bc-lib-ver__remove"
                title="Remover versão"
                aria-label="Remover versão"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemover(v.id);
                }}
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="bc-lib-card__kebab" title="Opções" aria-label="Opções do token" onClick={onAbrirOpcoes}>
        <MoreVertical size={13} />
      </button>
    </div>
  );
}
