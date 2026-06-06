/**
 * Página da mesa tabletop. Carrega o estado via REST, mantém os tokens em estado local
 * sincronizado pelo canal STOMP (arraste ao vivo) e persiste posição/tamanho. Tokens vêm da
 * biblioteca (aba lateral): pré-carrega moldes e clica pra colocar na mesa. Seleção → resize
 * (alças) e apagar (botão/Delete). Mudanças estruturais chegam como "atualizada" → re-busca.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Board } from '@/components/mesa/Board';
import { MesaToolbar } from '@/components/mesa/MesaToolbar';
import { BibliotecaPanel } from '@/components/mesa/BibliotecaPanel';
import {
  mesaKeys,
  useAddPasta,
  useAddTemplate,
  useAddToken,
  useConfigurarGrid,
  useMesa,
  useMoveTemplateToPasta,
  useMoveTokenPersist,
  useRemovePasta,
  useRemoveTemplate,
  useRemoveToken,
  useResizeToken,
  useSetMapa,
  useSetTemplateBase,
  useSwitchTokenVersion,
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

export function MesaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: mesa, isLoading, isError, error } = useMesa(id);

  const addToken = useAddToken(id ?? '');
  const removeToken = useRemoveToken(id ?? '');
  const resizeToken = useResizeToken(id ?? '');
  const addTemplate = useAddTemplate(id ?? '');
  const removeTemplate = useRemoveTemplate(id ?? '');
  const addPasta = useAddPasta(id ?? '');
  const removePasta = useRemovePasta(id ?? '');
  const moverParaPasta = useMoveTemplateToPasta(id ?? '');
  const definirBase = useSetTemplateBase(id ?? '');
  const switchVersao = useSwitchTokenVersion(id ?? '');
  const setMapa = useSetMapa(id ?? '');
  const configurarGrid = useConfigurarGrid(id ?? '');
  const moverPersist = useMoveTokenPersist(id ?? '');

  // Tokens vivos: semeados do servidor, atualizados por arraste/resize local/remoto.
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [bibliotecaAberta, setBibliotecaAberta] = useState(false);
  const draggingRef = useRef<string | null>(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!mesa) return;
    // Reconcilia por id: a posição é "ao vivo" no cliente (segue os eventos 'mover'),
    // então preserva x/y local pra não puxar de volta um token em arraste quando chega
    // um refetch ('atualizada'). Demais campos (tamanho/nome/imagem) vêm do servidor.
    setTokens((prev) => {
      const locais = new Map(prev.map((t) => [t.id, t]));
      return mesa.tokens.map((s) => {
        const local = locais.get(s.id);
        return local ? { ...s, x: local.x, y: local.y } : s;
      });
    });
    setSelectedTokenId((sel) => (sel && mesa.tokens.some((t) => t.id === sel) ? sel : null));
  }, [mesa]);

  const onEvento = useCallback(
    (evento: MesaEvento) => {
      if (evento.tipo === 'mover') {
        if (evento.tokenId === draggingRef.current) return; // ignora eco do próprio arraste
        setTokens((prev) =>
          prev.map((t) =>
            t.id === evento.tokenId ? { ...t, x: evento.x ?? t.x, y: evento.y ?? t.y } : t,
          ),
        );
      } else if (evento.tipo === 'atualizada' && id) {
        // Ignora o eco da própria ação (a mutation já atualizou o cache) — evita
        // refetch redundante e fecha a janela de corrida do re-seed.
        if (evento.porUserId && evento.porUserId === tokenStorage.getUserId()) return;
        qc.invalidateQueries({ queryKey: mesaKeys.detail(id) });
      }
    },
    [id, qc],
  );

  const { conectado, enviarMovimento } = useMesaSocket(id, onEvento);

  // ----- tokens: arrastar / redimensionar / apagar -----

  const onTokenDragStart = (tokenId: string) => {
    draggingRef.current = tokenId;
    setSelectedTokenId(tokenId);
  };

  const onTokenDragMove = (tokenId: string, x: number, y: number) => {
    // Mantém o state coerente com o nó a cada frame: o Group é controlado (x/y vêm do
    // state), então sem isso qualquer re-render no meio do arraste teleportaria o token
    // de volta. Throttle só vale pro envio via socket.
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
    const passo = (tokens.length % 8) * 30;
    const tamanho = mesa?.grid.tamanhoCelula ?? 50;
    addToken.mutate(
      {
        nome: template.nome ?? 'Token',
        imagemUrl: template.imagemUrl,
        x: 200 + passo,
        y: 200 + passo,
        tamanho,
        templateId: template.id,
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

  // ----- mapa / grid -----

  const handleSetMapaUrl = (url: string) => {
    setMapa.mutate(url || null, {
      onSuccess: () => toast.success('Mapa atualizado.'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao definir mapa.'),
    });
  };

  const handleUploadMapa = async (file: File) => {
    try {
      const url = await uploadImagemCloudinary(file);
      await setMapa.mutateAsync(url);
      toast.success('Mapa enviado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha no upload. Use "Mapa (URL)".');
    }
  };

  const handleToggleGrid = () => {
    if (!mesa) return;
    configurarGrid.mutate(
      { tamanhoCelula: mesa.grid.tamanhoCelula, visivel: !mesa.grid.visivel, cor: mesa.grid.cor },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao ajustar grid.') },
    );
  };

  if (isLoading) return <Centro texto="Abrindo a mesa..." />;
  if (isError || !mesa) {
    return <Centro texto={error instanceof Error ? error.message : 'Mesa não encontrada.'} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0A0507' }}>
      <MesaToolbar
        mesa={mesa}
        conectado={conectado}
        onSair={() => navigate('/dashboard')}
        bibliotecaAberta={bibliotecaAberta}
        onToggleBiblioteca={() => setBibliotecaAberta((v) => !v)}
        tokenSelecionado={selectedTokenId !== null}
        onApagarToken={() => selectedTokenId && apagarToken(selectedTokenId)}
        onSetMapaUrl={handleSetMapaUrl}
        onUploadMapa={handleUploadMapa}
        uploadHabilitado={cloudinaryConfigurado()}
        onToggleGrid={handleToggleGrid}
      />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Board
          mapaUrl={mesa.mapaUrl}
          grid={mesa.grid}
          tokens={tokens}
          selectedTokenId={selectedTokenId}
          versoesDoSelecionado={versoesDoSelecionado}
          onSelectToken={setSelectedTokenId}
          onTokenDragStart={onTokenDragStart}
          onTokenDragMove={onTokenDragMove}
          onTokenDragEnd={onTokenDragEnd}
          onTokenResize={handleResizeToken}
          onTrocarVersao={handleTrocarVersao}
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
