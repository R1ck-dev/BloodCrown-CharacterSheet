/**
 * Aba "Biblioteca" da mesa: acervo de imagens em três tipos (filtro no topo):
 *   - TOKEN     → clica pra colocar na mesa como token (com versões base/variação);
 *   - MAPA      → o mestre clica pra aplicar como mapa da cena ativa;
 *   - DOCUMENTO → clica pra colocar no tabuleiro como imagem (handout/lore).
 * Itens organizados em pastas (um nível, compartilhadas entre os tipos). Tudo persistido.
 * As opções de um item (pasta / versão de / remover) abrem num modal temático.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ChevronRight,
  FileText,
  Folder,
  FolderPlus,
  Library,
  Map as MapIcon,
  MoreVertical,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { BibliotecaPasta, NovoTemplateInput, TipoTemplate, TokenTemplate } from '@/types/mesa';
import { Medallion } from '@/components/ornaments/Medallion';
import { Modal } from '@/components/sheet/modals/Modal';
import { Button } from '@/components/ui/Button';
import { PromptModal } from '@/components/ui/PromptModal';
import { AddTokenModal } from './AddTokenModal';

interface Props {
  biblioteca: TokenTemplate[];
  pastas: BibliotecaPasta[];
  uploadHabilitado: boolean;
  souDono: boolean;
  onClose: () => void;
  /** TOKEN/DOCUMENTO: coloca no tabuleiro como imagem. */
  onColocar: (template: TokenTemplate) => void;
  /** MAPA: aplica como mapa da cena ativa (só dono). */
  onUsarMapa: (template: TokenTemplate) => void;
  onAdicionar: (data: NovoTemplateInput) => void;
  onRemover: (templateId: string) => void;
  onAdicionarPasta: (nome: string) => void;
  onRemoverPasta: (pastaId: string) => void;
  onMoverParaPasta: (templateId: string, pastaId: string | null) => void;
  onDefinirBase: (templateId: string, baseId: string | null) => void;
}

const RAIZ = '__raiz__';

const FILTROS: { tipo: TipoTemplate; label: string; icon: ReactNode }[] = [
  { tipo: 'TOKEN', label: 'Tokens', icon: <Users size={13} /> },
  { tipo: 'MAPA', label: 'Mapas', icon: <MapIcon size={13} /> },
  { tipo: 'DOCUMENTO', label: 'Docs', icon: <FileText size={13} /> },
];

const ROTULO: Record<TipoTemplate, string> = { TOKEN: 'Token', MAPA: 'Mapa', DOCUMENTO: 'Documento' };

/** Dica de uma linha sobre o que cada tipo faz ao clicar (prototype LIB_TIPS). */
const DICA: Record<TipoTemplate, string> = {
  TOKEN: 'Token → entra no tabuleiro como peça.',
  MAPA: 'Mapa → o mestre aplica como mapa da cena.',
  DOCUMENTO: 'Documento → entra no tabuleiro maior, para leitura.',
};

const VAZIO: Record<TipoTemplate, string> = {
  TOKEN: 'Sem tokens ainda. Adicione (nome + imagem) e clique pra colocar na mesa.',
  MAPA: 'Sem mapas ainda. Adicione imagens e clique pra aplicar como mapa da cena.',
  DOCUMENTO: 'Sem documentos ainda. Adicione imagens e clique pra colocar no tabuleiro.',
};

export function BibliotecaPanel({
  biblioteca,
  pastas,
  uploadHabilitado,
  souDono,
  onClose,
  onColocar,
  onUsarMapa,
  onAdicionar,
  onRemover,
  onAdicionarPasta,
  onRemoverPasta,
  onMoverParaPasta,
  onDefinirBase,
}: Props) {
  const [tipoAtivo, setTipoAtivo] = useState<TipoTemplate>('TOKEN');
  const [modalAberto, setModalAberto] = useState(false);
  const [pastaModalAberta, setPastaModalAberta] = useState(false);
  // Id do item cujo modal de opções está aberto (null = fechado).
  const [opcoesId, setOpcoesId] = useState<string | null>(null);
  // Grupos (pastas) recolhidos — chaveado por "tipo:idDoGrupo" pra ser por aba.
  const [recolhidos, setRecolhidos] = useState<Record<string, boolean>>({});

  const chaveGrupo = (id: string) => `${tipoAtivo}:${id}`;
  const estaRecolhido = (id: string) => !!recolhidos[chaveGrupo(id)];
  const alternarGrupo = (id: string) =>
    setRecolhidos((r) => ({ ...r, [chaveGrupo(id)]: !r[chaveGrupo(id)] }));

  // Contagem por tipo pros badges das pills do filtro.
  const contagens = useMemo<Record<TipoTemplate, number>>(
    () => ({
      TOKEN: biblioteca.filter((t) => (t.tipo ?? 'TOKEN') === 'TOKEN').length,
      MAPA: biblioteca.filter((t) => t.tipo === 'MAPA').length,
      DOCUMENTO: biblioteca.filter((t) => t.tipo === 'DOCUMENTO').length,
    }),
    [biblioteca],
  );

  // Só os itens do tipo ativo. cards/versões/bases/grupos operam sobre esse recorte.
  const itens = useMemo(
    () => biblioteca.filter((t) => (t.tipo ?? 'TOKEN') === tipoAtivo),
    [biblioteca, tipoAtivo],
  );

  // Itens base/avulsos (cards principais) e o mapa base -> versões (só faz sentido pra token).
  const { cards, versoesPorBase, bases } = useMemo(() => {
    const baseIds = new Set(itens.filter((t) => !t.baseId).map((t) => t.id));
    const versoesPorBase = new Map<string, TokenTemplate[]>();
    const cards: TokenTemplate[] = [];
    for (const t of itens) {
      if (t.baseId && baseIds.has(t.baseId)) {
        const arr = versoesPorBase.get(t.baseId) ?? [];
        arr.push(t);
        versoesPorBase.set(t.baseId, arr);
      } else {
        cards.push(t);
      }
    }
    const bases = itens.filter((t) => !t.baseId);
    return { cards, versoesPorBase, bases };
  }, [itens]);

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

  // Pastas que têm algum item (de qualquer tipo) — pra esconder, na aba atual, as pastas que
  // pertencem a outro tipo (evita o ruído de "(vazia)" cross-tab) sem sumir com pastas novas.
  const pastasComItens = useMemo(
    () => new Set(biblioteca.filter((t) => t.pastaId).map((t) => t.pastaId)),
    [biblioteca],
  );

  const rotulo = ROTULO[tipoAtivo];

  const confirmarAdicao = (data: {
    nome: string;
    imagemUrl: string | null;
    baseId: string | null;
    pastaId: string | null;
  }) => {
    if (!data.imagemUrl) {
      toast.error(`Um ${rotulo.toLowerCase()} da biblioteca precisa de uma imagem.`);
      return;
    }
    onAdicionar({
      nome: data.nome || rotulo,
      imagemUrl: data.imagemUrl,
      tipo: tipoAtivo,
      baseId: tipoAtivo === 'TOKEN' ? data.baseId : null,
      pastaId: data.pastaId,
    });
  };

  // Clique no card: roteia pela natureza do item.
  const handleSelecionar = (t: TokenTemplate) => {
    if ((t.tipo ?? 'TOKEN') === 'MAPA') {
      if (souDono) onUsarMapa(t);
      else toast.message('Apenas o mestre pode aplicar mapas à cena.');
    } else {
      onColocar(t); // TOKEN e DOCUMENTO entram no tabuleiro como imagem
    }
  };

  // Item do modal de opções (busca na biblioteca toda pra sobreviver a virar versão).
  const opcoesTemplate = opcoesId ? biblioteca.find((t) => t.id === opcoesId) ?? null : null;
  const opcoesTemVersoes = opcoesTemplate ? (versoesPorBase.get(opcoesTemplate.id)?.length ?? 0) > 0 : false;

  return (
    <aside className="bc-biblioteca-panel">
      <header className="bc-panel-header">
        <Medallion shape="square" size={30} icon={<Library size={16} />} />
        <h2 className="bc-panel-header__title">Biblioteca</h2>
        <button
          type="button"
          className="bc-icon-btn bc-panel-header__close"
          onClick={onClose}
          aria-label="Fechar biblioteca"
        >
          <X size={14} />
        </button>
      </header>
      <hr className="bc-hairline" />

      <div className="bc-lib-top">
        <div className="bc-lib-filter" role="tablist" aria-label="Tipo de item da biblioteca">
          {FILTROS.map((f) => (
            <button
              key={f.tipo}
              type="button"
              role="tab"
              aria-selected={tipoAtivo === f.tipo}
              title={f.label}
              className={`bc-lib-filter__btn${tipoAtivo === f.tipo ? ' bc-lib-filter__btn--active' : ''}`}
              onClick={() => {
                setTipoAtivo(f.tipo);
                setOpcoesId(null);
              }}
            >
              {f.icon}
              <span className="bc-lib-filter__label">{f.label}</span>
              <span className="bc-count-badge bc-lib-filter__count">{contagens[f.tipo]}</span>
            </button>
          ))}
        </div>

        <div className="bc-lib-actions">
          <button
            type="button"
            className="bc-btn bc-btn--primary bc-btn--sm"
            style={{ flex: 1 }}
            onClick={() => setModalAberto(true)}
          >
            <Plus size={16} /> {rotulo}
          </button>
          <button type="button" className="bc-btn bc-btn--ghost bc-btn--sm" onClick={() => setPastaModalAberta(true)} title="Nova pasta">
            <FolderPlus size={16} /> Pasta
          </button>
        </div>

        <p className="bc-lib-tip">
          <AlertTriangle size={12} aria-hidden="true" /> {DICA[tipoAtivo]}
        </p>
      </div>

      <div className="bc-lib-scroll">
        {itens.length === 0 ? (
          <p className="bc-lib-empty">{VAZIO[tipoAtivo]}</p>
        ) : (
          grupos.map((g) => {
            // Não renderiza a Raiz vazia se há pastas; pastas globalmente vazias aparecem (pra organizar).
            if (g.id === RAIZ && g.cards.length === 0 && pastas.length > 0) return null;
            // Pasta sem itens deste tipo, mas com itens de outro tipo: some nesta aba.
            if (g.id !== RAIZ && g.cards.length === 0 && pastasComItens.has(g.id)) return null;
            const recolhido = estaRecolhido(g.id);
            return (
              <section key={g.id} className={`bc-lib-group${recolhido ? ' bc-lib-group--collapsed' : ''}`}>
                <div className="bc-lib-group__head">
                  <button
                    type="button"
                    className="bc-lib-group__toggle"
                    aria-expanded={!recolhido}
                    title={recolhido ? 'Expandir pasta' : 'Recolher pasta'}
                    onClick={() => alternarGrupo(g.id)}
                  >
                    <ChevronRight size={13} className="bc-lib-group__chev" aria-hidden="true" />
                    <Folder size={14} className="bc-lib-group__folder" aria-hidden="true" />
                    <span className="bc-lib-group__title">{g.nome}</span>
                    <span className="bc-count-badge">{g.cards.length}</span>
                  </button>
                  {g.removivel && (
                    <button
                      type="button"
                      className="bc-icon-btn bc-icon-btn--danger"
                      title="Excluir pasta (itens voltam pra raiz)"
                      aria-label={`Excluir pasta ${g.nome}`}
                      onClick={() => onRemoverPasta(g.id)}
                      style={{ width: 22, height: 22 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {!recolhido && (
                  <div className="bc-lib-grid">
                    {g.cards.length === 0 && <p className="bc-lib-empty">(vazia)</p>}
                    {g.cards.map((t) => (
                      <LibCard
                        key={t.id}
                        template={t}
                        versoes={versoesPorBase.get(t.id) ?? []}
                        onSelecionar={handleSelecionar}
                        onRemover={onRemover}
                        onAbrirOpcoes={() => setOpcoesId(t.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      <AddTokenModal
        isOpen={modalAberto}
        uploadHabilitado={uploadHabilitado}
        titulo={`Adicionar ${rotulo.toLowerCase()}`}
        pastas={pastas}
        bases={tipoAtivo === 'TOKEN' ? bases : undefined}
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

      {/* Opções do item — modal temático */}
      <Modal
        isOpen={opcoesId !== null}
        onClose={() => setOpcoesId(null)}
        title="Opções do item"
        maxWidth={380}
        footer={
          <Button variant="ghost" onClick={() => setOpcoesId(null)}>
            Fechar
          </Button>
        }
      >
        {opcoesTemplate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
              {opcoesTemplate.imagemUrl ? (
                <img
                  src={opcoesTemplate.imagemUrl}
                  alt={opcoesTemplate.nome ?? 'item'}
                  style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 'var(--bc-radius-sm)', border: '1px solid var(--bc-edge)' }}
                />
              ) : null}
              <span className="bc-cinzel" style={{ fontSize: 14, color: 'var(--bc-ink)' }}>
                {opcoesTemplate.nome ?? 'Item'}
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

            {opcoesTemplate.tipo === 'TOKEN' && !opcoesTemVersoes && (
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
  onSelecionar: (t: TokenTemplate) => void;
  onRemover: (id: string) => void;
  onAbrirOpcoes: () => void;
}

function LibCard({ template, versoes, onSelecionar, onRemover, onAbrirOpcoes }: CardProps) {
  const temVersoes = versoes.length > 0;
  const nome = template.nome ?? 'item';
  const titulo =
    template.tipo === 'MAPA'
      ? `Aplicar "${nome}" como mapa da cena`
      : template.tipo === 'DOCUMENTO'
        ? `Adicionar "${nome}" no tabuleiro`
        : `Colocar "${nome}" na mesa`;

  return (
    <div className="bc-lib-card">
      <button type="button" className="bc-lib-card__btn" onClick={() => onSelecionar(template)} title={titulo}>
        {template.imagemUrl ? (
          <img className="bc-lib-card__img" src={template.imagemUrl} alt={template.nome ?? 'item'} />
        ) : (
          <span className="bc-img-ph bc-lib-card__noimg" aria-hidden="true">
            sem imagem
          </span>
        )}
        <span className="bc-lib-card__name">
          {template.nome ?? 'Item'}
          {temVersoes && <span className="bc-lib-card__count"> +{versoes.length}</span>}
        </span>
      </button>

      {/* Faixa de versões (só token): clica pra colocar aquela versão; × remove da biblioteca. */}
      {temVersoes && (
        <div className="bc-lib-versions">
          {versoes.map((v) => (
            <div key={v.id} className="bc-lib-ver">
              <button
                type="button"
                className="bc-lib-ver__btn"
                title={`Colocar versão "${v.nome ?? 'token'}"`}
                onClick={() => onSelecionar(v)}
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

      <button type="button" className="bc-lib-card__kebab" title="Opções" aria-label="Opções do item" onClick={onAbrirOpcoes}>
        <MoreVertical size={13} />
      </button>
    </div>
  );
}
