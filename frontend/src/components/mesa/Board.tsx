import { useEffect, useRef, useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Image as KonvaImage, Layer, Line, Stage, Text } from 'react-konva';
import type { Grid, Token } from '@/types/mesa';

/** Carrega uma imagem como HTMLImageElement pro Konva (undefined enquanto baixa/sem url). */
function useImageElement(url: string | null): HTMLImageElement | undefined {
  const [img, setImg] = useState<HTMLImageElement>();
  useEffect(() => {
    if (!url) {
      setImg(undefined);
      return;
    }
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    const onLoad = () => setImg(image);
    image.addEventListener('load', onLoad);
    return () => image.removeEventListener('load', onLoad);
  }, [url]);
  return img;
}

const SEM_MAPA = 2000; // área de grid padrão quando não há mapa

interface BoardProps {
  mapaUrl: string | null;
  grid: Grid;
  tokens: Token[];
  onTokenDragStart: (tokenId: string) => void;
  onTokenDragMove: (tokenId: string, x: number, y: number) => void;
  onTokenDragEnd: (tokenId: string, x: number, y: number) => void;
}

export function Board({ mapaUrl, grid, tokens, onTokenDragStart, onTokenDragMove, onTokenDragEnd }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

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
  };

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
        flex: 1,
        minHeight: 0,
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
      >
        <Layer>
          {mapImg && <KonvaImage image={mapImg} x={0} y={0} listening={false} />}
          {gridLines()}
          {tokens.map((t) => {
            const r = t.tamanho / 2;
            const label = (t.nome ?? '?').trim().slice(0, 3).toUpperCase();
            return (
              <Group
                key={t.id}
                x={t.x}
                y={t.y}
                draggable
                onDragStart={() => onTokenDragStart(t.id)}
                onDragMove={(e) => onTokenDragMove(t.id, Math.round(e.target.x()), Math.round(e.target.y()))}
                onDragEnd={(e) => onTokenDragEnd(t.id, Math.round(e.target.x()), Math.round(e.target.y()))}
              >
                <Circle radius={r} fill={t.cor ?? '#8b1e2d'} stroke="#D4AF37" strokeWidth={2} shadowBlur={8} shadowColor="#000" />
                <Text
                  text={label}
                  fontSize={Math.max(10, r * 0.5)}
                  fontStyle="bold"
                  fill="#EDE6D6"
                  width={t.tamanho}
                  height={t.tamanho}
                  offsetX={r}
                  offsetY={r}
                  align="center"
                  verticalAlign="middle"
                  listening={false}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
