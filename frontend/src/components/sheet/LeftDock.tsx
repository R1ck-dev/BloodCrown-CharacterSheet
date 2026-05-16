/**
 * LeftDock — 2 docks flutuantes recolhidos no canto esquerdo da Sheet.
 * Cada um expande pra mostrar um painel contendo o bloco original
 * (ActionPoolBlock ou DamageCalcBlock) em modo `bare` (sem chrome duplo).
 *
 * UX:
 *   - Botões empilhados verticalmente, centralizados na altura da viewport.
 *   - Só um painel aberto por vez (clicar outro fecha o atual).
 *   - X no header fecha. ESC também (via document listener).
 *   - Slide-in/out da esquerda com motion.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Swords, Calculator, ChevronRight, X } from 'lucide-react';
import { ActionPoolBlock } from './ActionPoolBlock';
import { DamageCalcBlock } from './DamageCalcBlock';

type PanelKey = 'actions' | 'damage' | null;

interface Props {
  characterId: string;
}

export function LeftDock({ characterId }: Props) {
  const [open, setOpen] = useState<PanelKey>(null);

  // Esc fecha painel aberto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Cluster de botões — sempre visível, empilhado vertical */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 999,
        }}
      >
        <DockButton
          label="AÇÕES"
          icon={<Swords size={14} />}
          active={open === 'actions'}
          onClick={() => setOpen(open === 'actions' ? null : 'actions')}
        />
        <DockButton
          label="DANO"
          icon={<Calculator size={14} />}
          active={open === 'damage'}
          onClick={() => setOpen(open === 'damage' ? null : 'damage')}
        />
      </div>

      {/* Painel expandido */}
      <AnimatePresence>
        {open === 'actions' && (
          <FloatingPanel key="actions" title="AÇÕES DO TURNO" onClose={() => setOpen(null)}>
            <ActionPoolBlock characterId={characterId} chrome="bare" />
          </FloatingPanel>
        )}
        {open === 'damage' && (
          <FloatingPanel key="damage" title="CALCULADORA DE DANO" onClose={() => setOpen(null)}>
            <DamageCalcBlock chrome="bare" />
          </FloatingPanel>
        )}
      </AnimatePresence>
    </>
  );
}

function DockButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={active}
      style={{
        padding: '12px 8px',
        background: active
          ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.25), rgba(123, 44, 191, 0.18))'
          : 'linear-gradient(180deg, rgba(26,24,32,0.95), rgba(14,10,18,0.95))',
        border: '1px solid var(--bc-edge)',
        borderLeft: 'none',
        borderRadius: '0 var(--bc-radius-md) var(--bc-radius-md) 0',
        color: active ? 'var(--bc-gold-bright)' : 'var(--bc-gold-dim)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        boxShadow: 'var(--bc-shadow-md)',
        backdropFilter: 'blur(8px)',
        transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--bc-gold-bright)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--bc-gold-dim)';
      }}
    >
      {icon}
      <span
        className="bc-cinzel"
        style={{
          fontSize: 9,
          letterSpacing: '0.15em',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </button>
  );
}

function FloatingPanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <motion.aside
      initial={{ x: -340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -340, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      aria-label={title}
      style={{
        position: 'fixed',
        left: 56,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 320,
        maxHeight: '80vh',
        background: 'linear-gradient(180deg, rgba(26,24,32,0.97), rgba(14,10,18,0.97))',
        border: '1px solid var(--bc-edge)',
        borderRadius: 'var(--bc-radius-md)',
        boxShadow: 'var(--bc-shadow-lg), inset 0 1px 0 rgba(212,175,55,0.08)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--bc-edge)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(180deg, rgba(212,175,55,0.10), transparent)',
        }}
      >
        <span style={{ color: 'var(--bc-gold)', fontSize: 12 }} aria-hidden="true">✦</span>
        <h2
          className="bc-cinzel bc-tracked"
          style={{ fontSize: 11, color: 'var(--bc-gold-bright)', fontWeight: 600, margin: 0, flex: 1 }}
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel"
          style={{
            background: 'transparent',
            border: '1px solid var(--bc-edge)',
            color: 'var(--bc-ink-dim)',
            width: 24,
            height: 24,
            borderRadius: 'var(--bc-radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--bc-gold-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--bc-ink-dim)')}
        >
          <X size={12} />
        </button>
        <span aria-hidden="true" style={{ color: 'var(--bc-ink-faint)' }}>
          <ChevronRight size={11} />
        </span>
      </header>

      {/* Conteúdo (scroll) */}
      <div
        className="bc-scroll"
        style={{ padding: '8px 14px 14px', overflowY: 'auto', flex: 1 }}
      >
        {children}
      </div>
    </motion.aside>
  );
}
