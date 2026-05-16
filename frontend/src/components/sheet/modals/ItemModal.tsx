/**
 * Modal de item — opera em 2 modos:
 *   - Create (sem prop `item`): defaults vazios.
 *   - Edit (com prop `item`): preenche campos, troca titulo e botao.
 * onSave recebe o mesmo payload em ambos os casos — parent decide create vs update.
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
import { STATUS_TARGETS, ECONOMY_TARGETS, TARGET_LABELS } from '@/lib/buffTargets';

const schema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatorio.'),
  description: z.string().default(''),
  targetAttribute: z.string().default('none'),
  effectValue: z.coerce.number().int().default(0),
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
      });
    }
  }, [isOpen, item, reset]);

  const submit = handleSubmit(async (data) => {
    await onSave(data);
    onClose();
  });

  const target = watch('targetAttribute');
  const isEconomy = target.startsWith('REDUCE');
  const hasEffect = target !== 'none';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Item' : 'Novo Item'}
      maxWidth={480}
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
        <Field
          label="Nome"
          placeholder="Ex: Espada de Aco Negro"
          autoFocus
          {...register('name')}
          error={errors.name?.message}
        />

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
            <Sparkles size={11} /> EFEITO MAGICO (ao equipar)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: hasEffect && !isEconomy ? '2fr 1fr' : '1fr', gap: 10 }}>
            <div className="bc-field">
              <label className="bc-field__label" htmlFor="item-target">Alvo</label>
              <select
                id="item-target"
                {...register('targetAttribute')}
                className="bc-input"
                style={{ height: 44 }}
              >
                <option value="none">Nenhum (apenas item)</option>
                <optgroup label="Defesa">
                  {STATUS_TARGETS.map((t) => (
                    <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                  ))}
                </optgroup>
                <optgroup label="Economia (custo de habilidade)">
                  {ECONOMY_TARGETS.map((t) => (
                    <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            {hasEffect && !isEconomy && (
              <Field
                label="Valor"
                type="number"
                placeholder="±"
                {...register('effectValue', { valueAsNumber: true })}
              />
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
