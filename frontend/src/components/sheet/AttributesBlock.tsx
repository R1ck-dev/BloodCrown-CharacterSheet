/**
 * Bloco ATRIBUTOS — grid 3x2 de medalhoes (DES FOR INT / CAR COS SAB).
 * Le buffs ativos e dispatcher de dado do contexto da Sheet.
 */
import { AttributeMedallion } from './AttributeMedallion';
import type { AttributeField } from '@/lib/buffTargets';

interface AttrDef {
  field: AttributeField;
  label: string;
  rollName: string;
  buffTarget: string;
}

const ATTRS: AttrDef[] = [
  { field: 'destreza',     label: 'DES', rollName: 'Teste de Destreza',     buffTarget: 'attrDestreza' },
  { field: 'forca',        label: 'FOR', rollName: 'Teste de Forca',        buffTarget: 'attrForca' },
  { field: 'inteligencia', label: 'INT', rollName: 'Teste de Inteligencia', buffTarget: 'attrInteligencia' },
  { field: 'carisma',      label: 'CAR', rollName: 'Teste de Carisma',      buffTarget: 'attrCarisma' },
  { field: 'constituicao', label: 'COS', rollName: 'Teste de Constituicao', buffTarget: 'attrConstituicao' },
  { field: 'sabedoria',    label: 'SAB', rollName: 'Teste de Sabedoria',    buffTarget: 'attrSabedoria' },
];

interface Props {
  buffs: Map<string, number>;
  onRoll: (source: string, value: number) => void;
}

export function AttributesBlock({ buffs, onRoll }: Props) {
  return (
    <section
      style={{
        padding: '18px 18px 28px',
        background: 'var(--bc-gradient-surface)',
        border: '1px solid var(--bc-edge)',
        borderRadius: 'var(--bc-radius-md)',
        position: 'relative',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 18,
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
          ATRIBUTOS
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          rowGap: 36,
          columnGap: 8,
          paddingTop: 8,
          justifyItems: 'center',
        }}
      >
        {ATTRS.map((a) => (
          <AttributeMedallion
            key={a.field}
            field={a.field}
            label={a.label}
            rollName={a.rollName}
            buff={buffs.get(a.buffTarget) ?? 0}
            onRoll={onRoll}
          />
        ))}
      </div>

      <p
        style={{
          marginTop: 20,
          textAlign: 'center',
          fontSize: 10,
          color: 'var(--bc-ink-faint)',
          fontStyle: 'italic',
        }}
      >
        Clique pra rolar · Duplo clique pra editar
      </p>
    </section>
  );
}
