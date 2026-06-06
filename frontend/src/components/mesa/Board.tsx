import { useEffect, useMemo, useRef, useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Image as KonvaImage, Layer, Line, Stage, Text, Transformer } from 'react-konva';
import type { Grid, Token, TokenTemplate } from '@/types/mesa';

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

interface TokenNodeProps {
  token: Token;
  onSelect: (tokenId: string) => void;
  onDragStart: (tokenId: string) => void;
  onDragMove: (tokenId: string, x: number, y: number) => void;
  onDragEnd: (tokenId: string, x: number, y: number) => void;
  onResize: (tokenId: string, tamanho: number) => void;
}

/**
 * Um token no mapa. Com imagemUrl: a própria imagem (proporção preservada, SEM borda nem
 * recorte). Sem imagem (ou enquanto carrega): círculo colorido com a inicial. Posição = centro.
 */
function TokenNode({ token, onSelect, onDragStart, onDragMove, onDragEnd, onResize }: TokenNodeProps) {
  const img = useImageElement(token.imagemUrl);
  const r = token.tamanho / 2;
  const label = (token.nome ?? '?').trim().slice(0, 3).toUpperCase();

  const largura = token.tamanho;
  const altura = img ? Math.round(token.tamanho * (img.naturalHeight / img.naturalWidth)) : token.tamanho;

  const aoTransformar = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const escala = node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    const novo = Math.round(token.tamanho * escala);
    onResize(token.id, Math.max(TAM_MIN, Math.min(TAM_MAX, novo)));
  };

  return (
    <Group
      id={token.id}
      x={token.x}
      y={token.y}
      draggable
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
    </Group>
  );
}

interface BoardProps {
  mapaUrl: string | null;
  grid: Grid;
  tokens: Token[];
  selectedTokenId: string | null;
  /** Versões do token selecionado (base + variações). >=2 mostra o menu de troca rápida. */
  versoesDoSelecionado: TokenTemplate[];
  onSelectToken: (id: string | null) => void;
  onTokenDragStart: (tokenId: string) => void;
  onTokenDragMove: (tokenId: string, x: number, y: number) => void;
  onTokenDragEnd: (tokenId: string, x: number, y: number) => void;
  onTokenResize: (tokenId: string, tamanho: number) => void;
  onTrocarVersao: (tokenId: string, templateId: string) => void;
}

export function Board({
  mapaUrl,
  grid,
  tokens,
  selectedTokenId,
  versoesDoSelecionado,
  onSelectToken,
  onTokenDragStart,
  onTokenDragMove,
  onTokenDragEnd,
  onTokenResize,
  onTrocarVersao,
}: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  // Incrementa em pan/zoom pra reposicionar o popover de versão (que segue o token).
  const [viewTick, setViewTick] = useState(0);
  const [arrastando, setArrastando] = useState(false);

  const mapImg = useImageElement(mapaUrl);
  const mapW = mapImg?.naturalWidth ?? SEM_MAPA;
  const mapH = mapImg?.naturalHeight ?? SEM_MAPA;

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
    const node = selectedTokenId ? stage.findOne<Konva.Group>(`#${selectedTokenId}`) : undefined;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedTokenId, tokens]);

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
    if (e.target === e.target.getStage()) onSelectToken(null);
  };

  const aoIniciarArrasto = (tokenId: string) => {
    setArrastando(true);
    onTokenDragStart(tokenId);
  };
  const aoFinalizarArrasto = (tokenId: string, x: number, y: number) => {
    setArrastando(false);
    onTokenDragEnd(tokenId, x, y);
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
    const left = Math.max(8, Math.min(size.width - 8, abs.x));
    const top = Math.max(8, abs.y - meiaAltura - 12);
    return { left, top };
  }, [selectedTokenId, tokens, size.width, viewTick]);

  const tokenAtual = tokens.find((t) => t.id === selectedTokenId);
  const mostrarMenuVersao = !arrastando && menuPos && versoesDoSelecionado.length >= 2;

  const gridLines = () => {
    if (!grid.visivel || grid.tamanhoCelula <= 0) return null;
    const linhas = [];
    for (let x = 0; x <= mapW; x += grid.tamanhoCelula) {
      linhas.push(
        <Line key={`v${x}`} points={[x, 0, x, mapH]} stroke={grid.cor} strokeWidth={1} opacity={0.35} listening={false} />,
      );
    }
    for (let y = 0; y <= mapH; y += grid.tamanhoCelula) {
      linhas.push(
        <Line key={`h${y}`} points={[0, y, mapW, y]} stroke={grid.cor} strokeWidth={1} opacity={0.35} listening={false} />,
      );
    }
    return linhas;
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
        cursor: 'grab',
      }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        draggable
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onDragMove={() => setViewTick((t) => t + 1)}
      >
        <Layer>
          {mapImg && <KonvaImage image={mapImg} x={0} y={0} listening={false} />}
          {gridLines()}
          {tokens.map((t) => (
            <TokenNode
              key={t.id}
              token={t}
              onSelect={onSelectToken}
              onDragStart={aoIniciarArrasto}
              onDragMove={onTokenDragMove}
              onDragEnd={aoFinalizarArrasto}
              onResize={onTokenResize}
            />
          ))}
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

      {mostrarMenuVersao && tokenAtual && menuPos && (
        <div
          style={{
            position: 'absolute',
            left: menuPos.left,
            top: menuPos.top,
            transform: 'translate(-50%, -100%)',
            display: 'flex',
            gap: 4,
            padding: 4,
            background: 'rgba(10, 5, 7, 0.96)',
            border: '1px solid var(--bc-gold)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {versoesDoSelecionado.map((v) => {
            const ativo = v.id === tokenAtual.templateId;
            return (
              <button
                key={v.id}
                type="button"
                title={v.nome ?? 'versão'}
                onClick={() => onTrocarVersao(tokenAtual.id, v.id)}
                style={{
                  width: 38,
                  height: 38,
                  padding: 0,
                  border: ativo ? '2px solid var(--bc-gold)' : '1px solid var(--bc-edge)',
                  borderRadius: 6,
                  background: '#14121A',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  opacity: ativo ? 1 : 0.85,
                }}
              >
                {v.imagemUrl ? (
                  <img src={v.imagemUrl} alt={v.nome ?? 'versão'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--bc-ink-faint)' }}>?</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
