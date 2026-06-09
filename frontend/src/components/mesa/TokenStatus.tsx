/**
 * Status da ficha desenhado embaixo do token (Konva): uma barra de vida (atual/máxima) e
 * escudos numéricos de Defesa e Resistências (física/mágica) — mesmo motivo do escudo da ficha
 * (DefenseShield). Escala/posiciona-se junto com o Stage. Tudo com listening=false — não captura
 * ponteiro, então não atrapalha arraste/seleção do token.
 *
 * A barra de vida usa cor sólida (sem degradê) — o crítico (<25%) troca pra um vermelho mais vivo
 * + glow, como aviso. O fill arredonda o canto proporcional à própria largura pra encolher
 * com precisão mesmo com vida baixíssima (cornerRadius fixo criava uma largura mínima visual).
 */
import { Group, Path, Rect, Text } from 'react-konva';
import type { FichaSnapshot } from '@/types/mesa';

interface TokenStatusProps {
  ficha: FichaSnapshot;
  tamanho: number;
  /** y (relativo ao centro do token) do topo do bloco de status. */
  y: number;
}

const BAR_H = 7;

// Escudo: mesmo path do DefenseShield (viewBox 76x88), desenhado em escala reduzida.
const SHIELD_PATH = 'M38 4 L70 12 L70 44 Q70 70 38 84 Q6 70 6 44 L6 12 Z';
const SHIELD_VB = 88; // altura do viewBox original
const SHIELD_H = 28; // altura alvo do escudo no tabuleiro
const SHIELD_S = SHIELD_H / SHIELD_VB; // escala do path
const SHIELD_W = 76 * SHIELD_S; // largura do escudo já escalado
const SHIELD_GAP = 5;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

interface Escudo {
  label: string;
  valor: number;
  cor: string;
}

/** Um escudo (defesa/resistência) com rótulo curto + valor no centro, no estilo da ficha. */
function ShieldBadge({ label, valor, cor, x }: Escudo & { x: number }) {
  return (
    <Group x={x}>
      <Path
        data={SHIELD_PATH}
        scaleX={SHIELD_S}
        scaleY={SHIELD_S}
        strokeScaleEnabled={false}
        fillLinearGradientStartPoint={{ x: 0, y: 4 }}
        fillLinearGradientEndPoint={{ x: 0, y: 84 }}
        fillLinearGradientColorStops={[0, '#2A2335', 1, '#0E0A12']}
        stroke={cor}
        strokeWidth={1.3}
        shadowColor="#000"
        shadowBlur={3}
        shadowOpacity={0.6}
      />
      <Text
        text={label}
        x={0}
        width={SHIELD_W}
        y={4.5}
        fontSize={6}
        fontStyle="bold"
        letterSpacing={0.5}
        fill={cor}
        align="center"
      />
      <Text
        text={String(valor)}
        x={0}
        width={SHIELD_W}
        y={9.5}
        fontSize={12}
        fontStyle="bold"
        fill="#F4ECDC"
        align="center"
        shadowColor="#000"
        shadowBlur={2}
        shadowOpacity={0.8}
      />
    </Group>
  );
}

export function TokenStatus({ ficha, tamanho, y }: TokenStatusProps) {
  const larguraBarra = clamp(tamanho, 60, 180);
  const max = ficha.maxHealth ?? 0;
  const cur = ficha.currentHealth ?? 0;
  const pct = max > 0 ? clamp(cur / max, 0, 1) : 0;
  const critico = max > 0 && cur > 0 && pct < 0.25;

  // Cor sólida (sem degradê). Crítico = vermelho vivo com glow; normal = sangue.
  const corVida = critico ? '#EF4444' : '#B91C1C';
  const fillW = larguraBarra * pct;
  // Arredonda proporcional à largura: em vida baixa o raio diminui junto, então a barra
  // continua encolhendo com precisão (raio fixo travava num "comprimido" mínimo).
  const fillR = clamp(fillW / 2, 0, BAR_H / 2);

  // Escudos: Defesa sempre; resistências só quando > 0 (menos poluição em tokens pequenos).
  const escudos: Escudo[] = [{ label: 'CA', valor: ficha.defense ?? 0, cor: '#E9C46A' }];
  if ((ficha.physicalRes ?? 0) > 0) escudos.push({ label: 'RF', valor: ficha.physicalRes, cor: '#F07A7A' });
  if ((ficha.magicalRes ?? 0) > 0) escudos.push({ label: 'RM', valor: ficha.magicalRes, cor: '#B07CE8' });

  const larguraEscudos = escudos.length * SHIELD_W + (escudos.length - 1) * SHIELD_GAP;
  const yEscudos = BAR_H + 5;

  return (
    <Group y={y} listening={false}>
      {/* Trilho da barra de vida */}
      <Rect
        x={-larguraBarra / 2}
        width={larguraBarra}
        height={BAR_H}
        cornerRadius={BAR_H / 2}
        fill="#1a0808"
        stroke="rgba(212,175,55,0.25)"
        strokeWidth={1}
      />
      {/* Preenchimento de vida — cor sólida, sem degradê */}
      {fillW > 0.5 && (
        <Rect
          x={-larguraBarra / 2}
          width={fillW}
          height={BAR_H}
          cornerRadius={fillR}
          fill={corVida}
          shadowColor={critico ? '#ff2a2a' : undefined}
          shadowBlur={critico ? 7 : 0}
          shadowOpacity={critico ? 0.9 : 0}
        />
      )}
      {/* Escudos de Defesa / Resistências (mesmo motivo da ficha) */}
      <Group y={yEscudos}>
        {escudos.map((s, i) => (
          <ShieldBadge
            key={s.label}
            {...s}
            x={-larguraEscudos / 2 + i * (SHIELD_W + SHIELD_GAP)}
          />
        ))}
      </Group>
    </Group>
  );
}
