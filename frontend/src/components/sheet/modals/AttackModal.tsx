/**
 * Modal de ataque — opera em 2 modos:
 *   - Create (sem prop `attack`): defaults vazios.
 *   - Edit (com prop `attack`): preenche campos, troca titulo e botao.
 * onSave recebe o mesmo payload em ambos os casos — parent decide create vs update.
 */
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './Modal';
import { Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import type { Attack, NewAttackInput } from '@/types/character';

const schema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatorio.'),
  damageDice: z.string().trim().min(1, 'Formula obrigatoria (ex: 1d8+2).'),
  description: z.string().default(''),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewAttackInput) => Promise<void>;
  busy?: boolean;
  /** Se fornecida, modal opera em modo edit. */
  attack?: Attack;
}

export function AttackModal({ isOpen, onClose, onSave, busy = false, attack }: Props) {
  const isEdit = !!attack;
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: attack?.name ?? '',
      damageDice: attack?.damageDice ?? '',
      description: attack?.description ?? '',
    },
  });

  // Reseta o form quando o modal reabre (com defaults da `attack` em edit).
  useEffect(() => {
    if (isOpen) {
      reset({
        name: attack?.name ?? '',
        damageDice: attack?.damageDice ?? '',
        description: attack?.description ?? '',
      });
    }
  }, [isOpen, attack, reset]);

  const submit = handleSubmit(async (data) => {
    await onSave(data);
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Ataque' : 'Novo Ataque'}
      maxWidth={480}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={isSubmitting || busy}>
            {isEdit ? 'Atualizar Ataque' : 'Criar Ataque'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field
          label="Nome do ataque"
          placeholder="Ex: Espada longa"
          autoFocus
          {...register('name')}
          error={errors.name?.message}
        />
        <Field
          label="Dano (formula)"
          placeholder="Ex: 2d8+2"
          {...register('damageDice')}
          error={errors.damageDice?.message}
          hint={!errors.damageDice ? 'Aceita XdY +/− mod (ex: 1d6, 2d8+3, 1d12−1)' : undefined}
        />
        <div className="bc-field">
          <label htmlFor="atk-desc" className="bc-field__label">
            Descricao (Markdown)
          </label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <MarkdownEditor
                id="atk-desc"
                value={field.value}
                onChange={field.onChange}
                placeholder="**Ex:** Rolar Luta + Forca."
                rows={3}
                minHeight={80}
              />
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
