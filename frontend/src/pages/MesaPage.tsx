/**
 * Página da mesa tabletop. Carrega o estado via REST, mantém os tokens em estado local
 * sincronizado pelo canal STOMP (arraste ao vivo + régua) e persiste posição/tamanho. A mesa tem
 * várias cenas (cada uma com seu mapa/grid/escala); só os tokens da cena ativa aparecem. A
 * biblioteca de tokens é compartilhada. Mudanças estruturais chegam como "atualizada" → re-busca.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Board, type ReguaRemota, type RolagemNoToken } from '@/components/mesa/Board';
import { MesaTopBar } from '@/components/mesa/MesaTopBar';
import { MestrePanel } from '@/components/mesa/MestrePanel';
import { CenasBar } from '@/components/mesa/CenasBar';
import { BibliotecaPanel } from '@/components/mesa/BibliotecaPanel';
import { PromptModal } from '@/components/ui/PromptModal';
import {
  mesaKeys,
  useActivateCena,
  useAddCena,
  useAddPasta,
  useAddTemplate,
  useAddToken,
  useConfigurarGrid,
  useMesa,
  useMoveTemplateToPasta,
  useMoveTokenPersist,
  useRemoveCena,
  useRemovePasta,
  useRemoveTemplate,
  useRemoveToken,
  useRenameCena,
  useResizeToken,
  useSetMapa,
  useSetTemplateBase,
  useSetTokenNameVisible,
  useSetTokenStatusVisible,
  useSwitchTokenVersion,
  useTransformarMapa,
  useVincularFichaToken,
} from '@/api/mesas';
import { useMesaSocket } from '@/hooks/useMesaSocket';
import { tokenStorage } from '@/api/client';
import { cloudinaryConfigurado, uploadImagemCloudinary } from '@/lib/cloudinary';
import { confirmDanger } from '@/lib/swal';
import type { ConfigurarGridInput, MesaEvento, NovoTemplateInput, Token, TokenTemplate } from '@/types/mesa';

function Centro({ texto }: { texto: string }) {
  return (
    <main className="bc-page bc-grain" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <p style={{ color: 'var(--bc-ink-dim)', fontFamily: 'var(--bc-font-display)', letterSpacing: '0.12em' }}>
        {texto}
      </p>
    </main>
  );
}

type ReguaRemotaCena = ReguaRemota & { cenaId: string | null; ts: number };
type RolagemCard = { source: string; total: number; critico: boolean; nome: string | null; ts: number };

/** Tempo (ms) que o card de rolagem fica visível acima do token. */
const ROLL_TTL = 6000;

export function MesaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: mesa, isLoading, isError, error } = useMesa(id);

  const addToken = useAddToken(id ?? '');
  const removeToken = useRemoveToken(id ?? '');
  const resizeToken = useResizeToken(id ?? '');
  const setNomeVisivel = useSetTokenNameVisible(id ?? '');
  const setStatusVisivel = useSetTokenStatusVisible(id ?? '');
  const vincularFicha = useVincularFichaToken(id ?? '');
  const addTemplate = useAddTemplate(id ?? '');
  const removeTemplate = useRemoveTemplate(id ?? '');
  const addPasta = useAddPasta(id ?? '');
  const removePasta = useRemovePasta(id ?? '');
  const moverParaPasta = useMoveTemplateToPasta(id ?? '');
  const definirBase = useSetTemplateBase(id ?? '');
  const switchVersao = useSwitchTokenVersion(id ?? '');
  const setMapa = useSetMapa(id ?? '');
  const configurarGrid = useConfigurarGrid(id ?? '');
  const transformarMapa = useTransformarMapa(id ?? '');
  const addCena = useAddCena(id ?? '');
  const removeCena = useRemoveCena(id ?? '');
  const renameCena = useRenameCena(id ?? '');
  const activateCena = useActivateCena(id ?? '');
  const moverPersist = useMoveTokenPersist(id ?? '');

  // Tokens vivos: semeados do servidor, atualizados por arraste/resize local/remoto.
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [bibliotecaAberta, setBibliotecaAberta] = useState(false);
  const [mostrarNomes, setMostrarNomes] = useState(true);
  const [mostrarStatus, setMostrarStatus] = useState(true);
  const [rolagens, setRolagens] = useState<Record<string, RolagemCard>>({});
  const [modoRegua, setModoRegua] = useState(false);
  const [mestreAberto, setMestreAberto] = useState(false);
  const [novaCenaAberta, setNovaCenaAberta] = useState(false);
  const [renomearCenaId, setRenomearCenaId] = useState<string | null>(null);
  const [reguasRemotas, setReguasRemotas] = useState<Record<string, ReguaRemotaCena>>({});
  const draggingRef = useRef<string | null>(null);
  const lastSentRef = useRef(0);

  // Cena ativa exibida no tabuleiro (cai pra primeira se a referência sumir).
  const cenaAtiva = useMemo(() => {
    if (!mesa) return null;
    return mesa.cenas.find((c) => c.id === mesa.cenaAtivaId) ?? mesa.cenas[0] ?? null;
  }, [mesa]);

  // Só os tokens da cena ativa vão pro tabuleiro.
  const tokensDaCena = useMemo(
    () => (cenaAtiva ? tokens.filter((t) => t.cenaId === cenaAtiva.id) : tokens),
    [tokens, cenaAtiva],
  );

  useEffect(() => {
    if (!mesa) return;
    // Reconcilia por id: a posição é "ao vivo" no cliente (segue os eventos 'mover'),
    // então preserva x/y local pra não puxar de volta um token em arraste quando chega
    // um refetch ('atualizada'). Demais campos vêm do servidor.
    setTokens((prev) => {
      const locais = new Map(prev.map((t) => [t.id, t]));
      return mesa.tokens.map((s) => {
        const local = locais.get(s.id);
        return local ? { ...s, x: local.x, y: local.y } : s;
      });
    });
  }, [mesa]);

  // Ao trocar de cena (ou sumir o token), limpa a seleção que não pertence à cena ativa.
  useEffect(() => {
    setSelectedTokenId((sel) =>
      sel && tokens.some((t) => t.id === sel && t.cenaId === cenaAtiva?.id) ? sel : null,
    );
  }, [cenaAtiva?.id, tokens]);

  const onEvento = useCallback(
    (evento: MesaEvento) => {
      if (evento.tipo === 'mover') {
        if (evento.tokenId === draggingRef.current) return; // ignora eco do próprio arraste
        setTokens((prev) =>
          prev.map((t) =>
            t.id === evento.tokenId ? { ...t, x: evento.x ?? t.x, y: evento.y ?? t.y } : t,
          ),
        );
      } else if (evento.tipo === 'regua') {
        if (evento.porUserId && evento.porUserId === tokenStorage.getUserId()) return; // próprio eco
        const key = evento.porUserId ?? 'anon';
        const agora = performance.now();
        setReguasRemotas((prev) => {
          // Poda réguas paradas (peer caiu no meio do arraste sem mandar ativa=false).
          const next: Record<string, ReguaRemotaCena> = {};
          for (const [k, r] of Object.entries(prev)) {
            if (agora - r.ts < 5000) next[k] = r;
          }
          if (evento.ativa && evento.x != null && evento.y != null && evento.x2 != null && evento.y2 != null) {
            next[key] = { porUserId: key, x1: evento.x, y1: evento.y, x2: evento.x2, y2: evento.y2, cenaId: evento.cenaId, ts: agora };
          } else {
            delete next[key];
          }
          return next;
        });
      } else if (evento.tipo === 'ficha' && evento.tokenId) {
        // Atualização ao vivo do status da ficha vinculada: troca o snapshot in-place (sem
        // refetch). O backend só emite isso pra tokens com status visível.
        const tokenId = evento.tokenId;
        setTokens((prev) =>
          prev.map((t) => (t.id === tokenId ? { ...t, ficha: evento.ficha ?? t.ficha } : t)),
        );
      } else if (evento.tipo === 'rolagem' && evento.tokenId) {
        // Card transitório de rolagem acima do token; a poda por TTL fica no interval abaixo.
        const tokenId = evento.tokenId;
        const agora = performance.now();
        setRolagens((prev) => ({
          ...prev,
          [tokenId]: {
            source: evento.rolagemSource ?? '',
            total: evento.rolagemTotal ?? 0,
            critico: Boolean(evento.rolagemCritico),
            nome: evento.rolagemNome ?? null,
            ts: agora,
          },
        }));
      } else if (evento.tipo === 'atualizada' && id) {
        // Sempre re-busca em mudança estrutural (resize/versão/nome/mapa/grid/cena…).
        // NÃO filtramos pelo porUserId de propósito: com 2 abas no mesmo navegador o
        // localStorage (e o token/userId) é compartilhado, então o id do "autor" pode
        // coincidir e o outro cliente descartaria a atualização — foi o bug do resize/
        // troca de versão não refletirem. O re-seed preserva o x/y local (sem snap em
        // arraste) e a query é deduplicada, então o custo é só um GET barato.
        qc.invalidateQueries({ queryKey: mesaKeys.detail(id) });
      }
    },
    [id, qc],
  );

  const { conectado, enviarMovimento, enviarRegua } = useMesaSocket(id, onEvento);

  // Réguas de outros, restritas à cena ativa.
  const reguasDaCena = useMemo<ReguaRemota[]>(
    () => Object.values(reguasRemotas).filter((r) => r.cenaId === cenaAtiva?.id),
    [reguasRemotas, cenaAtiva?.id],
  );

  // Rolagens ativas (card acima do token), só dos tokens da cena atual.
  const rolagensDaCena = useMemo<RolagemNoToken[]>(() => {
    const idsDaCena = new Set(tokensDaCena.map((t) => t.id));
    return Object.entries(rolagens)
      .filter(([tokenId]) => idsDaCena.has(tokenId))
      .map(([tokenId, r]) => ({ tokenId, source: r.source, total: r.total, critico: r.critico, nome: r.nome }));
  }, [rolagens, tokensDaCena]);

  // Poda os cards de rolagem expirados (TTL). Só re-renderiza quando algo realmente sai.
  useEffect(() => {
    const t = setInterval(() => {
      const agora = performance.now();
      setRolagens((prev) => {
        if (Object.keys(prev).length === 0) return prev;
        const next: Record<string, RolagemCard> = {};
        let mudou = false;
        for (const [k, r] of Object.entries(prev)) {
          if (agora - r.ts < ROLL_TTL) next[k] = r;
          else mudou = true;
        }
        return mudou ? next : prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Sem conexão, descarta as réguas remotas (repovoam pelos eventos ao reconectar).
  useEffect(() => {
    if (!conectado) setReguasRemotas({});
  }, [conectado]);

  // ----- tokens: arrastar / redimensionar / apagar -----

  const onTokenDragStart = (tokenId: string) => {
    draggingRef.current = tokenId;
    setSelectedTokenId(tokenId);
  };

  const onTokenDragMove = (tokenId: string, x: number, y: number) => {
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t)));
    const agora = Date.now();
    if (agora - lastSentRef.current > 45) {
      lastSentRef.current = agora;
      enviarMovimento(tokenId, x, y);
    }
  };

  const onTokenDragEnd = (tokenId: string, x: number, y: number) => {
    draggingRef.current = null;
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t)));
    enviarMovimento(tokenId, x, y);
    moverPersist.mutate({ tokenId, x, y });
  };

  const handleResizeToken = (tokenId: string, tamanho: number) => {
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, tamanho } : t)));
    resizeToken.mutate(
      { tokenId, tamanho },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao redimensionar.') },
    );
  };

  const apagarToken = useCallback(
    (tokenId: string) => {
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      setSelectedTokenId((sel) => (sel === tokenId ? null : sel));
      removeToken.mutate(tokenId, {
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao apagar token.'),
      });
    },
    [removeToken],
  );

  const handleToggleNomeToken = () => {
    const tk = tokens.find((t) => t.id === selectedTokenId);
    if (!tk) return;
    const visivel = !tk.nomeVisivel;
    setTokens((prev) => prev.map((t) => (t.id === tk.id ? { ...t, nomeVisivel: visivel } : t)));
    setNomeVisivel.mutate(
      { tokenId: tk.id, visivel },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao alternar o nome.') },
    );
  };

  const handleToggleStatusToken = () => {
    const tk = tokens.find((t) => t.id === selectedTokenId);
    if (!tk) return;
    const visivel = !tk.statusVisivel;
    setTokens((prev) => prev.map((t) => (t.id === tk.id ? { ...t, statusVisivel: visivel } : t)));
    setStatusVisivel.mutate(
      { tokenId: tk.id, visivel },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao alternar o status.') },
    );
  };

  const handleVincularFicha = (tokenId: string, characterId: string | null) => {
    vincularFicha.mutate(
      { tokenId, characterId },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao vincular a ficha.') },
    );
  };

  // Apagar com a tecla Delete/Backspace (fora de inputs).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Com qualquer modal aberto (foco pode estar num botão dele, não num input),
      // não vaza o atalho de apagar pro token selecionado por trás do diálogo.
      if (document.querySelector('[role="dialog"]')) return;
      // Foco dentro do popover do token (ex.: picker de ficha) — não vaza o atalho de apagar.
      if ((document.activeElement as HTMLElement | null)?.closest('.bc-token-pop')) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTokenId) {
        e.preventDefault();
        apagarToken(selectedTokenId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedTokenId, apagarToken]);

  // ----- biblioteca -----

  const handleColocarTemplate = (template: TokenTemplate) => {
    if (!cenaAtiva) return;
    const passo = (tokensDaCena.length % 8) * 30;
    // Documento (handout/lore) entra maior, pra ser legível; token usa o tamanho da célula.
    const tamanho = template.tipo === 'DOCUMENTO' ? 300 : cenaAtiva.grid.tamanhoCelula || 50;
    addToken.mutate(
      {
        nome: template.nome ?? 'Token',
        imagemUrl: template.imagemUrl,
        x: 200 + passo,
        y: 200 + passo,
        tamanho,
        templateId: template.id,
        cenaId: cenaAtiva.id,
      },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao colocar no tabuleiro.') },
    );
  };

  // Mapa da biblioteca: aplica a imagem como mapa da cena ativa (só dono).
  const handleUsarMapaDaBiblioteca = (template: TokenTemplate) => {
    if (!cenaAtiva || !template.imagemUrl) return;
    setMapa.mutate(
      { cenaId: cenaAtiva.id, mapaUrl: template.imagemUrl },
      {
        onSuccess: () => toast.success('Mapa aplicado à cena.'),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao aplicar o mapa.'),
      },
    );
  };

  const handleAddTemplate = (payload: NovoTemplateInput) => {
    addTemplate.mutate(payload, {
      onSuccess: () => toast.success('Token adicionado à biblioteca.'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao adicionar à biblioteca.'),
    });
  };

  const handleRemoveTemplate = (templateId: string) => {
    removeTemplate.mutate(templateId, {
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao remover da biblioteca.'),
    });
  };

  const handleAddPasta = (nome: string) => {
    addPasta.mutate(nome, {
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao criar pasta.'),
    });
  };

  const handleRemovePasta = (pastaId: string) => {
    removePasta.mutate(pastaId, {
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao excluir pasta.'),
    });
  };

  const handleMoverParaPasta = (templateId: string, pastaId: string | null) => {
    moverParaPasta.mutate(
      { templateId, pastaId },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao mover token.') },
    );
  };

  const handleDefinirBase = (templateId: string, baseId: string | null) => {
    definirBase.mutate(
      { templateId, baseId },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao vincular versão.') },
    );
  };

  // Versões do token selecionado (base + variações), pra montar o popover de troca rápida.
  const versoesDoSelecionado = useMemo<TokenTemplate[]>(() => {
    if (!mesa || !selectedTokenId) return [];
    const tk = tokens.find((t) => t.id === selectedTokenId);
    if (!tk?.templateId) return [];
    const atual = mesa.biblioteca.find((t) => t.id === tk.templateId);
    if (!atual) return [];
    const grupo = atual.baseId ?? atual.id;
    return mesa.biblioteca
      .filter((t) => (t.baseId ?? t.id) === grupo)
      .sort((a, b) => {
        const ordemBase = (a.baseId ? 1 : 0) - (b.baseId ? 1 : 0);
        return ordemBase !== 0 ? ordemBase : (a.nome ?? '').localeCompare(b.nome ?? '');
      });
  }, [mesa, tokens, selectedTokenId]);

  const handleTrocarVersao = (tokenId: string, templateId: string) => {
    const tpl = mesa?.biblioteca.find((t) => t.id === templateId);
    if (tpl) {
      setTokens((prev) =>
        prev.map((t) =>
          t.id === tokenId ? { ...t, nome: tpl.nome, imagemUrl: tpl.imagemUrl, templateId: tpl.id } : t,
        ),
      );
    }
    switchVersao.mutate(
      { tokenId, templateId },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao trocar versão.') },
    );
  };

  // ----- mapa / grid / escala (por cena) -----

  const handleSetMapaUrl = (url: string) => {
    if (!cenaAtiva) return;
    setMapa.mutate(
      { cenaId: cenaAtiva.id, mapaUrl: url || null },
      {
        onSuccess: () => toast.success('Mapa atualizado.'),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao definir mapa.'),
      },
    );
  };

  const handleUploadMapa = async (file: File) => {
    if (!cenaAtiva) return;
    try {
      const url = await uploadImagemCloudinary(file);
      await setMapa.mutateAsync({ cenaId: cenaAtiva.id, mapaUrl: url });
      toast.success('Mapa enviado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha no upload. Use "Mapa (URL)".');
    }
  };

  // Toggle rápido do grid (sem toast — evita ruído a cada clique no switch).
  const handleConfigurarGrid = (payload: ConfigurarGridInput) => {
    if (!cenaAtiva) return;
    configurarGrid.mutate(
      { cenaId: cenaAtiva.id, ...payload },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao ajustar o grid.') },
    );
  };

  // Salvar pelo modal Grid e escala (com confirmação visível).
  const handleSalvarGridEscala = (payload: ConfigurarGridInput) => {
    if (!cenaAtiva) return;
    configurarGrid.mutate(
      { cenaId: cenaAtiva.id, ...payload },
      {
        onSuccess: () => toast.success('Grid e escala atualizados.'),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao ajustar o grid.'),
      },
    );
  };

  // Em telas estreitas, Biblioteca e Mestre são overlays — abrir um fecha o outro.
  // Casado com o breakpoint de overlay do mesa.css (640px); acima disso são docks.
  const ESTREITO = 640;
  const handleToggleBiblioteca = () => {
    setBibliotecaAberta((v) => !v);
    if (!bibliotecaAberta && window.innerWidth <= ESTREITO) setMestreAberto(false);
  };
  const handleToggleMestre = () => {
    setMestreAberto((v) => !v);
    if (!mestreAberto && window.innerWidth <= ESTREITO) setBibliotecaAberta(false);
  };

  const handleTransformarMapa = (t: { x: number; y: number; largura: number; altura: number; travado: boolean }) => {
    if (!cenaAtiva) return;
    transformarMapa.mutate(
      { cenaId: cenaAtiva.id, ...t },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao ajustar o mapa.') },
    );
  };

  const handleToggleTravaMapa = () => {
    if (!cenaAtiva) return;
    handleTransformarMapa({
      x: cenaAtiva.mapaX,
      y: cenaAtiva.mapaY,
      largura: cenaAtiva.mapaLargura,
      altura: cenaAtiva.mapaAltura,
      travado: !cenaAtiva.mapaTravado,
    });
  };

  const handleRegua = (x1: number, y1: number, x2: number, y2: number, ativa: boolean) => {
    if (!cenaAtiva) return;
    enviarRegua(cenaAtiva.id, x1, y1, x2, y2, ativa);
  };

  // ----- cenas -----

  const handleAtivarCena = (cenaId: string) => {
    if (cenaId === mesa?.cenaAtivaId) return;
    setSelectedTokenId(null);
    activateCena.mutate(cenaId, {
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao trocar de cena.'),
    });
  };

  // CenasBar "+ Cena" → abre o modal de nova cena.
  const handleAbrirNovaCena = () => {
    setSelectedTokenId(null);
    setNovaCenaAberta(true);
  };

  const handleCriarCena = (nome: string) => {
    addCena.mutate(nome.trim() || `Cena ${(mesa?.cenas.length ?? 0) + 1}`, {
      onSuccess: () => toast.success('Cena criada.'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao criar cena.'),
    });
  };

  const handleConfirmarRenomearCena = (nome: string) => {
    if (!renomearCenaId || !nome.trim()) return;
    renameCena.mutate(
      { cenaId: renomearCenaId, nome: nome.trim() },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao renomear cena.') },
    );
  };

  const handleRemoverCena = async (cenaId: string) => {
    const atual = mesa?.cenas.find((c) => c.id === cenaId);
    const ok = await confirmDanger({
      title: `Excluir a cena "${atual?.nome ?? ''}"?`,
      text: 'A cena e os tokens dela serão removidos. Essa ação é permanente.',
      confirmText: 'Sim, excluir',
    });
    if (!ok) return;
    removeCena.mutate(cenaId, {
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao excluir cena.'),
    });
  };

  if (isLoading) return <Centro texto="Abrindo a mesa..." />;
  if (isError || !mesa) {
    return <Centro texto={error instanceof Error ? error.message : 'Mesa não encontrada.'} />;
  }

  const tokenSel = tokensDaCena.find((t) => t.id === selectedTokenId) ?? null;
  const cenaParaRenomear = mesa.cenas.find((c) => c.id === renomearCenaId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0A0507' }}>
      <MesaTopBar
        mesa={mesa}
        conectado={conectado}
        onSair={() => navigate('/dashboard')}
        modoRegua={modoRegua}
        onToggleRegua={() => setModoRegua((v) => !v)}
        mostrarNomes={mostrarNomes}
        onToggleNomes={() => setMostrarNomes((v) => !v)}
        mostrarStatus={mostrarStatus}
        onToggleStatus={() => setMostrarStatus((v) => !v)}
        bibliotecaAberta={bibliotecaAberta}
        onToggleBiblioteca={handleToggleBiblioteca}
        mestreAberto={mestreAberto}
        onToggleMestre={handleToggleMestre}
      />

      {mesa.souDono && (
        <CenasBar
          cenas={mesa.cenas}
          cenaAtivaId={mesa.cenaAtivaId}
          onAtivar={handleAtivarCena}
          onAdicionar={handleAbrirNovaCena}
          onRenomear={setRenomearCenaId}
          onRemover={handleRemoverCena}
        />
      )}

      {/* Docks laterais: Biblioteca à esquerda, tabuleiro no meio, Mestre à direita.
          Os dois painéis são irmãos flex do canvas (espremem o tabuleiro); em telas
          estreitas viram drawers sobrepostos (ver mesa.css) — daí o position:relative. */}
      <div style={{ position: 'relative', display: 'flex', flex: 1, minHeight: 0 }}>
        {bibliotecaAberta && (
          <BibliotecaPanel
            biblioteca={mesa.biblioteca}
            pastas={mesa.pastas}
            uploadHabilitado={cloudinaryConfigurado()}
            souDono={mesa.souDono}
            onClose={() => setBibliotecaAberta(false)}
            onColocar={handleColocarTemplate}
            onUsarMapa={handleUsarMapaDaBiblioteca}
            onAdicionar={handleAddTemplate}
            onRemover={handleRemoveTemplate}
            onAdicionarPasta={handleAddPasta}
            onRemoverPasta={handleRemovePasta}
            onMoverParaPasta={handleMoverParaPasta}
            onDefinirBase={handleDefinirBase}
          />
        )}

        <div style={{ position: 'relative', display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
          <Board
            cena={cenaAtiva}
            tokens={tokensDaCena}
            souDono={mesa.souDono}
            mostrarNomes={mostrarNomes}
            mostrarStatus={mostrarStatus}
            modoRegua={modoRegua}
            reguasRemotas={reguasDaCena}
            rolagens={rolagensDaCena}
            selectedTokenId={selectedTokenId}
            versoesDoSelecionado={versoesDoSelecionado}
            tokenNomeVisivel={tokenSel?.nomeVisivel ?? false}
            tokenStatusVisivel={tokenSel?.statusVisivel ?? false}
            onSelectToken={setSelectedTokenId}
            onTokenDragStart={onTokenDragStart}
            onTokenDragMove={onTokenDragMove}
            onTokenDragEnd={onTokenDragEnd}
            onTokenResize={handleResizeToken}
            onTrocarVersao={handleTrocarVersao}
            onToggleNomeToken={handleToggleNomeToken}
            onToggleStatusToken={handleToggleStatusToken}
            onVincularFicha={handleVincularFicha}
            onApagarToken={() => {
              if (selectedTokenId) apagarToken(selectedTokenId);
            }}
            onTransformarMapa={handleTransformarMapa}
            onRegua={handleRegua}
          />
        </div>

        {mesa.souDono && mestreAberto && cenaAtiva && (
          <MestrePanel
            cena={cenaAtiva}
            uploadHabilitado={cloudinaryConfigurado()}
            onClose={() => setMestreAberto(false)}
            onSetMapaUrl={handleSetMapaUrl}
            onUploadMapa={handleUploadMapa}
            onToggleTravaMapa={handleToggleTravaMapa}
            onConfigurarGrid={handleConfigurarGrid}
            onSalvarGridEscala={handleSalvarGridEscala}
          />
        )}
      </div>

      {/* Modais de cena (só dono) */}
      <PromptModal
        isOpen={novaCenaAberta}
        title="Nova cena"
        label="Nome da cena"
        initialValue={`Cena ${mesa.cenas.length + 1}`}
        confirmText="Criar cena"
        onConfirm={handleCriarCena}
        onClose={() => setNovaCenaAberta(false)}
      />
      <PromptModal
        isOpen={renomearCenaId !== null}
        title="Renomear cena"
        label="Novo nome da cena"
        initialValue={cenaParaRenomear?.nome ?? ''}
        confirmText="Salvar"
        onConfirm={handleConfirmarRenomearCena}
        onClose={() => setRenomearCenaId(null)}
      />
    </div>
  );
}
