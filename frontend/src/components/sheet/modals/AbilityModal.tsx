/**
 * Modal de habilidade — opera em 2 modos:
 *   - Create (sem prop `ability`): defaults vazios.
 *   - Edit (com prop `ability`): preenche campos da habilidade existente,
 *     troca titulo e botao. onSave recebe o mesmo payload em ambos os casos —
 *     o parent decide se chama useCreateAbility ou useUpdateAbility.
 *
 * 2 tabs internas:
 *   - Geral: nome, categoria, acao, descricao
 *   - Automacao: recurso + max usos, effects array (target/value),
 *     dado de duracao
 */
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { Modal } from './Modal';
import { Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import type { Ability, AbilityCategory, ActionType, NewAbilityInput } from '@/types/character';
import { ATTR_TARGETS, SKILL_TARGETS, STATUS_TARGETS, TARGET_LABELS } from '@/lib/buffTargets';
import { ACTION_LABELS } from '@/lib/actionTypes';

const ACTION_TYPES: ActionType[] = ['STANDARD', 'BONUS', 'MOVEMENT', 'REACTION', 'FREE', 'FULL'];

const CATEGORY_LABELS: Record<AbilityCategory, string> = {
  CLASS: 'Classe',
  MAGIC: 'Magia',
  AWAKEN: 'Despertar',
  WEAPON: 'Arma',
  TRANSFORMATION: 'Transformacao',
  SPECIAL: 'Especial',
  INVENTORY: 'Inventario',
  PASSIVE: 'Passiva',
};

const schema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatorio.'),
  category: z.enum(['CLASS', 'MAGIC', 'AWAKEN', 'WEAPON', 'TRANSFORMATION', 'SPECIAL', 'INVENTORY', 'PASSIVE']),
  actionType: z.enum(['STANDARD', 'BONUS', 'MOVEMENT', 'REACTION', 'FREE', 'FULL']).default('STANDARD'),
  description: z.string().default(''),
  resourceType: z.enum(['MANA', 'STAMINA', 'HYBRID']).default('MANA'),
  maxUses: z.coerce.number().int().min(0).default(1),
  unlimitedUses: z.boolean().default(false),
  diceRoll: z.string().default(''),
  durationDice: z.string().default(''),
  effects: z
    .array(
      z.object({
        target: z.string().min(1),
        value: z.coerce.number().int(),
      }),
    )
    .default([]),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewAbilityInput) => Promise<void>;
  defaultCategory?: AbilityCategory;
  busy?: boolean;
  /** Se fornecida, modal opera em modo edit (preenche campos, troca titulo/botao). */
  ability?: Ability;
}

export function AbilityModal({
  isOpen,
  onClose,
  onSave,
  defaultCategory = 'CLASS',
  busy = false,
  ability,
}: Props) {
  const isEdit = !!ability;
  const [tab, setTab] = useState<'general' | 'mechanic'>('general');

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: ability?.name ?? '',
      category: ability?.category ?? defaultCategory,
      actionType: ability?.actionType ?? 'STANDARD',
      description: ability?.description ?? '',
      resourceType: ability?.resourceType ?? 'MANA',
      maxUses: ability?.maxUses ?? 1,
      diceRoll: ability?.diceRoll ?? '',
      durationDice: ability?.durationDice ?? '',
      unlimitedUses: ability ? (ability.maxUses === 0 && ability.category !== 'PASSIVE') : false,
      effects: ability?.effects?.map((e) => ({ target: e.target, value: e.value })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'effects' });

  // Categoria PASSIVE = habilidade puramente textual (so nome + descricao).
  const category = watch('category');
  const unlimitedUses = watch('unlimitedUses');
  const isPassive = category === 'PASSIVE';

  // Reseta o form quando o modal reabre. Em modo edit, deriva da `ability`;
  // em create, usa defaults vazios (categoria depende da tab ativa).
  useEffect(() => {
    if (isOpen) {
      reset({
        name: ability?.name ?? '',
        category: ability?.category ?? defaultCategory,
        actionType: ability?.actionType ?? 'STANDARD',
        description: ability?.description ?? '',
        resourceType: ability?.resourceType ?? 'MANA',
        maxUses: ability?.maxUses ?? 1,
        diceRoll: ability?.diceRoll ?? '',
        durationDice: ability?.durationDice ?? '',
        unlimitedUses: ability ? (ability.maxUses === 0 && ability.category !== 'PASSIVE') : false,
        effects: ability?.effects?.map((e) => ({ target: e.target, value: e.value })) ?? [],
      });
      setTab('general');
    }
  }, [isOpen, defaultCategory, ability, reset]);

  const submit = handleSubmit(async (data) => {
    const payload: NewAbilityInput = {
      name: data.name,
      category: data.category,
      resourceType: data.resourceType,
      actionType: data.actionType,
      maxUses: data.maxUses,
      diceRoll: data.diceRoll,
      durationDice: data.durationDice,
      description: data.description,
      effects: data.effects.filter((e) => e.target && e.target !== 'none'),
    };
    if (data.category === 'PASSIVE') {
      // Passiva: puramente textual — zera toda a automacao.
      payload.actionType = 'FREE';
      payload.maxUses = 0;
      payload.durationDice = '';
      payload.diceRoll = '';
      payload.effects = [];
    } else if (data.unlimitedUses) {
      payload.maxUses = 0;
    }
    await onSave(payload);
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Habilidade' : 'Nova Habilidade'}
      maxWidth={580}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={isSubmitting || busy}>
            {isEdit ? 'Atualizar Habilidade' : 'Salvar Habilidade'}
          </Button>
        </>
      }
    >
      {/* Tabs internas — escondidas pra passiva (so tem campos do Geral) */}
      {!isPassive && (
        <div className="bc-tabs" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`bc-tab ${tab === 'general' ? 'bc-tab--active' : ''}`}
            onClick={() => setTab('general')}
          >
            Geral
          </button>
          <button
            type="button"
            className={`bc-tab ${tab === 'mechanic' ? 'bc-tab--active' : ''}`}
            onClick={() => setTab('mechanic')}
          >
            Automacao
          </button>
        </div>
      )}

      <form onSubmit={submit} style={{ display: tab === 'general' || isPassive ? 'flex' : 'none', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <Field
            label="Nome"
            placeholder="Ex: Voto de Vorgan"
            autoFocus
            {...register('name')}
            error={errors.name?.message}
          />
          <div className="bc-field">
            <label className="bc-field__label" htmlFor="abil-cat">Tipo</label>
            <select
              id="abil-cat"
              {...register('category')}
              className="bc-input"
              style={{ height: 44 }}
            >
              {(Object.keys(CATEGORY_LABELS) as AbilityCategory[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!isPassive && (
          <div className="bc-field">
            <label className="bc-field__label" htmlFor="abil-action">Ação consumida</label>
            <select
              id="abil-action"
              {...register('actionType')}
              className="bc-input"
              style={{ height: 44 }}
            >
              {ACTION_TYPES.map((t) => (
                <option key={t} value={t}>{ACTION_LABELS[t]}</option>
              ))}
            </select>
          </div>
        )}

        <div className="bc-field">
          <label className="bc-field__label" htmlFor="abil-desc">Descricao (Markdown)</label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <MarkdownEditor
                id="abil-desc"
                value={field.value}
                onChange={field.onChange}
                placeholder="**Explique** o que a habilidade faz."
                rows={5}
                minHeight={120}
              />
            )}
          />
        </div>

        {!isPassive && (
          <Field
            label="Formula de dado (opcional)"
            placeholder="Ex: 2d6+INT"
            {...register('diceRoll')}
            hint={!errors.diceRoll ? 'Aparece como botao no card pra rolar' : undefined}
          />
        )}
      </form>

      <div style={{ display: tab === 'mechanic' && !isPassive ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
        {/* Sistema de usos */}
        <div
          style={{
            padding: 12,
            border: '1px solid var(--bc-edge)',
            borderRadius: 'var(--bc-radius-sm)',
            background: 'rgba(10, 5, 7, 0.4)',
          }}
        >
          <div
            className="bc-cinzel bc-tracked-soft"
            style={{ fontSize: 10, color: 'var(--bc-info)', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={11} /> SISTEMA DE USOS
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: unlimitedUses ? 0 : 12,
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--bc-ink)',
            }}
          >
            <input type="checkbox" {...register('unlimitedUses')} />
            Usos ilimitados (ativa/desativa sem limite)
          </label>
          {!unlimitedUses && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="bc-field">
                <label className="bc-field__label" htmlFor="abil-res">Recurso pra recuperar</label>
                <select id="abil-res" {...register('resourceType')} className="bc-input" style={{ height: 44 }}>
                  <option value="MANA">Mana</option>
                  <option value="STAMINA">Estamina</option>
                  <option value="HYBRID">Mana ou Estamina</option>
                </select>
              </div>
              <Field
                label="Max. usos"
                type="number"
                min={0}
                {...register('maxUses', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>

        {/* Effects array */}
        <div
          style={{
            padding: 12,
            border: '1px solid var(--bc-edge)',
            borderRadius: 'var(--bc-radius-sm)',
            background: 'rgba(10, 5, 7, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span
              className="bc-cinzel bc-tracked-soft"
              style={{ fontSize: 10, color: 'var(--bc-success)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Sparkles size={11} /> EFEITOS ATIVOS
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => append({ target: ATTR_TARGETS[0], value: 0 })}
              type="button"
            >
              <Plus size={11} /> Adicionar
            </Button>
          </div>

          {fields.length === 0 && (
            <p style={{ fontSize: 11, color: 'var(--bc-ink-faint)', fontStyle: 'italic' }}>
              Nenhum efeito. Adicione bonus a atributos, defesa ou pericias.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {fields.map((f, i) => (
              <div key={f.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <select
                  {...register(`effects.${i}.target`)}
                  className="bc-input bc-input--sm"
                  style={{ flex: 1, height: 36 }}
                >
                  <optgroup label="Defesa / Resistencia">
                    {STATUS_TARGETS.map((t) => (
                      <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Atributos">
                    {ATTR_TARGETS.map((t) => (
                      <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Pericias">
                    {SKILL_TARGETS.map((t) => (
                      <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                    ))}
                  </optgroup>
                </select>
                <input
                  type="number"
                  {...register(`effects.${i}.value`, { valueAsNumber: true })}
                  className="bc-input bc-input--sm"
                  placeholder="±"
                  style={{ width: 70, textAlign: 'center', height: 36 }}
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remover efeito"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(185, 28, 28, 0.4)',
                    color: '#FCA5A5',
                    padding: 8,
                    cursor: 'pointer',
                    borderRadius: 'var(--bc-radius-sm)',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Duracao */}
        <div
          style={{
            padding: 12,
            border: '1px solid var(--bc-edge)',
            borderRadius: 'var(--bc-radius-sm)',
            background: 'rgba(10, 5, 7, 0.4)',
          }}
        >
          <div
            className="bc-cinzel bc-tracked-soft"
            style={{ fontSize: 10, color: 'var(--bc-warning)', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Clock size={11} /> DURACAO
          </div>
          <Field
            label="Dados de turnos"
            placeholder="Ex: 1d4 (vazio = cena inteira)"
            {...register('durationDice')}
          />
        </div>
      </div>
    </Modal>
  );
}
