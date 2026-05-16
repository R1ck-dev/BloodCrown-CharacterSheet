/**
 * Bloco PERICIAS — coluna central. 23 linhas, cada uma:
 *   - Nome clicavel (rola d20 com atributo associado + buff)
 *   - Atributo entre parens (FOR/DES/INT/CAR/COS/SAB)
 *   - Input numerico do bonus (editavel, registrado no RHF)
 *   - Cor dourada no nome+valor se a pericia OU o atributo associado
 *     estiverem buffados.
 */
import { useFormContext } from 'react-hook-form';
import type { CharacterSheet, Attributes, Expertise } from '@/types/character';

interface SkillDef {
  field: keyof Expertise;
  label: string;
  attr: keyof Attributes;
  attrLabel: 'FOR' | 'DES' | 'INT' | 'CAR' | 'COS' | 'SAB';
  skillBuffTarget: string;
  attrBuffTarget: string;
  rollName: string;
}

const SKILLS: SkillDef[] = [
  { field: 'atletismo',     label: 'Atletismo',     attr: 'forca',        attrLabel: 'FOR', skillBuffTarget: 'skillAtletismo',     attrBuffTarget: 'attrForca',        rollName: 'Atletismo' },
  { field: 'luta',          label: 'Luta',          attr: 'forca',        attrLabel: 'FOR', skillBuffTarget: 'skillLuta',          attrBuffTarget: 'attrForca',        rollName: 'Luta' },
  { field: 'fortitude',     label: 'Fortitude',     attr: 'constituicao', attrLabel: 'COS', skillBuffTarget: 'skillFortitude',     attrBuffTarget: 'attrConstituicao', rollName: 'Fortitude' },
  { field: 'furtividade',   label: 'Furtividade',   attr: 'destreza',     attrLabel: 'DES', skillBuffTarget: 'skillFurtividade',   attrBuffTarget: 'attrDestreza',     rollName: 'Furtividade' },
  { field: 'iniciativa',    label: 'Iniciativa',    attr: 'destreza',     attrLabel: 'DES', skillBuffTarget: 'skillIniciativa',    attrBuffTarget: 'attrDestreza',     rollName: 'Iniciativa' },
  { field: 'ladinagem',     label: 'Ladinagem',     attr: 'destreza',     attrLabel: 'DES', skillBuffTarget: 'skillLadinagem',     attrBuffTarget: 'attrDestreza',     rollName: 'Ladinagem' },
  { field: 'pontaria',      label: 'Pontaria',      attr: 'destreza',     attrLabel: 'DES', skillBuffTarget: 'skillPontaria',      attrBuffTarget: 'attrDestreza',     rollName: 'Pontaria' },
  { field: 'reflexos',      label: 'Reflexos',      attr: 'destreza',     attrLabel: 'DES', skillBuffTarget: 'skillReflexos',      attrBuffTarget: 'attrDestreza',     rollName: 'Reflexos' },
  { field: 'conhecimento',  label: 'Conhecimento',  attr: 'inteligencia', attrLabel: 'INT', skillBuffTarget: 'skillConhecimento',  attrBuffTarget: 'attrInteligencia', rollName: 'Conhecimento' },
  { field: 'consertar',     label: 'Consertar',     attr: 'inteligencia', attrLabel: 'INT', skillBuffTarget: 'skillConsertar',     attrBuffTarget: 'attrInteligencia', rollName: 'Consertar' },
  { field: 'investigacao',  label: 'Investigacao',  attr: 'inteligencia', attrLabel: 'INT', skillBuffTarget: 'skillInvestigacao',  attrBuffTarget: 'attrInteligencia', rollName: 'Investigacao' },
  { field: 'medicina',      label: 'Medicina',      attr: 'inteligencia', attrLabel: 'INT', skillBuffTarget: 'skillMedicina',      attrBuffTarget: 'attrInteligencia', rollName: 'Medicina' },
  { field: 'mente',         label: 'Mente',         attr: 'inteligencia', attrLabel: 'INT', skillBuffTarget: 'skillMente',         attrBuffTarget: 'attrInteligencia', rollName: 'Mente' },
  { field: 'sobrevivencia', label: 'Sobrevivencia', attr: 'inteligencia', attrLabel: 'INT', skillBuffTarget: 'skillSobrevivencia', attrBuffTarget: 'attrInteligencia', rollName: 'Sobrevivencia' },
  { field: 'intuicao',      label: 'Intuicao',      attr: 'sabedoria',    attrLabel: 'SAB', skillBuffTarget: 'skillIntuicao',      attrBuffTarget: 'attrSabedoria',    rollName: 'Intuicao' },
  { field: 'magia',         label: 'Magia',         attr: 'sabedoria',    attrLabel: 'SAB', skillBuffTarget: 'skillMagia',         attrBuffTarget: 'attrSabedoria',    rollName: 'Magia' },
  { field: 'percepcao',     label: 'Percepcao',     attr: 'sabedoria',    attrLabel: 'SAB', skillBuffTarget: 'skillPercepcao',     attrBuffTarget: 'attrSabedoria',    rollName: 'Percepcao' },
  { field: 'diplomacia',    label: 'Diplomacia',    attr: 'carisma',      attrLabel: 'CAR', skillBuffTarget: 'skillDiplomacia',    attrBuffTarget: 'attrCarisma',      rollName: 'Diplomacia' },
  { field: 'domar',         label: 'Domar',         attr: 'carisma',      attrLabel: 'CAR', skillBuffTarget: 'skillDomar',         attrBuffTarget: 'attrCarisma',      rollName: 'Domar' },
  { field: 'empatia',       label: 'Empatia',       attr: 'carisma',      attrLabel: 'CAR', skillBuffTarget: 'skillEmpatia',       attrBuffTarget: 'attrCarisma',      rollName: 'Empatia' },
  { field: 'intimidar',     label: 'Intimidacao',   attr: 'carisma',      attrLabel: 'CAR', skillBuffTarget: 'skillIntimidar',     attrBuffTarget: 'attrCarisma',      rollName: 'Intimidacao' },
  { field: 'labia',         label: 'Labia',         attr: 'carisma',      attrLabel: 'CAR', skillBuffTarget: 'skillLabia',         attrBuffTarget: 'attrCarisma',      rollName: 'Labia' },
  { field: 'seduzir',       label: 'Seduzir',       attr: 'carisma',      attrLabel: 'CAR', skillBuffTarget: 'skillSeduzir',       attrBuffTarget: 'attrCarisma',      rollName: 'Seduzir' },
];

interface Props {
  buffs: Map<string, number>;
  /** Recebe (source, attrValue+buff, skillBonus+buff). Dispara o useDiceRoll do parent. */
  onRoll: (source: string, attrValue: number, skillBonus: number) => void;
}

export function SkillsBlock({ buffs, onRoll }: Props) {
  const { register, getValues } = useFormContext<CharacterSheet>();

  return (
    <section
      style={{
        background: 'var(--bc-gradient-surface)',
        border: '1px solid var(--bc-edge)',
        borderRadius: 'var(--bc-radius-md)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <header
        style={{
          padding: '18px 18px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
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
          PERICIAS
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
          gridTemplateColumns: '1fr 60px',
          padding: '8px 18px 6px',
          fontSize: 9,
          letterSpacing: '0.2em',
          color: 'var(--bc-gold-dim)',
          textTransform: 'uppercase',
          fontFamily: 'var(--bc-font-display)',
        }}
      >
        <span>Nome (ATR)</span>
        <span style={{ textAlign: 'center' }}>Valor</span>
      </div>

      <div className="bc-scroll" style={{ overflowY: 'auto', flex: 1, padding: '0 14px 12px' }}>
        {SKILLS.map((s) => {
          const skillBuff = buffs.get(s.skillBuffTarget) ?? 0;
          const attrBuff = buffs.get(s.attrBuffTarget) ?? 0;
          const isBuffed = skillBuff !== 0 || attrBuff !== 0;

          const handleRoll = () => {
            const values = getValues();
            const attrBase = Number(values.attributes?.[s.attr]) || 0;
            const skillBase = Number(values.expertise?.[s.field]) || 0;
            onRoll(s.rollName, attrBase + attrBuff, skillBase + skillBuff);
          };

          return (
            <div
              key={s.field}
              className="bc-skill-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 60px',
                alignItems: 'center',
                padding: '7px 10px',
                fontSize: 13,
                borderBottom: '1px solid rgba(212,175,55,0.06)',
                transition: 'background var(--bc-duration-fast) var(--bc-ease-out-quart)',
              }}
            >
              <button
                type="button"
                onClick={handleRoll}
                aria-label={`Rolar ${s.rollName}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  color: isBuffed ? 'var(--bc-gold-bright)' : 'var(--bc-ink)',
                  font: 'inherit',
                  fontWeight: 500,
                  transition: 'color var(--bc-duration-fast) var(--bc-ease-out-quart)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--bc-gold-bright)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isBuffed ? 'var(--bc-gold-bright)' : 'var(--bc-ink)';
                }}
                title={
                  isBuffed
                    ? `Buff ativo${skillBuff ? `: +${skillBuff} na pericia` : ''}${attrBuff ? ` +${attrBuff} no ${s.attrLabel}` : ''}`
                    : 'Clique para rolar'
                }
              >
                {s.label}
                <span
                  className="bc-cinzel"
                  style={{
                    fontSize: 10,
                    color: 'var(--bc-gold-dim)',
                    letterSpacing: '0.16em',
                    marginLeft: 6,
                  }}
                >
                  ({s.attrLabel})
                </span>
              </button>
              <input
                type="number"
                {...register(`expertise.${s.field}`, { valueAsNumber: true })}
                style={{
                  background: 'rgba(10, 5, 7, 0.7)',
                  border: '1px solid rgba(212, 175, 55, 0.18)',
                  color: isBuffed ? 'var(--bc-gold-bright)' : 'var(--bc-gold-bright)',
                  fontFamily: 'var(--bc-font-display)',
                  fontSize: 14,
                  textAlign: 'center',
                  width: 48,
                  padding: '4px 0',
                  borderRadius: 'var(--bc-radius-sm)',
                  outline: 'none',
                  marginLeft: 'auto',
                }}
                aria-label={`Bonus de ${s.label}`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
