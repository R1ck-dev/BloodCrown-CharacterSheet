/**
 * Status da ficha desenhado embaixo do token (Konva): uma barra de vida (atual/máxima) e selos
 * numéricos de Defesa e Resistências (física/mágica). Escala/posiciona-se junto com o Stage.
 * Tudo com listening=false — não captura ponteiro, então não atrapalha arraste/seleção do token.
 */
import { Group, Rect, Text } from 'react-konva';
import type { FichaSnapshot } from '@/types/mesa';

interface TokenStatusProps {
  ficha: FichaSnapshot;
  tamanho: number;
  /** y (relativo ao centro do token) do topo do bloco de status. */
  y: number;
}

const BAR_H = 7;
const BADGE_H = 14;
const BADGE_GAP = 4;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function TokenStatus({ ficha, tamanho, y }: TokenStatusProps) {
  const larguraBarra = clamp(tamanho, 60, 180);
  const max = ficha.maxHealth ?? 0;
  const cur = ficha.currentHealth ?? 0;
  const pct = max > 0 ? clamp(cur / max, 0, 1) : 0;
  const critico = max > 0 && cur > 0 && pct < 0.25;

  // Mesma paleta vermelha do StatusBar/bar.css (dark→base→bright); crítico fica mais intenso.
  const corStops = critico
    ? [0, '#7a0000', 0.5, '#dc2626', 1, '#ff4d4d']
    : [0, '#4A0303', 0.55, '#B91C1C', 1, '#EF4444'];

  // Selos: Defesa sempre; resistências só quando > 0 (menos poluição em tokens pequenos).
  const selos: { valor: number; cor: string }[] = [{ valor: ficha.defense ?? 0, cor: '#D4AF37' }];
  if ((ficha.physicalRes ?? 0) > 0) selos.push({ valor: ficha.physicalRes, cor: '#FCA5A5' });
  if ((ficha.magicalRes ?? 0) > 0) selos.push({ valor: ficha.magicalRes, cor: '#9D4EDD' });

  const larguraSelo = (valor: number) => 16 + String(valor).length * 7;
  const larguraSelos =
    selos.reduce((acc, s) => acc + larguraSelo(s.valor), 0) + BADGE_GAP * (selos.length - 1);

  // Pré-calcula a posição de cada selo (centralizados), evitando mutação dentro do map.
  const seloPos: { valor: number; cor: string; x: number; w: number }[] = [];
  let cursor = -larguraSelos / 2;
  for (const s of selos) {
    const w = larguraSelo(s.valor);
    seloPos.push({ ...s, x: cursor, w });
    cursor += w + BADGE_GAP;
  }
  const ySelos = BAR_H + 4;

  return (
    <Group y={y} listening={false}>
      {/* Barra de vida */}
      <Rect
        x={-larguraBarra / 2}
        width={larguraBarra}
        height={BAR_H}
        cornerRadius={BAR_H / 2}
        fill="#1a0808"
        stroke="rgba(212,175,55,0.25)"
        strokeWidth={1}
      />
      {pct > 0 && (
        <Rect
          x={-larguraBarra / 2}
          width={larguraBarra * pct}
          height={BAR_H}
          cornerRadius={BAR_H / 2}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: larguraBarra, y: 0 }}
          fillLinearGradientColorStops={corStops}
          shadowColor={critico ? '#ff0000' : undefined}
          shadowBlur={critico ? 8 : 0}
        />
      )}
      {/* Selos de Defesa / Resistências */}
      {seloPos.map((s, i) => (
        <Group key={i} x={s.x} y={ySelos}>
          <Rect
            width={s.w}
            height={BADGE_H}
            cornerRadius={3}
            fill="rgba(10,5,7,0.85)"
            stroke={s.cor}
            strokeWidth={1}
          />
          <Text
            text={String(s.valor)}
            fontSize={10}
            fontStyle="bold"
            fill="#EDE6D6"
            width={s.w}
            height={BADGE_H}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      ))}
    </Group>
  );
}
