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
import { Board, type ReguaRemota } from '@/components/mesa/Board';
import { MesaToolbar } from '@/components/mesa/MesaToolbar';
import { CenasBar } from '@/components/mesa/CenasBar';
import { BibliotecaPanel } from '@/components/mesa/BibliotecaPanel';
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
  useSwitchTokenVersion,
  useTransformarMapa,
} from '@/api/mesas';
import { useMesaSocket } from '@/hooks/useMesaSocket';
import { tokenStorage } from '@/api/client';
import { cloudinaryConfigurado, uploadImagemCloudinary } from '@/lib/cloudinary';
import type { MesaEvento, NovoTemplateInput, Token, TokenTemplate } from '@/types/mesa';

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

export function MesaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: mesa, isLoading, isError, error } = useMesa(id);

  const addToken = useAddToken(id ?? '');
  const removeToken = useRemoveToken(id ?? '');
  const resizeToken = useResizeToken(id ?? '');
  const setNomeVisivel = useSetTokenNameVisible(id ?? '');
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
  const [modoRegua, setModoRegua] = useState(false);
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
      } else if (evento.tipo === 'atualizada' && id) {
        // Ignora o eco da própria ação (a mutation já atualizou o cache) — evita
        // refetch redundante e fecha a janela de corrida do re-seed.
        if (evento.porUserId && evento.porUserId === tokenStorage.getUserId()) return;
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

  // Apagar com a tecla Delete/Backspace (fora de inputs).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
    const tamanho = cenaAtiva.grid.tamanhoCelula || 50;
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
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao colocar token.') },
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

  const handleToggleGrid = () => {
    if (!cenaAtiva) return;
    configurarGrid.mutate(
      {
        cenaId: cenaAtiva.id,
        tamanhoCelula: cenaAtiva.grid.tamanhoCelula,
        visivel: !cenaAtiva.grid.visivel,
        cor: cenaAtiva.grid.cor,
        escalaValor: cenaAtiva.escalaValor,
        escalaUnidade: cenaAtiva.escalaUnidade ?? 'm',
      },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao ajustar grid.') },
    );
  };

  const handleConfigurarEscala = () => {
    if (!cenaAtiva) return;
    const cel = window.prompt('Tamanho da célula do grid (px):', String(cenaAtiva.grid.tamanhoCelula));
    if (cel === null) return;
    const valor = window.prompt('1 célula equivale a quantas unidades? (ex.: 1.5)', String(cenaAtiva.escalaValor));
    if (valor === null) return;
    const unidade = window.prompt('Unidade da escala (ex.: m, ft):', cenaAtiva.escalaUnidade ?? 'm');
    if (unidade === null) return;
    configurarGrid.mutate(
      {
        cenaId: cenaAtiva.id,
        tamanhoCelula: Math.max(1, Math.round(Number(cel) || cenaAtiva.grid.tamanhoCelula)),
        visivel: cenaAtiva.grid.visivel,
        cor: cenaAtiva.grid.cor,
        escalaValor: Math.max(0.01, Number(valor) || cenaAtiva.escalaValor),
        escalaUnidade: unidade.trim() || 'm',
      },
      {
        onSuccess: () => toast.success('Escala atualizada.'),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao ajustar escala.'),
      },
    );
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

  const handleAddCena = () => {
    const proximo = (mesa?.cenas.length ?? 0) + 1;
    const nome = window.prompt('Nome da nova cena:', `Cena ${proximo}`);
    if (nome === null) return;
    setSelectedTokenId(null);
    addCena.mutate(nome.trim() || `Cena ${proximo}`, {
      onSuccess: () => toast.success('Cena criada.'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao criar cena.'),
    });
  };

  const handleRenomearCena = (cenaId: string) => {
    const atual = mesa?.cenas.find((c) => c.id === cenaId);
    const nome = window.prompt('Novo nome da cena:', atual?.nome ?? '');
    if (nome === null || !nome.trim()) return;
    renameCena.mutate(
      { cenaId, nome: nome.trim() },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao renomear cena.') },
    );
  };

  const handleRemoverCena = (cenaId: string) => {
    const atual = mesa?.cenas.find((c) => c.id === cenaId);
    if (!window.confirm(`Excluir a cena "${atual?.nome ?? ''}" e os tokens dela?`)) return;
    removeCena.mutate(cenaId, {
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao excluir cena.'),
    });
  };

  if (isLoading) return <Centro texto="Abrindo a mesa..." />;
  if (isError || !mesa) {
    return <Centro texto={error instanceof Error ? error.message : 'Mesa não encontrada.'} />;
  }

  const tokenSel = tokensDaCena.find((t) => t.id === selectedTokenId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0A0507' }}>
      <MesaToolbar
        mesa={mesa}
        conectado={conectado}
        onSair={() => navigate('/dashboard')}
        bibliotecaAberta={bibliotecaAberta}
        onToggleBiblioteca={() => setBibliotecaAberta((v) => !v)}
        tokenSelecionado={tokenSel !== null}
        tokenNomeVisivel={tokenSel?.nomeVisivel ?? null}
        onApagarToken={() => selectedTokenId && apagarToken(selectedTokenId)}
        onToggleNomeToken={handleToggleNomeToken}
        mostrarNomes={mostrarNomes}
        onToggleNomes={() => setMostrarNomes((v) => !v)}
        modoRegua={modoRegua}
        onToggleRegua={() => setModoRegua((v) => !v)}
        mapaUrlAtual={cenaAtiva?.mapaUrl ?? null}
        cenaTravada={cenaAtiva?.mapaTravado ?? true}
        temMapa={Boolean(cenaAtiva?.mapaUrl)}
        onToggleTravaMapa={handleToggleTravaMapa}
        onSetMapaUrl={handleSetMapaUrl}
        onUploadMapa={handleUploadMapa}
        uploadHabilitado={cloudinaryConfigurado()}
        onToggleGrid={handleToggleGrid}
        onConfigurarEscala={handleConfigurarEscala}
      />
      {mesa.souDono && (
        <CenasBar
          cenas={mesa.cenas}
          cenaAtivaId={mesa.cenaAtivaId}
          onAtivar={handleAtivarCena}
          onAdicionar={handleAddCena}
          onRenomear={handleRenomearCena}
          onRemover={handleRemoverCena}
        />
      )}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Board
          cena={cenaAtiva}
          tokens={tokensDaCena}
          souDono={mesa.souDono}
          mostrarNomes={mostrarNomes}
          modoRegua={modoRegua}
          reguasRemotas={reguasDaCena}
          selectedTokenId={selectedTokenId}
          versoesDoSelecionado={versoesDoSelecionado}
          onSelectToken={setSelectedTokenId}
          onTokenDragStart={onTokenDragStart}
          onTokenDragMove={onTokenDragMove}
          onTokenDragEnd={onTokenDragEnd}
          onTokenResize={handleResizeToken}
          onTrocarVersao={handleTrocarVersao}
          onTransformarMapa={handleTransformarMapa}
          onRegua={handleRegua}
        />
        {bibliotecaAberta && (
          <BibliotecaPanel
            biblioteca={mesa.biblioteca}
            pastas={mesa.pastas}
            uploadHabilitado={cloudinaryConfigurado()}
            onClose={() => setBibliotecaAberta(false)}
            onColocar={handleColocarTemplate}
            onAdicionar={handleAddTemplate}
            onRemover={handleRemoveTemplate}
            onAdicionarPasta={handleAddPasta}
            onRemoverPasta={handleRemovePasta}
            onMoverParaPasta={handleMoverParaPasta}
            onDefinirBase={handleDefinirBase}
          />
        )}
      </div>
    </div>
  );
}
