import { useEffect, useMemo, useRef, useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text, Transformer } from 'react-konva';
import { Maximize2, Ruler, ScrollText, Tag, Trash2, X } from 'lucide-react';
import { HeraldicFrame } from '@/components/ornaments/HeraldicFrame';
import type { Cena, Token, TokenTemplate } from '@/types/mesa';

/** Carrega uma imagem como HTMLImageElement pro Konva (undefined enquanto baixa/sem url). */
function useImageElement(url: string | null): HTMLImageElement | undefined {
  const [img, setImg] = useState<HTMLImageElement>();
  useEffect(() => {
    if (!url) {
      setImg(undefined);
      return;
    }
    const image = new window.Image();
    // Sem crossOrigin: só EXIBIMOS (não exportamos o canvas), então qualquer URL pública
    // renderiza sem exigir CORS no host (Cloudinary, Imgur, GitHub raw, etc.).
    image.src = url;
    const onLoad = () => setImg(image);
    image.addEventListener('load', onLoad);
    return () => image.removeEventListener('load', onLoad);
  }, [url]);
  return img;
}

const SEM_MAPA = 2000; // área de grid padrão quando não há mapa
const TAM_MIN = 10;
const TAM_MAX = 1000;
const MAPA_MIN = 100;
const MAPA_MAX = 20000;

/** Régua de outro jogador (recebida ao vivo via STOMP). */
export interface ReguaRemota {
  porUserId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Distância da régua em células e em unidades de jogo (usa o grid+escala da cena). */
function formatarDistancia(x1: number, y1: number, x2: number, y2: number, cena: Cena): string {
  const dpx = Math.hypot(x2 - x1, y2 - y1);
  const cel = cena.grid.tamanhoCelula > 0 ? dpx / cena.grid.tamanhoCelula : 0;
  const unidades = cel * (cena.escalaValor || 0);
  const u = (cena.escalaUnidade ?? '').trim();
  return `${cel.toFixed(1)} cél · ${unidades.toFixed(1)} ${u}`.trim();
}

interface TokenNodeProps {
  token: Token;
  interativo: boolean;
  mostrarNome: boolean;
  onSelect: (tokenId: string) => void;
  onDragStart: (tokenId: string) => void;
  onDragMove: (tokenId: string, x: number, y: number) => void;
  onDragEnd: (tokenId: string, x: number, y: number) => void;
  onResize: (tokenId: string, tamanho: number) => void;
}

/**
 * Um token no mapa. Com imagemUrl: a própria imagem (proporção preservada, SEM borda nem
 * recorte). Sem imagem (ou enquanto carrega): círculo colorido com a inicial. Posição = centro.
 * O nome aparece embaixo quando mostrarNome (toggle global + flag por token).
 */
function TokenNode({ token, interativo, mostrarNome, onSelect, onDragStart, onDragMove, onDragEnd, onResize }: TokenNodeProps) {
  const img = useImageElement(token.imagemUrl);
  const r = token.tamanho / 2;
  const label = (token.nome ?? '?').trim().slice(0, 3).toUpperCase();

  const largura = token.tamanho;
  const altura = img ? Math.round(token.tamanho * (img.naturalHeight / img.naturalWidth)) : token.tamanho;
  const baixoDoToken = altura / 2;

  const aoTransformar = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const escala = node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    const novo = Math.round(token.tamanho * escala);
    onResize(token.id, Math.max(TAM_MIN, Math.min(TAM_MAX, novo)));
  };

  const nome = (token.nome ?? '').trim();

  return (
    <Group
      id={token.id}
      x={token.x}
      y={token.y}
      draggable={interativo}
      listening={interativo}
      onClick={() => onSelect(token.id)}
      onTap={() => onSelect(token.id)}
      onDragStart={() => onDragStart(token.id)}
      onDragMove={(e) => onDragMove(token.id, Math.round(e.target.x()), Math.round(e.target.y()))}
      onDragEnd={(e) => onDragEnd(token.id, Math.round(e.target.x()), Math.round(e.target.y()))}
      onTransformEnd={aoTransformar}
    >
      {img ? (
        <KonvaImage image={img} width={largura} height={altura} offsetX={largura / 2} offsetY={altura / 2} />
      ) : (
        <>
          <Circle radius={r} fill={token.cor ?? '#8b1e2d'} />
          <Text
            text={label}
            fontSize={Math.max(10, r * 0.5)}
            fontStyle="bold"
            fill="#EDE6D6"
            width={token.tamanho}
            height={token.tamanho}
            offsetX={r}
            offsetY={r}
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </>
      )}
      {mostrarNome && nome && (
        <Text
          text={nome}
          fontSize={14}
          fontStyle="bold"
          fill="#EDE6D6"
          stroke="#0A0507"
          strokeWidth={2}
          fillAfterStrokeEnabled
          width={Math.max(120, token.tamanho * 1.4)}
          offsetX={Math.max(120, token.tamanho * 1.4) / 2}
          y={baixoDoToken + 4}
          align="center"
          listening={false}
        />
      )}
    </Group>
  );
}

interface BoardProps {
  cena: Cena | null;
  tokens: Token[];
  souDono: boolean;
  /** Toggle global (preferência local de quem olha) pra mostrar/ocultar todos os nomes. */
  mostrarNomes: boolean;
  /** Modo régua ativo: clicar-arrastar mede distância (em vez de pan). */
  modoRegua: boolean;
  /** Réguas de outros jogadores, ao vivo. */
  reguasRemotas: ReguaRemota[];
  selectedTokenId: string | null;
  /** Versões do token selecionado (base + variações). >=2 mostra a faixa de troca rápida. */
  versoesDoSelecionado: TokenTemplate[];
  /** nomeVisivel do token selecionado (reflete o estado do toggle "Nome" no popover). */
  tokenNomeVisivel: boolean;
  onSelectToken: (id: string | null) => void;
  onTokenDragStart: (tokenId: string) => void;
  onTokenDragMove: (tokenId: string, x: number, y: number) => void;
  onTokenDragEnd: (tokenId: string, x: number, y: number) => void;
  onTokenResize: (tokenId: string, tamanho: number) => void;
  onTrocarVersao: (tokenId: string, templateId: string) => void;
  /** Alterna a visibilidade do nome do token selecionado (popover). */
  onToggleNomeToken: () => void;
  /** Apaga o token selecionado (popover). */
  onApagarToken: () => void;
  /** Persiste a transformação do mapa (mestre move/redimensiona o mapa destravado). */
  onTransformarMapa: (t: { x: number; y: number; largura: number; altura: number; travado: boolean }) => void;
  /** Régua ao vivo: início (x1,y1) → fim (x2,y2); ativa=false limpa. */
  onRegua: (x1: number, y1: number, x2: number, y2: number, ativa: boolean) => void;
}

export function Board({
  cena,
  tokens,
  souDono,
  mostrarNomes,
  modoRegua,
  reguasRemotas,
  selectedTokenId,
  versoesDoSelecionado,
  tokenNomeVisivel,
  onSelectToken,
  onTokenDragStart,
  onTokenDragMove,
  onTokenDragEnd,
  onTokenResize,
  onTrocarVersao,
  onToggleNomeToken,
  onApagarToken,
  onTransformarMapa,
  onRegua,
}: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const mapaTrRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  // Incrementa em pan/zoom pra reposicionar o popover de versão (que segue o token).
  const [viewTick, setViewTick] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  // Interação em dois passos: o token selecionado mostra só uma alça (plaquinha de
  // pergaminho); clicar nela abre o popover de ações. Fecha ao trocar/limpar a seleção.
  const [popoverAberto, setPopoverAberto] = useState(false);
  // Régua local enquanto o usuário mede (coordenadas do mundo/stage). reguaRef é a fonte da
  // verdade de "está medindo" (null = não); o state só dispara o re-render do desenho.
  const [reguaLocal, setReguaLocal] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const reguaRef = useRef<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const ultimaReguaRef = useRef(0);

  const mapaUrl = cena?.mapaUrl ?? null;
  const mapImg = useImageElement(mapaUrl);
  const travado = cena?.mapaTravado ?? true;
  const mapaEditavel = Boolean(mapImg) && !travado && souDono && !modoRegua;

  // Dimensões/posição exibidas do mapa (0 = tamanho natural).
  const larguraMapa = mapImg ? (cena && cena.mapaLargura > 0 ? cena.mapaLargura : mapImg.naturalWidth) : SEM_MAPA;
  const alturaMapa = mapImg ? (cena && cena.mapaAltura > 0 ? cena.mapaAltura : mapImg.naturalHeight) : SEM_MAPA;
  const mapaX = mapImg ? cena?.mapaX ?? 0 : 0;
  const mapaY = mapImg ? cena?.mapaY ?? 0 : 0;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const aplicar = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    aplicar();
    const ro = new ResizeObserver(aplicar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Anexa o Transformer (alças de resize) ao token selecionado.
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const node = selectedTokenId && !modoRegua ? stage.findOne<Konva.Group>(`#${selectedTokenId}`) : undefined;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedTokenId, tokens, modoRegua]);

  // Recolhe o popover (volta pra alça) sempre que a seleção muda ou é limpa.
  useEffect(() => {
    setPopoverAberto(false);
  }, [selectedTokenId]);

  // Anexa o Transformer do mapa quando ele está destravado (mestre pode mover/redimensionar).
  useEffect(() => {
    const tr = mapaTrRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const node = mapaEditavel ? stage.findOne<Konva.Image>('#mapa-bg') : undefined;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [mapaEditavel, mapaUrl, larguraMapa, alturaMapa, mapaX, mapaY]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const zoomIn = e.evt.deltaY < 0;
    const newScale = Math.max(0.2, Math.min(5, zoomIn ? oldScale * 1.08 : oldScale / 1.08));
    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
    setViewTick((t) => t + 1);
  };

  // Clique no vazio (mapa/grid têm listening=false → target é o stage) deseleciona.
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (modoRegua) return;
    if (e.target === e.target.getStage()) onSelectToken(null);
  };

  const aoIniciarArrasto = (tokenId: string) => {
    setArrastando(true);
    setPopoverAberto(false);
    onTokenDragStart(tokenId);
  };
  const aoFinalizarArrasto = (tokenId: string, x: number, y: number) => {
    setArrastando(false);
    onTokenDragEnd(tokenId, x, y);
  };

  const aoTransformarMapa = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Image;
    const novaLargura = Math.max(MAPA_MIN, Math.min(MAPA_MAX, Math.round(node.width() * node.scaleX())));
    const novaAltura = Math.max(MAPA_MIN, Math.min(MAPA_MAX, Math.round(node.height() * node.scaleY())));
    // Fixa o tamanho no nó pra ele não "voltar" ao tamanho antigo até o servidor responder.
    node.scaleX(1);
    node.scaleY(1);
    node.width(novaLargura);
    node.height(novaAltura);
    onTransformarMapa({
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      largura: novaLargura,
      altura: novaAltura,
      travado: false,
    });
  };

  const aoArrastarMapa = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onTransformarMapa({
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      largura: larguraMapa,
      altura: alturaMapa,
      travado: false,
    });
  };

  // -------- régua: clicar-arrastar no modo régua mede distância (mundo = coords do stage) --------
  const pontoMundo = () => stageRef.current?.getRelativePointerPosition() ?? null;

  const aoMouseDownRegua = () => {
    if (!modoRegua || !cena) return;
    const p = pontoMundo();
    if (!p) return;
    const nova = { x1: p.x, y1: p.y, x2: p.x, y2: p.y };
    reguaRef.current = nova;
    setReguaLocal(nova);
  };

  const aoMouseMoveRegua = () => {
    const r = reguaRef.current;
    if (!r || !cena) return;
    const p = pontoMundo();
    if (!p) return;
    const nova = { x1: r.x1, y1: r.y1, x2: p.x, y2: p.y };
    reguaRef.current = nova;
    setReguaLocal(nova);
    const agora = performance.now();
    if (agora - ultimaReguaRef.current > 40) {
      ultimaReguaRef.current = agora;
      onRegua(nova.x1, nova.y1, nova.x2, nova.y2, true);
    }
  };

  const aoMouseUpRegua = () => {
    const r = reguaRef.current;
    if (!r) return;
    reguaRef.current = null;
    onRegua(r.x1, r.y1, r.x2, r.y2, false);
    setReguaLocal(null);
  };

  // Posição (em px do container) do popover de versão, ancorado acima do token selecionado.
  const menuPos = useMemo(() => {
    void viewTick; // recomputa em pan/zoom
    const stage = stageRef.current;
    if (!stage || !selectedTokenId) return null;
    const node = stage.findOne(`#${selectedTokenId}`);
    if (!node) return null;
    const abs = node.absolutePosition();
    const escala = stage.scaleX();
    const token = tokens.find((t) => t.id === selectedTokenId);
    const meiaAltura = ((token?.tamanho ?? 50) / 2) * escala;
    // Clampa a CAIXA do popover (não só o ponto de âncora): usa metade da largura
    // estimada pra não cortar nas laterais; e quando não cabe acima do token (perto
    // do topo), joga o popover pra BAIXO dele.
    const meiaLargura = 124;
    const minL = meiaLargura + 8;
    const maxL = size.width - meiaLargura - 8;
    const left = maxL > minL ? Math.max(minL, Math.min(maxL, abs.x)) : size.width / 2;
    const alturaEstim = versoesDoSelecionado.length >= 2 ? 112 : 56;
    const acima = abs.y - meiaAltura - 12;
    const below = acima - alturaEstim < 8;
    const top = below ? abs.y + meiaAltura + 12 : acima;
    return { left, top, below };
  }, [selectedTokenId, tokens, size.width, viewTick, versoesDoSelecionado.length]);

  const tokenAtual = tokens.find((t) => t.id === selectedTokenId);
  // Popover de token: aparece sempre que há token selecionado (e não em arraste/régua),
  // com as ações (Nome/Apagar) e — quando houver >=2 versões — a faixa de troca rápida.
  const mostrarPopover = !arrastando && !modoRegua && Boolean(menuPos) && Boolean(tokenAtual);
  const temVersoes = versoesDoSelecionado.length >= 2;

  const grid = cena?.grid;
  // Memoizado: só recalcula quando grid/mapa mudam (o tabuleiro re-renderiza a cada frame da
  // régua). Limite de linhas por eixo evita travar se a célula for minúscula num mapa enorme.
  const gridLines = useMemo(() => {
    if (!grid || !grid.visivel || grid.tamanhoCelula <= 0) return null;
    const MAX_LINHAS = 1000;
    const linhas = [];
    const x0 = mapaX;
    const y0 = mapaY;
    const x1 = mapaX + larguraMapa;
    const y1 = mapaY + alturaMapa;
    let n = 0;
    for (let x = x0; x <= x1 && n < MAX_LINHAS; x += grid.tamanhoCelula, n++) {
      linhas.push(
        <Line key={`v${x}`} points={[x, y0, x, y1]} stroke={grid.cor} strokeWidth={1} opacity={0.35} listening={false} />,
      );
    }
    n = 0;
    for (let y = y0; y <= y1 && n < MAX_LINHAS; y += grid.tamanhoCelula, n++) {
      linhas.push(
        <Line key={`h${y}`} points={[x0, y, x1, y]} stroke={grid.cor} strokeWidth={1} opacity={0.35} listening={false} />,
      );
    }
    return linhas;
  }, [grid, mapaX, mapaY, larguraMapa, alturaMapa]);

  const reguaSegmento = (
    key: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    cor: string,
  ) => {
    if (!cena) return null;
    const meioX = (x1 + x2) / 2;
    const meioY = (y1 + y2) / 2;
    const texto = formatarDistancia(x1, y1, x2, y2, cena);
    const larguraCaixa = Math.max(120, texto.length * 8);
    return (
      <Group key={key} listening={false}>
        <Line points={[x1, y1, x2, y2]} stroke={cor} strokeWidth={2} dash={[8, 6]} />
        <Circle x={x1} y={y1} radius={4} fill={cor} />
        <Circle x={x2} y={y2} radius={4} fill={cor} />
        <Group x={meioX} y={meioY - 22}>
          <Rect width={larguraCaixa} height={20} offsetX={larguraCaixa / 2} cornerRadius={4} fill="rgba(10,5,7,0.9)" stroke={cor} />
          <Text
            text={texto}
            fontSize={13}
            fontStyle="bold"
            fill="#EDE6D6"
            width={larguraCaixa}
            height={20}
            offsetX={larguraCaixa / 2}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      </Group>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        flex: 1,
        // minWidth:0 deixa o Board encolher abaixo da largura do canvas (senão o
        // <canvas> de largura fixa trava o flex em min-width:auto e empurra a
        // Biblioteca pra fora da tela); overflow:hidden clipa o canvas grande até
        // o ResizeObserver reajustar a largura do Stage.
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #14121A 0%, #0A0507 100%)',
        cursor: modoRegua ? 'crosshair' : 'grab',
      }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        draggable={!modoRegua}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onDragMove={() => setViewTick((t) => t + 1)}
        onMouseDown={aoMouseDownRegua}
        onMouseMove={aoMouseMoveRegua}
        onMouseUp={aoMouseUpRegua}
        onTouchStart={aoMouseDownRegua}
        onTouchMove={aoMouseMoveRegua}
        onTouchEnd={aoMouseUpRegua}
      >
        <Layer>
          {mapImg && (
            <KonvaImage
              id="mapa-bg"
              image={mapImg}
              x={mapaX}
              y={mapaY}
              width={larguraMapa}
              height={alturaMapa}
              listening={mapaEditavel}
              draggable={mapaEditavel}
              onDragEnd={aoArrastarMapa}
              onTransformEnd={aoTransformarMapa}
            />
          )}
          {gridLines}
          {tokens.map((t) => (
            <TokenNode
              key={t.id}
              token={t}
              interativo={!modoRegua}
              mostrarNome={mostrarNomes && t.nomeVisivel}
              onSelect={onSelectToken}
              onDragStart={aoIniciarArrasto}
              onDragMove={onTokenDragMove}
              onDragEnd={aoFinalizarArrasto}
              onResize={onTokenResize}
            />
          ))}
          {reguasRemotas.map((r) => reguaSegmento(`rem-${r.porUserId}`, r.x1, r.y1, r.x2, r.y2, '#5BC0EB'))}
          {reguaLocal && reguaSegmento('local', reguaLocal.x1, reguaLocal.y1, reguaLocal.x2, reguaLocal.y2, '#D4AF37')}
          <Transformer
            ref={mapaTrRef}
            rotateEnabled={false}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            anchorStroke="#5BC0EB"
            anchorFill="#0A0507"
            borderStroke="#5BC0EB"
            borderDash={[6, 4]}
          />
          <Transformer
            ref={trRef}
            rotateEnabled={false}
            keepRatio
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            anchorStroke="#D4AF37"
            anchorFill="#0A0507"
            borderStroke="#D4AF37"
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < TAM_MIN ||
              newBox.width > TAM_MAX ||
              newBox.height < TAM_MIN ||
              newBox.height > TAM_MAX
                ? oldBox
                : newBox
            }
          />
        </Layer>
      </Stage>

      {/* Dicas de câmera (canto superior esquerdo, mono, sem captura de ponteiro). */}
      <div className="bc-board-hint" aria-hidden="true">
        <span>
          arrastar vazio · <strong>pan</strong>
        </span>
        <span>
          scroll · <strong>zoom</strong>
        </span>
      </div>

      {/* Indicador de zoom + centralizar (canto inferior direito). */}
      <div className="bc-board-zoom">
        <button
          type="button"
          className="bc-board-zoom__btn"
          title="Centralizar e resetar o zoom"
          aria-label="Centralizar e resetar o zoom"
          onClick={() => {
            const stage = stageRef.current;
            if (!stage) return;
            stage.scale({ x: 1, y: 1 });
            stage.position({ x: 0, y: 0 });
            setViewTick((t) => t + 1);
          }}
        >
          <Maximize2 size={15} />
        </button>
        <span className="bc-board-zoom__pct">
          {Math.round((stageRef.current?.scaleX() ?? 1) * 100)}%
        </span>
      </div>

      {modoRegua && (
        <div className="bc-board-regua-hint">
          <Ruler size={14} /> Régua ativa — arraste para medir
        </div>
      )}

      {/* Interação em dois passos: alça (plaquinha) → popover heráldico. */}
      {mostrarPopover && tokenAtual && menuPos && !popoverAberto && (
        <button
          type="button"
          className="bc-token-handle"
          aria-label="Abrir ações do token"
          title="Ações do token"
          style={{
            position: 'absolute',
            left: menuPos.left,
            top: menuPos.top,
            transform: menuPos.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            zIndex: 10,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setPopoverAberto(true);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ScrollText size={17} />
        </button>
      )}

      {mostrarPopover && tokenAtual && menuPos && popoverAberto && (
        <div
          className="bc-token-pop"
          style={{
            position: 'absolute',
            left: menuPos.left,
            top: menuPos.top,
            transform: menuPos.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <HeraldicFrame className="bc-token-pop__frame">
            <div className="bc-token-pop__body">
              <div className="bc-token-pop__head">
                <span
                  className="bc-token-pop__dot"
                  style={{ background: tokenAtual.cor ?? '#8b1e2d' }}
                  aria-hidden="true"
                />
                <span className="bc-token-pop__name">{tokenAtual.nome ?? 'Token'}</span>
                <button
                  type="button"
                  className="bc-token-pop__close"
                  aria-label="Fechar ações do token"
                  title="Fechar"
                  onClick={() => setPopoverAberto(false)}
                >
                  <X size={13} />
                </button>
              </div>

              <div className="bc-token-pop__actions">
                <button
                  type="button"
                  className={`bc-token-pop__btn${tokenNomeVisivel ? ' bc-token-pop__btn--active' : ''}`}
                  onClick={onToggleNomeToken}
                  title="Mostrar/esconder o nome deste token"
                >
                  <Tag size={13} /> Nome
                </button>
                <button
                  type="button"
                  className="bc-token-pop__btn bc-token-pop__btn--danger"
                  onClick={onApagarToken}
                  title="Apagar token selecionado (Delete)"
                >
                  <Trash2 size={13} /> Apagar
                </button>
              </div>

              {temVersoes && (
                <div className="bc-token-pop__versions">
                  {versoesDoSelecionado.map((v) => {
                    const ativo = v.id === tokenAtual.templateId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        className={`bc-token-ver${ativo ? ' bc-token-ver--ativa' : ''}`}
                        title={v.nome ?? 'versão'}
                        onClick={() => onTrocarVersao(tokenAtual.id, v.id)}
                      >
                        {v.imagemUrl ? (
                          <img src={v.imagemUrl} alt={v.nome ?? 'versão'} />
                        ) : (
                          <span className="bc-token-ver__none">?</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </HeraldicFrame>
        </div>
      )}
    </div>
  );
}
