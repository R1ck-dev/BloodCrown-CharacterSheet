/**
 * Bloco PERICIAS — coluna central.
 *
 * 23 pericias fixas (value object Expertise, registradas no RHF), cada uma:
 *   - Nome clicavel (rola d20 com atributo associado + buff)
 *   - Atributo entre parens (FOR/DES/INT/CAR/COS/SAB)
 *   - Input numerico do bonus (editavel, registrado no RHF)
 *   - Cor dourada no nome+valor se a pericia OU o atributo associado estiverem buffados.
 *
 * + Pericias PERSONALIZADAS (colecao dinamica /custom-skills): renderizadas inline
 *   abaixo das fixas com paridade total — rolaveis, vinculadas a um atributo a
 *   escolha, valor editavel inline (auto-save via PUT com debounce), nome/atributo
 *   editaveis e alvo de buff (target "customSkill:<id>"). Como nao moram no form
 *   RHF, sao geridas pela lista vinda do cache (prop customSkills) + mutations.
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Attributes, CharacterSheet, CustomSkill, Expertise, NewCustomSkillInput } from '@/types/character';
import { customSkillTarget, formPathToTarget } from '@/lib/buffTargets';
import { useCreateCustomSkill, useDeleteCustomSkill, useUpdateCustomSkill } from '@/api/customSkills';

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

/** Metadados dos 6 atributos pra perícias custom (label curto + nome cheio no select). */
const ATTR_META: Record<keyof Attributes, { short: string; full: string }> = {
  forca:        { short: 'FOR', full: 'Força' },
  destreza:     { short: 'DES', full: 'Destreza' },
  constituicao: { short: 'COS', full: 'Constituição' },
  inteligencia: { short: 'INT', full: 'Inteligência' },
  sabedoria:    { short: 'SAB', full: 'Sabedoria' },
  carisma:      { short: 'CAR', full: 'Carisma' },
};
const ATTR_ORDER: (keyof Attributes)[] = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'];

const VALUE_INPUT_STYLE: CSSProperties = {
  background: 'rgba(10, 5, 7, 0.7)',
  border: '1px solid rgba(212, 175, 55, 0.18)',
  color: 'var(--bc-gold-bright)',
  fontFamily: 'var(--bc-font-display)',
  fontSize: 14,
  textAlign: 'center',
  width: 48,
  padding: '4px 0',
  borderRadius: 'var(--bc-radius-sm)',
  outline: 'none',
};

const ICON_BTN_STYLE: CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--bc-edge)',
  color: 'var(--bc-gold-dim)',
  padding: 5,
  cursor: 'pointer',
  borderRadius: 'var(--bc-radius-sm)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
};

interface Props {
  buffs: Map<string, number>;
  /** Perícias personalizadas (do cache do personagem). */
  customSkills: CustomSkill[];
  characterId: string;
  /** Recebe (source, attrValue+buff, skillBonus+buff). Dispara o useDiceRoll do parent. */
  onRoll: (source: string, attrValue: number, skillBonus: number) => void;
}

export function SkillsBlock({ buffs, customSkills, characterId, onRoll }: Props) {
  const { control, getValues } = useFormContext<CharacterSheet>();

  const createSkill = useCreateCustomSkill(characterId);
  const updateSkill = useUpdateCustomSkill(characterId);
  const deleteSkill = useDeleteCustomSkill(characterId);

  const [newName, setNewName] = useState('');
  const [newAttr, setNewAttr] = useState<keyof Attributes>('forca');

  const handleUpdate = (id: string, payload: NewCustomSkillInput) => {
    updateSkill.mutateAsync({ customSkillId: id, payload }).catch((e) => {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar perícia.');
    });
  };

  const handleDelete = (id: string) => {
    deleteSkill.mutateAsync(id).catch((e) => {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover perícia.');
    });
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      toast.error('Dê um nome à perícia.');
      return;
    }
    createSkill
      .mutateAsync({ name, attribute: newAttr, value: 0 })
      .then(() => {
        setNewName('');
        setNewAttr('forca');
        toast.success('Perícia criada.');
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Erro ao criar perícia.'));
  };

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
        {/* Grade de 2 colunas — auto-fit cai pra 1 coluna quando o espaco aperta.
            Preenchimento row-major pareia as pericias na ordem do array:
            (Atletismo|Luta), (Fortitude|Furtividade), (Iniciativa|Ladinagem)... */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(188px, 1fr))',
            columnGap: 16,
          }}
        >
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
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                fontSize: 13,
                minWidth: 0,
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
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
              <Controller
                control={control}
                name={`expertise.${s.field}` as `expertise.atletismo`}
                render={({ field }) => (
                  <SkillValueField
                    base={Number(field.value) || 0}
                    buff={skillBuff}
                    onCommit={field.onChange}
                    ariaLabel={`Bonus de ${s.label}`}
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              />
            </div>
          );
        })}
        </div>

        {/* ===== Perícias personalizadas ===== */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 8px' }}>
            <span style={{ color: 'var(--bc-gold)', fontSize: 11 }} aria-hidden="true">
              ✦
            </span>
            <span
              className="bc-cinzel bc-tracked"
              style={{ fontSize: 9, color: 'var(--bc-gold-dim)', letterSpacing: '0.2em', textTransform: 'uppercase' }}
            >
              Personalizadas
            </span>
            <span
              aria-hidden="true"
              style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }}
            />
          </div>

          {customSkills.length === 0 && (
            <p
              style={{
                fontSize: 11,
                color: 'var(--bc-ink-faint)',
                fontStyle: 'italic',
                margin: '0 0 6px',
                padding: '0 10px',
              }}
            >
              Nenhuma perícia personalizada. Crie a sua abaixo.
            </p>
          )}

          {customSkills.map((skill) => (
            <CustomSkillRow
              key={skill.id}
              skill={skill}
              buffs={buffs}
              onRoll={onRoll}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}

          {/* Form de adicionar (sem modal) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px 2px' }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder="Nova perícia"
              aria-label="Nome da nova perícia"
              style={{ ...VALUE_INPUT_STYLE, flex: 1, width: 'auto', textAlign: 'left', padding: '4px 8px' }}
            />
            <select
              value={newAttr}
              onChange={(e) => setNewAttr(e.target.value as keyof Attributes)}
              aria-label="Atributo da nova perícia"
              style={{ ...VALUE_INPUT_STYLE, width: 'auto', padding: '4px 6px' }}
            >
              {ATTR_ORDER.map((a) => (
                <option key={a} value={a}>
                  {ATTR_META[a].short}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={createSkill.isPending}
              aria-label="Adicionar perícia"
              title="Adicionar perícia"
              style={{ ...ICON_BTN_STYLE, color: 'var(--bc-gold-bright)', opacity: createSkill.isPending ? 0.5 : 1 }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Campo de valor de uma perícia (fixa ou custom). Espelha o AttributeMedallion:
 * por padrão exibe `base + buff` (dourado + brilho quando buffada); ao clicar,
 * vira input editável do `base`. Commit no blur/Enter, Escape cancela. Isso dá às
 * perícias a mesma exibição de "valor somado" que os atributos já têm.
 */
interface SkillValueFieldProps {
  base: number;
  buff: number;
  onCommit: (value: number) => void;
  ariaLabel: string;
  style?: CSSProperties;
}

function SkillValueField({ base, buff, onCommit, ariaLabel, style }: SkillValueFieldProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<number>(base);

  // Re-sincroniza com base quando muda por fora (server roundtrip / auto-save),
  // sem atropelar uma edição em andamento.
  useEffect(() => {
    if (!editing) setValue(base);
  }, [base, editing]);

  if (editing) {
    return (
      <input
        type="number"
        autoFocus
        value={Number.isNaN(value) ? '' : value}
        onChange={(e) => {
          const raw = e.target.valueAsNumber;
          setValue(Number.isNaN(raw) ? 0 : raw);
        }}
        onBlur={() => {
          setEditing(false);
          onCommit(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          else if (e.key === 'Escape') {
            setValue(base);
            setEditing(false);
          }
        }}
        aria-label={ariaLabel}
        style={{ ...VALUE_INPUT_STYLE, ...style }}
      />
    );
  }

  const isBuffed = buff !== 0;
  const displayed = value + buff;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label={`${ariaLabel}: ${displayed}${isBuffed ? ` (base ${value}, buff ${buff >= 0 ? '+' : ''}${buff})` : ''}. Clique para editar.`}
      title={
        isBuffed
          ? `Base ${value} ${buff >= 0 ? '+' : '−'} ${Math.abs(buff)} de buff = ${displayed}`
          : 'Clique para editar'
      }
      style={{
        ...VALUE_INPUT_STYLE,
        ...style,
        cursor: 'text',
        ...(isBuffed
          ? {
              borderColor: 'rgba(212, 175, 55, 0.55)',
              textShadow: '0 0 10px color-mix(in srgb, var(--bc-gold-bright) 70%, transparent)',
            }
          : null),
      }}
    >
      {displayed}
    </button>
  );
}

interface RowProps {
  skill: CustomSkill;
  buffs: Map<string, number>;
  onRoll: Props['onRoll'];
  onUpdate: (id: string, payload: NewCustomSkillInput) => void;
  onDelete: (id: string) => void;
}

function CustomSkillRow({ skill, buffs, onRoll, onUpdate, onDelete }: RowProps) {
  const { getValues } = useFormContext<CharacterSheet>();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(skill.name);
  const [draftAttr, setDraftAttr] = useState<keyof Attributes>(skill.attribute);
  // Mantem nome/atributo em sincronia com a prop quando muda por fora,
  // sem atropelar uma edicao em andamento.
  useEffect(() => {
    if (!editing) {
      setDraftName(skill.name);
      setDraftAttr(skill.attribute);
    }
  }, [skill.name, skill.attribute, editing]);

  const meta = ATTR_META[skill.attribute] ?? ATTR_META.forca;
  const attrBuffTarget = formPathToTarget(`attributes.${skill.attribute}`) ?? '';
  const skillBuff = buffs.get(customSkillTarget(skill.id)) ?? 0;
  const attrBuff = buffs.get(attrBuffTarget) ?? 0;
  const isBuffed = skillBuff !== 0 || attrBuff !== 0;
  const skillValue = skill.value ?? 0;

  const handleRoll = () => {
    const attrBase = Number(getValues().attributes?.[skill.attribute]) || 0;
    onRoll(skill.name || 'Perícia', attrBase + attrBuff, skillValue + skillBuff);
  };

  const commitValue = (v: number) => {
    if (v === skill.value) return;
    onUpdate(skill.id, { name: skill.name, attribute: skill.attribute, value: v });
  };

  const saveEdit = () => {
    const name = draftName.trim() || 'Perícia';
    onUpdate(skill.id, { name, attribute: draftAttr, value: skillValue });
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraftName(skill.name);
    setDraftAttr(skill.attribute);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 10px',
          borderBottom: '1px solid rgba(212,175,55,0.06)',
        }}
      >
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
          }}
          placeholder="Nome"
          autoFocus
          aria-label="Nome da perícia"
          style={{ ...VALUE_INPUT_STYLE, flex: 1, width: 'auto', textAlign: 'left', padding: '4px 8px' }}
        />
        <select
          value={draftAttr}
          onChange={(e) => setDraftAttr(e.target.value as keyof Attributes)}
          aria-label="Atributo da perícia"
          style={{ ...VALUE_INPUT_STYLE, width: 'auto', padding: '4px 6px' }}
        >
          {ATTR_ORDER.map((a) => (
            <option key={a} value={a}>
              {ATTR_META[a].short}
            </option>
          ))}
        </select>
        <button type="button" onClick={saveEdit} aria-label="Salvar" title="Salvar" style={{ ...ICON_BTN_STYLE, color: 'var(--bc-success)' }}>
          <Check size={12} />
        </button>
        <button type="button" onClick={cancelEdit} aria-label="Cancelar" title="Cancelar" style={ICON_BTN_STYLE}>
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="bc-skill-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 10px',
        fontSize: 13,
        borderBottom: '1px solid rgba(212,175,55,0.06)',
        transition: 'background var(--bc-duration-fast) var(--bc-ease-out-quart)',
      }}
    >
      <button
        type="button"
        onClick={handleRoll}
        aria-label={`Rolar ${skill.name || 'Perícia'}`}
        title={
          isBuffed
            ? `Buff ativo${skillBuff ? `: +${skillBuff} na pericia` : ''}${attrBuff ? ` +${attrBuff} no ${meta.short}` : ''}`
            : 'Clique para rolar'
        }
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
          color: isBuffed ? 'var(--bc-gold-bright)' : 'var(--bc-ink)',
          font: 'inherit',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color var(--bc-duration-fast) var(--bc-ease-out-quart)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--bc-gold-bright)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = isBuffed ? 'var(--bc-gold-bright)' : 'var(--bc-ink)';
        }}
      >
        {skill.name || 'Perícia'}
        <span
          className="bc-cinzel"
          style={{ fontSize: 10, color: 'var(--bc-gold-dim)', letterSpacing: '0.16em', marginLeft: 6 }}
        >
          ({meta.short})
        </span>
      </button>
      <SkillValueField
        base={skillValue}
        buff={skillBuff}
        onCommit={commitValue}
        ariaLabel={`Bonus de ${skill.name || 'Perícia'}`}
      />
      <button type="button" onClick={() => setEditing(true)} aria-label={`Editar ${skill.name || 'Perícia'}`} title="Editar nome/atributo" style={ICON_BTN_STYLE}>
        <Pencil size={12} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(skill.id)}
        aria-label={`Remover ${skill.name || 'Perícia'}`}
        title="Remover perícia"
        style={{ ...ICON_BTN_STYLE, color: '#FCA5A5', borderColor: 'rgba(185,28,28,0.4)' }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
