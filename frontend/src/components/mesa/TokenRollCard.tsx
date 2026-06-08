/**
 * Card transitório de rolagem flutuando acima de um token. Aparece quando uma rolagem feita na
 * ficha vinculada chega pela mesa (evento "rolagem"); some sozinho pelo TTL controlado na MesaPage.
 * Crítico/golpe pesado dispara confetti dourado na posição do card.
 *
 * Posicionamento via motion x/y ('-50%'/'-100%') — offsets estáticos que o framer-motion preserva
 * e compõe com a animação de scale/opacity (não usar `transform` string junto, o motion o sobrescreve).
 */
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { HeraldicFrame } from '@/components/ornaments/HeraldicFrame';
import { fireRollConfetti } from '@/lib/tableConfetti';

interface Props {
  source: string;
  total: number;
  nome: string | null;
  critico: boolean;
  /** Posição (px do container) do ponto âncora, acima e centralizado no token. */
  left: number;
  top: number;
}

export function TokenRollCard({ source, total, nome, critico, left, top }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!critico) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) fireRollConfetti(r.left + r.width / 2, r.top + r.height / 2);
  }, [critico]);

  return (
    <motion.div
      ref={ref}
      className={`bc-token-roll${critico ? ' bc-token-roll--crit' : ''}`}
      style={{ position: 'absolute', left, top, x: '-50%', y: '-100%', zIndex: 11, pointerEvents: 'none' }}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <HeraldicFrame className="bc-token-roll__frame">
        <div className="bc-token-roll__body">
          {nome && <span className="bc-token-roll__name">{nome}</span>}
          <span className="bc-token-roll__line">
            <span className="bc-token-roll__src">{source}</span>
            <span className="bc-token-roll__total">{total}</span>
          </span>
        </div>
      </HeraldicFrame>
    </motion.div>
  );
}
