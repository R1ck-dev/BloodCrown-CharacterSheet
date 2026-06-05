/**
 * Página da mesa tabletop. Carrega o estado via REST, mantém os tokens em estado local
 * sincronizado pelo canal STOMP (arraste ao vivo) e persiste a posição final no drag-end.
 * Mudanças estruturais (mapa/grid/add token) chegam como evento "atualizada" → re-busca.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Board } from '@/components/mesa/Board';
import { MesaToolbar } from '@/components/mesa/MesaToolbar';
import {
  mesaKeys,
  useAddToken,
  useConfigurarGrid,
  useMesa,
  useMoveTokenPersist,
  useSetMapa,
  useUploadMapaUrl,
} from '@/api/mesas';
import { useMesaSocket } from '@/hooks/useMesaSocket';
import type { MesaEvento, Token } from '@/types/mesa';

const CORES_TOKEN = ['#8b1e2d', '#1e5a8b', '#2d8b3a', '#8b6b1e', '#6b1e8b', '#1e8b8b'];

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
  const setMapa = useSetMapa(id ?? '');
  const uploadUrl = useUploadMapaUrl(id ?? '');
  const configurarGrid = useConfigurarGrid(id ?? '');
  const moverPersist = useMoveTokenPersist(id ?? '');

  // Tokens vivos: semeados do servidor, atualizados por arraste local/remoto.
  const [tokens, setTokens] = useState<Token[]>([]);
  const draggingRef = useRef<string | null>(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (mesa) setTokens(mesa.tokens);
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
        qc.invalidateQueries({ queryKey: mesaKeys.detail(id) });
      }
    },
    [id, qc],
  );

  const { conectado, enviarMovimento } = useMesaSocket(id, onEvento);

  // ----- handlers de token -----

  const onTokenDragStart = (tokenId: string) => {
    draggingRef.current = tokenId;
  };

  const onTokenDragMove = (tokenId: string, x: number, y: number) => {
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

  // ----- handlers da toolbar -----

  const handleAddToken = (nome: string) => {
    const passo = (tokens.length % 8) * 30;
    addToken.mutate(
      {
        nome: nome || 'Token',
        cor: CORES_TOKEN[tokens.length % CORES_TOKEN.length],
        x: 200 + passo,
        y: 200 + passo,
        tamanho: 50,
      },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao adicionar token.') },
    );
  };

  const handleSetMapaUrl = (url: string) => {
    setMapa.mutate(url || null, {
      onSuccess: () => toast.success('Mapa atualizado.'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erro ao definir mapa.'),
    });
  };

  const handleUploadMapa = async (file: File) => {
    try {
      const alvo = await uploadUrl.mutateAsync(file.type || 'image/png');
      const resp = await fetch(alvo.urlUpload, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/png' },
        body: file,
      });
      if (!resp.ok) throw new Error(`Upload falhou (${resp.status})`);
      await setMapa.mutateAsync(alvo.urlPublica);
      toast.success('Mapa enviado.');
    } catch (e) {
      toast.error(
        e instanceof Error
          ? `${e.message}. Sem R2 configurado, use "Mapa (URL)".`
          : 'Falha no upload. Use "Mapa (URL)".',
      );
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
        onAddToken={handleAddToken}
        onSetMapaUrl={handleSetMapaUrl}
        onUploadMapa={handleUploadMapa}
        onToggleGrid={handleToggleGrid}
      />
      <Board
        mapaUrl={mesa.mapaUrl}
        grid={mesa.grid}
        tokens={tokens}
        onTokenDragStart={onTokenDragStart}
        onTokenDragMove={onTokenDragMove}
        onTokenDragEnd={onTokenDragEnd}
      />
    </div>
  );
}
