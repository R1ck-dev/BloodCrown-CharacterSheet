/**
 * BottomDock — versao mobile do LeftDock. Bottom-bar fixa no rodape com
 * 3 acoes (AcOes / Dano / Ativos) que abrem o respectivo BottomSheet.
 *
 * Diferencas pro DesktopDock:
 *   - So 1 painel aberto por vez (mobile nao da pra empilhar paineis flutuantes).
 *   - Botoes ficam horizontais no rodape, polegar-friendly.
 *   - Paineis sao BottomSheet (slide-up + drag-dismiss + focus trap).
 *
 * Recebe os mesmos props do LeftDock.
 */
import { useEffect, useState } from 'react';
import { Swords, Calculator, Zap } from 'lucide-react';
import type { Ability, CustomSkill } from '@/types/character';
import { ActionPoolBlock } from './ActionPoolBlock';
import { DamageCalcBlock } from './DamageCalcBlock';
import { ActiveEffectsBlock } from './ActiveEffectsBlock';
import { BottomSheet } from './BottomSheet';

type PanelKey = 'actions' | 'damage' | 'effects';

const PANEL_TITLES: Record<PanelKey, string> = {
  actions: 'AÇÕES DO TURNO',
  damage: 'CALCULADORA DE DANO',
  effects: 'EFEITOS ATIVOS',
};

interface Props {
  characterId: string;
  activeAbilities: Ability[];
  onAdvanceTurn: () => void;
  isAdvancing: boolean;
  customSkills: CustomSkill[];
}

export function BottomDock({ characterId, activeAbilities, onAdvanceTurn, isAdvancing, customSkills }: Props) {
  const [open, setOpen] = useState<PanelKey | null>(null);
  const hasEffects = activeAbilities.length > 0;

  // Se zerar habilidades ativas com o sheet aberto, fecha.
  useEffect(() => {
    if (!hasEffects && open === 'effects') setOpen(null);
  }, [hasEffects, open]);

  const toggle = (key: PanelKey) => setOpen((prev) => (prev === key ? null : key));

  return (
    <>
      {/* Bottom-bar fixa */}
      <nav
        aria-label="Açoes rapidas do personagem"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: 56,
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--bc-oled) 95%, transparent), color-mix(in srgb, var(--bc-oled) 100%, transparent))',
          borderTop: '1px solid var(--bc-edge-strong)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'stretch',
          zIndex: 'var(--bc-z-fixed)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Hairline dourada superior */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -1,
            left: 0,
            right: 0,
            height: 1,
            background:
              'linear-gradient(90deg, transparent, color-mix(in srgb, var(--bc-gold) 50%, transparent), transparent)',
          }}
        />

        <DockBarButton
          label="AÇÕES"
          icon={<Swords size={18} />}
          active={open === 'actions'}
          onClick={() => toggle('actions')}
        />
        <DockBarButton
          label="DANO"
          icon={<Calculator size={18} />}
          active={open === 'damage'}
          onClick={() => toggle('damage')}
        />
        {hasEffects && (
          <DockBarButton
            label="ATIVOS"
            icon={<Zap size={18} />}
            active={open === 'effects'}
            onClick={() => toggle('effects')}
            badge={activeAbilities.length}
          />
        )}
      </nav>

      {/* BottomSheet do painel ativo */}
      <BottomSheet
        isOpen={open !== null}
        onClose={() => setOpen(null)}
        title={open ? PANEL_TITLES[open] : ''}
      >
        {open === 'actions' && <ActionPoolBlock characterId={characterId} chrome="bare" />}
        {open === 'damage' && <DamageCalcBlock chrome="bare" />}
        {open === 'effects' && (
          <ActiveEffectsBlock
            activeAbilities={activeAbilities}
            onAdvanceTurn={onAdvanceTurn}
            isAdvancing={isAdvancing}
            customSkills={customSkills}
          />
        )}
      </BottomSheet>
    </>
  );
}

function DockBarButton({
  label,
  icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: React.ReactNode;
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
        flex: 1,
        position: 'relative',
        background: active
          ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.18), rgba(123, 44, 191, 0.12))'
          : 'transparent',
        border: 'none',
        color: active ? 'var(--bc-gold-bright)' : 'var(--bc-gold-dim)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        cursor: 'pointer',
        minHeight: 44,
        transition: 'color var(--bc-duration-fast) var(--bc-ease-out-quart)',
      }}
    >
      {icon}
      <span
        className="bc-cinzel"
        style={{ fontSize: 9, letterSpacing: '0.15em', fontWeight: 600 }}
      >
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          aria-label={`${badge} ativo(s)`}
          style={{
            position: 'absolute',
            top: 4,
            right: 'calc(50% - 22px)',
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
            boxShadow: '0 0 0 1px rgba(14, 10, 18, 0.95)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
