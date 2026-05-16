/**
 * Bloco CALCULADORA DE DANO — recebe valor cru, aplica resistência (física/mágica
 * com opção de ignorar) e divisor (esquiva/redução). Fórmula:
 *
 *   dano_efetivo = max(0, floor((dano − res) / divisor))
 *
 * Botão "Aplicar" debita do status.currentHealth (cap em 0). Auto-save persiste.
 * Estado interno (dano/tipo/divisor/ignora) não vai no form — só o resultado.
 */
import { useState, type CSSProperties } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { Swords, Sparkles, Calculator, ShieldOff } from 'lucide-react';
import type { CharacterSheet } from '@/types/character';

type DamageType = 'PHYSICAL' | 'MAGICAL';

const DIVISORS = [1, 2, 3, 4] as const;

interface Props {
  /** 'card' (default) = wrapper section com border/background/marginTop;
   *  'bare' = sem chrome externo (usado quando vai dentro do LeftDock). */
  chrome?: 'card' | 'bare';
}

export function DamageCalcBlock({ chrome = 'card' }: Props = {}) {
  const bare = chrome === 'bare';
  const { watch, setValue } = useFormContext<CharacterSheet>();
  const physicalRes = watch('status.physicalRes') ?? 0;
  const magicalRes  = watch('status.magicalRes') ?? 0;
  const currentHealth = watch('status.currentHealth') ?? 0;

  const [damage, setDamage] = useState<number>(0);
  const [type, setType] = useState<DamageType>('PHYSICAL');
  const [divisor, setDivisor] = useState<number>(1);
  const [ignoreRes, setIgnoreRes] = useState<boolean>(false);

  const res = ignoreRes ? 0 : type === 'PHYSICAL' ? physicalRes : magicalRes;
  const effective = Math.max(0, Math.floor((damage - res) / divisor));

  const handleApply = () => {
    if (effective <= 0) {
      toast.info('Dano efetivo zero — resistência absorveu tudo.');
      setDamage(0);
      return;
    }
    const newHealth = Math.max(0, currentHealth - effective);
    setValue('status.currentHealth', newHealth, { shouldDirty: true });
    toast.success(`−${effective} HP`);
    setDamage(0);
  };

  return (
    <section
      style={{
        padding: bare ? '4px 0 0' : '14px 16px 14px',
        marginTop: bare ? 0 : 14,
        background: bare ? 'transparent' : 'var(--bc-gradient-surface)',
        border: bare ? 'none' : '1px solid var(--bc-edge)',
        borderRadius: bare ? 0 : 'var(--bc-radius-md)',
      }}
    >
      {!bare && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid var(--bc-edge)',
          }}
        >
          <span style={{ color: 'var(--bc-gold)', fontSize: 12 }} aria-hidden="true">✦</span>
          <h2
            className="bc-cinzel bc-tracked"
            style={{ fontSize: 11, color: 'var(--bc-gold-bright)', fontWeight: 600, margin: 0, flex: 1 }}
          >
            CALCULADORA DE DANO
          </h2>
          <span
            aria-hidden="true"
            style={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)',
            }}
          />
        </header>
      )}

      {/* Dano cru */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div className="bc-field">
          <label htmlFor="dmg-raw" style={labelStyle}>DANO RECEBIDO</label>
          <input
            id="dmg-raw"
            type="number"
            min={0}
            value={damage || ''}
            onChange={(e) => setDamage(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="bc-input bc-input--sm"
            style={{ height: 32, textAlign: 'center', fontFamily: 'var(--bc-font-mono)', fontSize: 14 }}
          />
        </div>
        <div className="bc-field">
          <label style={labelStyle}>RESULTADO</label>
          <div
            className="bc-cinzel"
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10, 5, 7, 0.6)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: 'var(--bc-radius-sm)',
              color: effective > 0 ? '#FCA5A5' : 'var(--bc-ink-faint)',
              fontSize: 16,
              fontWeight: 700,
            }}
            title={`(${damage} − ${res}) ÷ ${divisor} = ${effective}`}
          >
            {effective > 0 ? `−${effective}` : '0'}
          </div>
        </div>
      </div>

      {/* Tipo de dano */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ ...labelStyle, marginBottom: 4 }}>TIPO</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <ToggleBtn
            active={type === 'PHYSICAL'}
            onClick={() => setType('PHYSICAL')}
            icon={<Swords size={11} />}
            label={`Físico (${physicalRes})`}
          />
          <ToggleBtn
            active={type === 'MAGICAL'}
            onClick={() => setType('MAGICAL')}
            icon={<Sparkles size={11} />}
            label={`Mágico (${magicalRes})`}
          />
        </div>
      </div>

      {/* Divisor */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ ...labelStyle, marginBottom: 4 }}>DIVISOR</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {DIVISORS.map((d) => (
            <ToggleBtn
              key={d}
              active={divisor === d}
              onClick={() => setDivisor(d)}
              label={`÷${d}`}
            />
          ))}
        </div>
      </div>

      {/* Ignorar resistência */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          cursor: 'pointer',
          fontSize: 11,
          color: ignoreRes ? 'var(--bc-gold-bright)' : 'var(--bc-ink-dim)',
        }}
      >
        <input
          type="checkbox"
          checked={ignoreRes}
          onChange={(e) => setIgnoreRes(e.target.checked)}
          style={{ accentColor: 'var(--bc-gold)' }}
        />
        <ShieldOff size={11} />
        Ignorar resistência
      </label>

      {/* Aplicar */}
      <button
        type="button"
        onClick={handleApply}
        disabled={!damage}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: damage ? 'rgba(185, 28, 28, 0.18)' : 'rgba(26, 24, 32, 0.5)',
          border: `1px solid ${damage ? 'rgba(220, 38, 38, 0.5)' : 'var(--bc-edge)'}`,
          color: damage ? '#FCA5A5' : 'var(--bc-ink-faint)',
          borderRadius: 'var(--bc-radius-sm)',
          fontFamily: 'var(--bc-font-display)',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          cursor: damage ? 'pointer' : 'not-allowed',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
        }}
        onMouseEnter={(e) => {
          if (damage) e.currentTarget.style.background = 'rgba(185, 28, 28, 0.3)';
        }}
        onMouseLeave={(e) => {
          if (damage) e.currentTarget.style.background = 'rgba(185, 28, 28, 0.18)';
        }}
      >
        <Calculator size={12} />
        Aplicar Dano
      </button>
    </section>
  );
}

const labelStyle: CSSProperties = {
  fontFamily: 'var(--bc-font-display)',
  fontSize: 9,
  color: 'var(--bc-gold-dim)',
  letterSpacing: '0.15em',
};

function ToggleBtn({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 8px',
        background: active ? 'rgba(212, 175, 55, 0.15)' : 'rgba(10, 5, 7, 0.5)',
        border: `1px solid ${active ? 'rgba(212, 175, 55, 0.5)' : 'var(--bc-edge)'}`,
        color: active ? 'var(--bc-gold-bright)' : 'var(--bc-ink-dim)',
        borderRadius: 'var(--bc-radius-sm)',
        fontSize: 10,
        fontFamily: 'var(--bc-font-display)',
        letterSpacing: '0.1em',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
