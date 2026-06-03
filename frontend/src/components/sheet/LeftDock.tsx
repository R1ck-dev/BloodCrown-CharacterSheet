/**
 * LeftDock — dispatcher responsivo. Decide qual variante renderizar baseado
 * no breakpoint atual:
 *   - mobile  : <BottomDock /> (bottom-bar fixa + BottomSheet pros paineis)
 *   - tablet  : <DesktopDock /> (cluster lateral + FloatingPanels arrastaveis)
 *   - desktop : <DesktopDock />
 *
 * DesktopDock = comportamento original do LeftDock (cluster left:0;top:50% +
 * paineis arrastaveis com z-index dinamico). Mantido sem mudancas pra preservar
 * UX desktop intocada.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { Swords, Calculator, Zap, ChevronRight, X } from 'lucide-react';
import type { Ability, CustomSkill } from '@/types/character';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ActionPoolBlock } from './ActionPoolBlock';
import { DamageCalcBlock } from './DamageCalcBlock';
import { ActiveEffectsBlock } from './ActiveEffectsBlock';
import { BottomDock } from './BottomDock';

type PanelKey = 'actions' | 'damage' | 'effects';

interface Props {
  characterId: string;
  activeAbilities: Ability[];
  onAdvanceTurn: () => void;
  isAdvancing: boolean;
  customSkills: CustomSkill[];
}

const PANEL_WIDTH = 320;
const PANEL_TITLES: Record<PanelKey, string> = {
  actions: 'AÇÕES DO TURNO',
  damage: 'CALCULADORA DE DANO',
  effects: 'EFEITOS ATIVOS',
};

export function LeftDock(props: Props) {
  const bp = useBreakpoint();
  return bp === 'mobile' ? <BottomDock {...props} /> : <DesktopDock {...props} />;
}

function DesktopDock({ characterId, activeAbilities, onAdvanceTurn, isAdvancing, customSkills }: Props) {
  // Ordem de abertura: ESTAVEL no DOM (nao reordena no focus pra nao perder pointer capture).
  // Cada item entra append-only. Saida via close/toggle preserva ordem dos restantes.
  const [open, setOpen] = useState<PanelKey[]>([]);
  // Z-index dinamico: painel mais recentemente clicado fica no topo (sem mexer no DOM).
  const [topFocused, setTopFocused] = useState<PanelKey | null>(null);

  // Se as habilidades ativas zerarem, fecha o painel de efeitos se estiver aberto.
  useEffect(() => {
    if (activeAbilities.length === 0) {
      setOpen((prev) => prev.filter((k) => k !== 'effects'));
    }
  }, [activeAbilities.length]);

  const toggle = useCallback((key: PanelKey) => {
    setOpen((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    setTopFocused(key);
  }, []);

  const close = useCallback((key: PanelKey) => {
    setOpen((prev) => prev.filter((k) => k !== key));
    setTopFocused((prev) => (prev === key ? null : prev));
  }, []);

  /** Eleva o painel pro topo via z-index — NAO reordena o DOM (preserva pointer capture). */
  const focus = useCallback((key: PanelKey) => {
    setTopFocused((prev) => (prev === key ? prev : key));
  }, []);

  // Esc fecha todos.
  useEffect(() => {
    if (open.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen([]);
        setTopFocused(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open.length]);

  const hasEffects = activeAbilities.length > 0;

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
          active={open.includes('actions')}
          onClick={() => toggle('actions')}
        />
        <DockButton
          label="DANO"
          icon={<Calculator size={14} />}
          active={open.includes('damage')}
          onClick={() => toggle('damage')}
        />
        {hasEffects && (
          <DockButton
            label="ATIVOS"
            icon={<Zap size={14} />}
            active={open.includes('effects')}
            onClick={() => toggle('effects')}
            badge={activeAbilities.length}
          />
        )}
      </div>

      {/* Paineis arrastaveis */}
      <AnimatePresence>
        {open.map((key, idx) => (
          <FloatingPanel
            key={key}
            title={PANEL_TITLES[key]}
            stackIndex={idx}
            zIndex={key === topFocused ? 1000 + open.length : 1000 + idx}
            onClose={() => close(key)}
            onFocus={() => focus(key)}
          >
            {key === 'actions' && <ActionPoolBlock characterId={characterId} chrome="bare" />}
            {key === 'damage' && <DamageCalcBlock chrome="bare" />}
            {key === 'effects' && (
              <ActiveEffectsBlock
                activeAbilities={activeAbilities}
                onAdvanceTurn={onAdvanceTurn}
                isAdvancing={isAdvancing}
                customSkills={customSkills}
              />
            )}
          </FloatingPanel>
        ))}
      </AnimatePresence>
    </>
  );
}

function DockButton({
  label,
  icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={active}
      style={{
        position: 'relative',
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
      {badge !== undefined && badge > 0 && (
        <span
          aria-label={`${badge} ativo(s)`}
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 16,
            height: 16,
            padding: '0 4px',
            background: 'var(--bc-blood-bright)',
            color: '#fff',
            fontSize: 9,
            fontFamily: 'var(--bc-font-display)',
            fontWeight: 700,
            borderRadius: 'var(--bc-radius-pill)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(14,10,18,0.95)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function FloatingPanel({
  title,
  stackIndex,
  zIndex,
  onClose,
  onFocus,
  children,
}: {
  title: string;
  stackIndex: number;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
  children: ReactNode;
}) {
  const dragControls = useDragControls();
  const asideRef = useRef<HTMLElement>(null);

  // Posicao inicial cascateada — TRAVADA no primeiro render. Se recalcular depois
  // (por mudanca de stackIndex via reorder de z-index), o anchor CSS muda mas o
  // transform do drag fica relativo a posicao antiga, fazendo o painel "saltar"
  // ao ser agarrado de novo. Lazy initializer garante calculo unico no mount.
  const [initialPos] = useState(() => ({
    left: 56 + stackIndex * 24,
    top: (typeof window !== 'undefined' ? window.innerHeight * 0.15 : 100) + stackIndex * 24,
  }));

  // Sem dragConstraints: o painel pode ser solto em qualquer ponto da viewport,
  // inclusive parcialmente fora. Se "perder" o painel arrastando longe demais,
  // fechar (X) + reabrir (botao do dock) recria na posicao inicial cascateada
  // (lazy initializer no mount). Page sandbox: nao da pra sair do navegador.

  return (
    <motion.aside
      ref={asideRef}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={onFocus}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      aria-label={title}
      style={{
        position: 'fixed',
        left: initialPos.left,
        top: initialPos.top,
        width: PANEL_WIDTH,
        maxHeight: '80vh',
        background: 'linear-gradient(180deg, rgba(26,24,32,0.97), rgba(14,10,18,0.97))',
        border: '1px solid var(--bc-edge)',
        borderRadius: 'var(--bc-radius-md)',
        boxShadow: 'var(--bc-shadow-lg), inset 0 1px 0 rgba(212,175,55,0.08)',
        backdropFilter: 'blur(8px)',
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header (handle de drag) */}
      <header
        onPointerDown={(e) => dragControls.start(e)}
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--bc-edge)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(180deg, rgba(212,175,55,0.10), transparent)',
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
        onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
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
          onPointerDown={(e) => e.stopPropagation()}
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
        style={{ padding: '8px 14px 14px', overflowY: 'auto', flex: 1, minHeight: 0 }}
      >
        {children}
      </div>
    </motion.aside>
  );
}
