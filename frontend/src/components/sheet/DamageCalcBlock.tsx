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
import { Swords, Sparkles, ShieldOff, Droplet } from 'lucide-react';
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
      className="bc-rise-in"
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

      {/* Dano recebido — input largo e centralizado */}
      <div className="bc-field" style={{ marginBottom: 14 }}>
        <label htmlFor="dmg-raw" style={labelStyle}>DANO RECEBIDO</label>
        <input
          id="dmg-raw"
          type="number"
          min={0}
          value={damage || ''}
          onChange={(e) => setDamage(parseInt(e.target.value) || 0)}
          placeholder="0"
          className="bc-input bc-input--sm"
          style={{ height: 44, marginTop: 6, textAlign: 'center', fontFamily: 'var(--bc-font-mono)', fontSize: 20, letterSpacing: '0.04em' }}
        />
      </div>

      {/* Tipo de dano — segmentado, largura cheia */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <ToggleBtn
          active={type === 'PHYSICAL'}
          onClick={() => setType('PHYSICAL')}
          icon={<Swords size={13} />}
          label="Físico"
          big
          title={`Resistência física: ${physicalRes}`}
        />
        <ToggleBtn
          active={type === 'MAGICAL'}
          onClick={() => setType('MAGICAL')}
          icon={<Sparkles size={13} />}
          label="Mágico"
          big
          title={`Resistência mágica: ${magicalRes}`}
        />
      </div>

      {/* Divisor — pílulas ÷1 … ÷4 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
        {DIVISORS.map((d) => (
          <ToggleBtn
            key={d}
            active={divisor === d}
            onClick={() => setDivisor(d)}
            label={`÷${d}`}
            big
          />
        ))}
      </div>

      {/* Ignorar resistência */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginBottom: 14,
          cursor: 'pointer',
          fontSize: 12,
          color: ignoreRes ? 'var(--bc-gold-bright)' : 'var(--bc-ink-dim)',
        }}
      >
        <input
          type="checkbox"
          checked={ignoreRes}
          onChange={(e) => setIgnoreRes(e.target.checked)}
          style={{ accentColor: 'var(--bc-purple)', width: 15, height: 15 }}
        />
        <ShieldOff size={12} />
        Ignorar resistência
      </label>

      {/* Resultado — rótulo à esquerda, número grande à direita */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 12,
          paddingTop: 4,
        }}
        title={`(${damage} − ${res}) ÷ ${divisor} = ${effective}`}
      >
        <span style={labelStyle}>RESULTADO</span>
        <span
          className="bc-cinzel"
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            color: effective > 0 ? '#DC2626' : 'var(--bc-ink-faint)',
            textShadow: effective > 0 ? '0 0 18px rgba(220, 38, 38, 0.45)' : 'none',
          }}
        >
          {effective > 0 ? `−${effective}` : '0'}
        </span>
      </div>

      {/* Aplicar */}
      <button
        type="button"
        onClick={handleApply}
        disabled={!damage}
        style={{
          width: '100%',
          padding: '12px 12px',
          background: damage ? 'rgba(185, 28, 28, 0.18)' : 'rgba(26, 24, 32, 0.5)',
          border: `1px solid ${damage ? 'rgba(220, 38, 38, 0.5)' : 'var(--bc-edge)'}`,
          color: damage ? '#FCA5A5' : 'var(--bc-ink-faint)',
          borderRadius: 'var(--bc-radius-sm)',
          fontFamily: 'var(--bc-font-display)',
          fontSize: 12,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          cursor: damage ? 'pointer' : 'not-allowed',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: damage ? '0 0 20px rgba(185, 28, 28, 0.2)' : 'none',
          transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
        }}
        onMouseEnter={(e) => {
          if (damage) e.currentTarget.style.background = 'rgba(185, 28, 28, 0.3)';
        }}
        onMouseLeave={(e) => {
          if (damage) e.currentTarget.style.background = 'rgba(185, 28, 28, 0.18)';
        }}
      >
        <Droplet size={13} />
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

function ToggleBtn({ active, onClick, icon, label, big = false, title }: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  big?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: big ? '10px 8px' : '6px 8px',
        background: active ? 'color-mix(in srgb, var(--bc-purple) 22%, transparent)' : 'rgba(10, 5, 7, 0.5)',
        border: `1px solid ${active ? 'color-mix(in srgb, var(--bc-purple) 60%, transparent)' : 'var(--bc-edge)'}`,
        color: active ? 'color-mix(in srgb, var(--bc-purple) 35%, #ffffff)' : 'var(--bc-ink-dim)',
        borderRadius: 'var(--bc-radius-sm)',
        fontSize: big ? 12 : 10,
        fontFamily: 'var(--bc-font-display)',
        letterSpacing: '0.1em',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        boxShadow: active ? '0 0 16px color-mix(in srgb, var(--bc-purple) 22%, transparent)' : 'none',
        transition: 'all var(--bc-duration-fast) var(--bc-ease-out-quart)',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
