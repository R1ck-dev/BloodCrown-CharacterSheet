/**
 * Modal de item — opera em 2 modos:
 *   - Create (sem prop `item`): defaults vazios.
 *   - Edit (com prop `item`): preenche campos, troca titulo e botao.
 * onSave recebe o mesmo payload em ambos os casos — parent decide create vs update.
 *
 * Campos:
 *   - Nome, Descricao, Quantidade (sempre)
 *   - Alvo do efeito (Defesa | Economia | Pocao | nenhum)
 *   - Valor (effectValue, para Defesa e Economia)
 *   - Formula (useDice, apenas para Pocoes)
 */
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import type { InventoryItem, NewItemInput } from '@/types/character';
import { STATUS_TARGETS, ECONOMY_TARGETS, POTION_TARGETS, TARGET_LABELS } from '@/lib/buffTargets';

const schema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatorio.'),
  description: z.string().default(''),
  targetAttribute: z.string().default('none'),
  effectValue: z.coerce.number().int().default(0),
  quantity: z.coerce.number().int().min(0, 'Minimo 0.').default(1),
  useDice: z.string().default(''),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewItemInput) => Promise<void>;
  busy?: boolean;
  /** Se fornecida, modal opera em modo edit. */
  item?: InventoryItem;
}

export function ItemModal({ isOpen, onClose, onSave, busy = false, item }: Props) {
  const isEdit = !!item;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name ?? '',
      description: item?.description ?? '',
      targetAttribute: item?.targetAttribute ?? 'none',
      effectValue: item?.effectValue ?? 0,
      quantity: item?.quantity ?? 1,
      useDice: item?.useDice ?? '',
    },
  });

  // Reseta o form quando o modal reabre (defaults da `item` em edit).
  useEffect(() => {
    if (isOpen) {
      reset({
        name: item?.name ?? '',
        description: item?.description ?? '',
        targetAttribute: item?.targetAttribute ?? 'none',
        effectValue: item?.effectValue ?? 0,
        quantity: item?.quantity ?? 1,
        useDice: item?.useDice ?? '',
      });
    }
  }, [isOpen, item, reset]);

  const submit = handleSubmit(async (data) => {
    await onSave(data);
    onClose();
  });

  const target = watch('targetAttribute');
  const isEconomy = target.startsWith('REDUCE');
  const isPotion = target.startsWith('RESTORE');
  const hasEffect = target !== 'none';
  const needsValue = hasEffect && !isPotion; // Defesa + Economia usam effectValue
  const needsDice = isPotion;                  // Pocao usa useDice

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Item' : 'Novo Item'}
      maxWidth={520}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} loading={isSubmitting || busy}>
            {isEdit ? 'Atualizar Item' : 'Criar Item'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <Field
            label="Nome"
            placeholder="Ex: Espada de Aco Negro"
            autoFocus
            {...register('name')}
            error={errors.name?.message}
          />
          <Field
            label="Quantidade"
            type="number"
            min={0}
            placeholder="1"
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message}
          />
        </div>

        <div className="bc-field">
          <label className="bc-field__label" htmlFor="item-desc">Descricao (Markdown)</label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <MarkdownEditor
                id="item-desc"
                value={field.value}
                onChange={field.onChange}
                placeholder="Detalhes do item."
                rows={3}
                minHeight={80}
              />
            )}
          />
        </div>

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
            <Sparkles size={11} /> EFEITO DO ITEM
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: needsValue || needsDice ? '2fr 1fr' : '1fr', gap: 10 }}>
            <div className="bc-field">
              <label className="bc-field__label" htmlFor="item-target">Tipo</label>
              <select
                id="item-target"
                {...register('targetAttribute')}
                className="bc-input"
                style={{ height: 44 }}
              >
                <option value="none">Nenhum (apenas item)</option>
                <optgroup label="Defesa (ao equipar)">
                  {STATUS_TARGETS.map((t) => (
                    <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                  ))}
                </optgroup>
                <optgroup label="Reducao de custo (ao equipar)">
                  {ECONOMY_TARGETS.map((t) => (
                    <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                  ))}
                </optgroup>
                <optgroup label="Pocao (ao usar)">
                  {POTION_TARGETS.map((t) => (
                    <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            {needsValue && (
              <Field
                label={isEconomy ? 'Reduz' : 'Valor'}
                type="number"
                placeholder={isEconomy ? '10' : '±'}
                {...register('effectValue', { valueAsNumber: true })}
              />
            )}
            {needsDice && (
              <Field
                label="Formula"
                type="text"
                placeholder="2d6+1"
                {...register('useDice')}
              />
            )}
          </div>
          {isEconomy && (
            <p style={{ fontSize: 11, color: 'var(--bc-ink-faint)', margin: '8px 0 0', fontStyle: 'italic' }}>
              Quando equipado, reduz em <b>{watch('effectValue') || 0}</b> o custo base de 50 ao recuperar usos de habilidade.
            </p>
          )}
          {isPotion && (
            <p style={{ fontSize: 11, color: 'var(--bc-ink-faint)', margin: '8px 0 0', fontStyle: 'italic' }}>
              Botao "Usar" no card vai rolar a formula e somar a barra correspondente (cap no maximo). Decrementa quantidade em 1.
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
