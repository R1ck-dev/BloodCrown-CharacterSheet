/**
 * DiceToast — painel deslizando da direita inferior.
 *
 * Fluxo de animacao:
 *  1. Recebe roll via subscribeRoll
 *  2. Slide-in (motion) + spin de 1500ms (intervalo de 80ms trocando
 *     numeros aleatorios)
 *  3. Resolve nos numeros reais com um pop visual (scale 1.3 -> 1)
 *  4. Se isCriticalSuccess: border dourada + shake + confetti CSS no
 *     overlay + canvas-confetti burst central dourado
 *  5. Se isHeavyHit (dano > metade da soma maxima possivel): shake + flash sangue
 *  6. Auto-fecha em 8s. Hover pausa o timer.
 *
 * Subscribe externa via rollBus — desacopla useDiceRoll da renderizacao.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Dice5, X, Sword } from 'lucide-react';
import { subscribeRoll } from '@/lib/rollBus';
import { playSound } from '@/lib/sound';
import { getConfettiPalette } from '@/lib/themePalette';
import type { AttributeRoll, DamageRoll, RollResult } from '@/lib/dice';

const AUTO_CLOSE_MS = 8000;
const SPIN_DURATION = 1500;
const SPIN_INTERVAL = 80;

export function DiceToast() {
  const [roll, setRoll] = useState<RollResult | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinNumbers, setSpinNumbers] = useState<number[]>([]);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeRoll((newRoll) => {
      // Limpa timers de uma rolagem anterior
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);

      setRoll(newRoll);
      setSpinning(true);

      // Spin loop
      const maxFace = newRoll.kind === 'damage' ? newRoll.maxFace : 20;
      spinTimerRef.current = setInterval(() => {
        setSpinNumbers(
          newRoll.rolls.map(() => Math.ceil(Math.random() * maxFace)),
        );
      }, SPIN_INTERVAL);

      // Resolve numeros reais apos spin
      settleTimerRef.current = setTimeout(() => {
        if (spinTimerRef.current) clearInterval(spinTimerRef.current);
        setSpinning(false);

        // Som + confetti no momento em que o numero real e revelado.
        // Prioridade: critico > golpe pesado > rolagem comum (1 som por rolagem).
        if (newRoll.kind === 'attribute' && newRoll.isCriticalSuccess) {
          fireGoldConfetti();
          playSound('crit');
        } else if (newRoll.kind === 'damage' && newRoll.isHeavyHit) {
          playSound('heavy');
        } else {
          playSound('dice');
        }
      }, SPIN_DURATION);

      // Auto-close
      closeTimerRef.current = setTimeout(() => {
        setRoll(null);
      }, AUTO_CLOSE_MS);
    });

    return () => {
      unsubscribe();
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const close = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setRoll(null);
  };

  const pauseClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const resumeClose = () => {
    closeTimerRef.current = setTimeout(() => setRoll(null), 3000);
  };

  return (
    <AnimatePresence>
      {roll && (
        <motion.div
          initial={{ x: '120%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '120%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          onMouseEnter={pauseClose}
          onMouseLeave={resumeClose}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 360,
            zIndex: 'var(--bc-z-toast)',
          }}
        >
          <ToastBody
            roll={roll}
            spinning={spinning}
            spinNumbers={spinNumbers}
            onClose={close}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToastBody({
  roll,
  spinning,
  spinNumbers,
  onClose,
}: {
  roll: RollResult;
  spinning: boolean;
  spinNumbers: number[];
  onClose: () => void;
}) {
  const isCrit = roll.kind === 'attribute' && roll.isCriticalSuccess && !spinning;
  const isHeavy = roll.kind === 'damage' && roll.isHeavyHit && !spinning;

  // accentColor entra em <SvgIcon color={...}> e em string-concat (`${color}cc`),
  // ambos NAO suportam var() — mantemos hex direto. Aceita ficar fora do tema.
  const accentColor = isCrit ? '#F5D76E' : roll.kind === 'damage' ? '#FCA5A5' : '#9D4EDD';
  const stripeColor = isCrit
    ? 'var(--bc-gold-bright)'
    : roll.kind === 'damage'
      ? 'var(--bc-blood)'
      : 'var(--bc-purple)';
  const titleText =
    isCrit
      ? `CRITICO NATURAL · 20`
      : roll.kind === 'damage'
        ? isHeavy
          ? `GOLPE PESADO`
          : 'ROLAGEM DE DANO'
        : 'TESTE';

  return (
    <div
      className={isHeavy ? 'bc-shake' : ''}
      style={{
        background: isCrit
          ? 'linear-gradient(180deg, rgba(40, 28, 8, 0.96), rgba(20, 14, 6, 0.98))'
          : 'linear-gradient(180deg, rgba(26, 24, 32, 0.96), rgba(14, 10, 18, 0.98))',
        border: isCrit ? '1px solid rgba(212, 175, 55, 0.6)' : '1px solid var(--bc-edge)',
        borderLeft: `3px solid ${stripeColor}`,
        borderRadius: 'var(--bc-radius-md)',
        boxShadow: isCrit
          ? '0 20px 60px -10px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.25)'
          : '0 20px 60px -10px rgba(123, 44, 191, 0.5)',
        overflow: 'hidden',
        position: 'relative',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Confetti CSS overlay no critico */}
      {isCrit && <CritConfettiOverlay />}

      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--bc-edge)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {isHeavy ? (
            <Sword size={12} color={accentColor} />
          ) : (
            <Dice5 size={12} color={accentColor} />
          )}
          <span
            className="bc-cinzel bc-tracked"
            style={{ fontSize: 10, fontWeight: 600, color: accentColor }}
          >
            {titleText}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--bc-ink-faint)',
            cursor: 'pointer',
            padding: 2,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              color: 'var(--bc-ink-dim)',
              marginBottom: 4,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {roll.source}
          </div>
          <div
            className="bc-mono"
            style={{
              fontSize: 13,
              color: 'var(--bc-ink)',
              marginBottom: 6,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: 'var(--bc-ink-dim)' }}>Dados:</span>{' '}
            <span style={{ color: 'var(--bc-ink-dim)' }}>[</span>
            {(spinning ? spinNumbers : roll.rolls).map((n, i) => (
              <span key={i}>
                {i > 0 && <span style={{ color: 'var(--bc-ink-dim)' }}>, </span>}
                <span>{n}</span>
              </span>
            ))}
            <span style={{ color: 'var(--bc-ink-dim)' }}>]</span>
          </div>
          {roll.kind === 'attribute' ? (
            <AttributeDetails roll={roll} spinning={spinning} />
          ) : (
            <DamageDetails roll={roll} />
          )}
        </div>

        <motion.div
          key={`${spinning}-${roll.total}`}
          initial={{ scale: spinning ? 1 : 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{ textAlign: 'center' }}
        >
          <div
            className="bc-cinzel"
            style={{
              fontFamily: 'var(--bc-font-display)',
              fontWeight: 700,
              fontSize: 52,
              lineHeight: 0.95,
              color: isCrit
                ? 'var(--bc-gold-bright)'
                : roll.kind === 'damage'
                  ? 'var(--bc-blood-bright)'
                  : 'var(--bc-purple-soft)',
              textShadow: isCrit
                ? '0 0 24px color-mix(in srgb, var(--bc-gold-bright) 80%, transparent), 0 0 48px color-mix(in srgb, var(--bc-gold) 50%, transparent)'
                : '0 0 24px color-mix(in srgb, var(--bc-purple-hover) 60%, transparent), 0 4px 8px rgba(0,0,0,0.6)',
            }}
          >
            {spinning ? spinPreview(roll, spinNumbers) : roll.total}
          </div>
          <div
            className="bc-cinzel bc-tracked"
            style={{ fontSize: 9, color: isCrit ? 'var(--bc-gold-bright)' : 'var(--bc-gold-dim)', marginTop: -2 }}
          >
            {isCrit ? 'TRIUNFO' : 'TOTAL'}
          </div>
        </motion.div>
      </div>

      {/* Progress bar */}
      <CountdownBar duration={AUTO_CLOSE_MS} accentColor={accentColor} />
    </div>
  );
}

function spinPreview(roll: RollResult, spinNumbers: number[]): number {
  if (spinNumbers.length === 0) return roll.total;
  if (roll.kind === 'attribute') {
    return Math.max(...spinNumbers) + roll.bonus;
  }
  // damage: soma com sinal preservado
  const sum = spinNumbers.reduce((acc, n, i) => acc + (roll.rolls[i] >= 0 ? n : -n), 0);
  return sum + roll.modifier;
}

function AttributeDetails({ roll, spinning }: { roll: AttributeRoll; spinning: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
      <span>
        <span style={{ color: 'var(--bc-ink-dim)' }}>Maior: </span>
        <span style={{ color: 'var(--bc-gold-bright)', fontWeight: 600 }}>{spinning ? '?' : roll.best}</span>
      </span>
      {roll.bonus !== 0 && (
        <span>
          <span style={{ color: 'var(--bc-ink-dim)' }}>Bonus: </span>
          <span style={{ color: 'var(--bc-ink)' }}>
            {roll.bonus >= 0 ? '+' : ''}
            {roll.bonus}
          </span>
        </span>
      )}
    </div>
  );
}

function DamageDetails({ roll }: { roll: DamageRoll }) {
  return (
    <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
      <span>
        <span style={{ color: 'var(--bc-ink-dim)' }}>Dados: </span>
        <span className="bc-mono" style={{ color: 'var(--bc-ink)' }}>
          {roll.rolls.length}
        </span>
      </span>
      {roll.modifier !== 0 && (
        <span>
          <span style={{ color: 'var(--bc-ink-dim)' }}>Mod: </span>
          <span style={{ color: 'var(--bc-ink)' }}>
            {roll.modifier >= 0 ? '+' : ''}
            {roll.modifier}
          </span>
        </span>
      )}
    </div>
  );
}

function CountdownBar({ duration, accentColor }: { duration: number; accentColor: string }) {
  return (
    <motion.div
      initial={{ width: '100%' }}
      animate={{ width: '0%' }}
      transition={{ duration: duration / 1000, ease: 'linear' }}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 2,
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
        boxShadow: `0 0 6px ${accentColor}99`,
      }}
    />
  );
}

function CritConfettiOverlay() {
  // 16 particulas tematicas caindo do topo do toast
  const palette = getConfettiPalette();
  const colors = [palette.secondary, palette.primary, palette.accent, palette.primary];
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: -20,
            left: `${(i * 6.5) % 100}%`,
            width: 6,
            height: 6,
            background: colors[i % colors.length],
            boxShadow: `0 0 6px ${colors[i % colors.length]}`,
            borderRadius: 1,
            animation: `bc-confetti-fall 1.6s linear forwards`,
            animationDelay: `${(i % 5) * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

function fireGoldConfetti() {
  // Burst tematico (primary/secondary/accent) central + dois laterais
  const palette = getConfettiPalette();
  const colors = [palette.primary, palette.secondary, palette.accent, palette.secondary];
  confetti({
    particleCount: 80,
    spread: 90,
    startVelocity: 40,
    colors,
    origin: { x: 0.85, y: 0.85 },
    scalar: 1.2,
    zIndex: 10000,
  });
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 60,
      angle: 120,
      colors,
      origin: { x: 0.95, y: 0.75 },
      zIndex: 10000,
    });
  }, 150);
}
