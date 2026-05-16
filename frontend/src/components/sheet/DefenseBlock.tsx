/**
 * Bloco DEFESA — escudo SVG com CA computada + formula visivel
 * BASE + DES + ARM + OUT + resistencias fisica/magica.
 *
 * Formula final: defenseBase + (destreza + buffAttrDestreza) +
 *                (armorBonus + buffDefArmor) +
 *                (otherBonus  + buffDefOther)
 *
 * Persistencia: SheetPage sincroniza status.defense no save (computa
 * a partir destes mesmos valores). Aqui mostramos o live total.
 */
import { useFormContext, useWatch } from 'react-hook-form';
import type { CharacterSheet } from '@/types/character';
import { DefenseShield } from './DefenseShield';
import { Divider } from '@/components/ornaments/Divider';

interface Props {
  buffs: Map<string, number>;
}

export function DefenseBlock({ buffs }: Props) {
  const { control, register } = useFormContext<CharacterSheet>();

  // Watch fields necessarios pro calculo. Defaults definidos
  // pra evitar NaN no primeiro render antes do reset().
  const [destreza, defenseBase, armorBonus, otherBonus] = useWatch({
    control,
    name: ['attributes.destreza', 'status.defenseBase', 'status.armorBonus', 'status.otherBonus'],
  });

  const dexBuffed = (Number(destreza) || 0) + (buffs.get('attrDestreza') ?? 0);
  const armorBuffed = (Number(armorBonus) || 0) + (buffs.get('defArmor') ?? 0);
  const otherBuffed = (Number(otherBonus) || 0) + (buffs.get('defOther') ?? 0);
  const base = Number(defenseBase) || 0;
  const total = base + dexBuffed + armorBuffed + otherBuffed;

  const inputStyle: React.CSSProperties = {
    background: 'rgba(10, 5, 7, 0.6)',
    border: '1px solid rgba(212, 175, 55, 0.12)',
    padding: '6px 8px',
    borderRadius: 'var(--bc-radius-sm)',
    fontFamily: 'var(--bc-font-display)',
    fontSize: 14,
    color: 'var(--bc-ink)',
    fontWeight: 600,
    textAlign: 'center',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--bc-font-display)',
    fontSize: 9,
    color: 'var(--bc-gold-dim)',
    letterSpacing: '0.15em',
  };

  return (
    <section
      style={{
        padding: '18px 18px 22px',
        marginTop: 14,
        background: 'var(--bc-gradient-surface)',
        border: '1px solid var(--bc-edge)',
        borderRadius: 'var(--bc-radius-md)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
          paddingBottom: 8,
          borderBottom: '1px solid var(--bc-edge)',
        }}
      >
        <span style={{ color: 'var(--bc-gold)', fontSize: 12 }} aria-hidden="true">
          ✦
        </span>
        <h2
          className="bc-cinzel bc-tracked"
          style={{ fontSize: 11, color: 'var(--bc-gold-bright)', fontWeight: 600, margin: 0, flex: 1 }}
        >
          DEFESA
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

      {/* Escudo + 4 chips de formula */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <DefenseShield total={total} />

        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          {/* BASE — editavel */}
          <FormulaChip label="BASE">
            <input
              type="number"
              {...register('status.defenseBase', { valueAsNumber: true })}
              style={{ ...inputStyle, padding: 0, height: 18, fontSize: 13 }}
              aria-label="Defesa base"
            />
          </FormulaChip>

          {/* DES — derivado */}
          <FormulaChip label="DES">
            <span
              className="bc-cinzel"
              style={{
                fontSize: 13,
                color: dexBuffed !== (Number(destreza) || 0) ? 'var(--bc-gold-bright)' : 'var(--bc-ink)',
                fontWeight: 600,
              }}
              title={
                dexBuffed !== (Number(destreza) || 0)
                  ? `${destreza || 0} + ${buffs.get('attrDestreza') ?? 0} de buff`
                  : undefined
              }
            >
              {dexBuffed >= 0 ? `+${dexBuffed}` : dexBuffed}
            </span>
          </FormulaChip>

          {/* ARM — editavel + indicador de buff */}
          <FormulaChip label="ARM">
            <input
              type="number"
              {...register('status.armorBonus', { valueAsNumber: true })}
              style={{
                ...inputStyle,
                padding: 0,
                height: 18,
                fontSize: 13,
                color:
                  (buffs.get('defArmor') ?? 0) !== 0 ? 'var(--bc-gold-bright)' : 'var(--bc-ink)',
              }}
              aria-label="Bonus de armadura"
              title={(buffs.get('defArmor') ?? 0) !== 0 ? `+${buffs.get('defArmor')} de buff` : undefined}
            />
          </FormulaChip>

          {/* OUT — editavel + indicador de buff */}
          <FormulaChip label="OUT">
            <input
              type="number"
              {...register('status.otherBonus', { valueAsNumber: true })}
              style={{
                ...inputStyle,
                padding: 0,
                height: 18,
                fontSize: 13,
                color:
                  (buffs.get('defOther') ?? 0) !== 0 ? 'var(--bc-gold-bright)' : 'var(--bc-ink)',
              }}
              aria-label="Outros bonus"
              title={(buffs.get('defOther') ?? 0) !== 0 ? `+${buffs.get('defOther')} de buff` : undefined}
            />
          </FormulaChip>
        </div>
      </div>

      <Divider glyph="◆" />

      {/* Resistencias */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
        <div>
          <div style={{ ...labelStyle, marginBottom: 4, textTransform: 'uppercase' }}>
            Res. Fisica
          </div>
          <input
            type="number"
            {...register('status.physicalRes', { valueAsNumber: true })}
            style={inputStyle}
            aria-label="Resistencia fisica"
          />
        </div>
        <div>
          <div style={{ ...labelStyle, marginBottom: 4, textTransform: 'uppercase' }}>
            Res. Magica
          </div>
          <input
            type="number"
            {...register('status.magicalRes', { valueAsNumber: true })}
            style={inputStyle}
            aria-label="Resistencia magica"
          />
        </div>
      </div>
    </section>
  );
}

function FormulaChip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(10, 5, 7, 0.6)',
        border: '1px solid rgba(212, 175, 55, 0.12)',
        padding: '6px 8px',
        borderRadius: 'var(--bc-radius-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 6,
        minHeight: 32,
      }}
    >
      <span
        className="bc-cinzel"
        style={{ fontSize: 9, color: 'var(--bc-gold-dim)', letterSpacing: '0.15em' }}
      >
        {label}
      </span>
      <span style={{ flex: 1, textAlign: 'right' }}>{children}</span>
    </div>
  );
}

/** Helper exportado: usado por SheetPage no save pra sincronizar status.defense */
export function computeDefense(
  attributes: { destreza: number },
  status: { defenseBase: number; armorBonus: number; otherBonus: number },
  buffs: Map<string, number>,
): number {
  const dex = (attributes.destreza ?? 0) + (buffs.get('attrDestreza') ?? 0);
  const armor = (status.armorBonus ?? 0) + (buffs.get('defArmor') ?? 0);
  const other = (status.otherBonus ?? 0) + (buffs.get('defOther') ?? 0);
  return (status.defenseBase ?? 0) + dex + armor + other;
}
