/**
 * PromptModal — modal temático de campo único (substitui window.prompt).
 *
 * Reusa o Modal base (HeraldicFrame + focus trap + Esc/backdrop) com um único input.
 * Enter confirma, botão Cancelar/Esc fecha. O valor é semeado com `initialValue` toda vez
 * que o modal abre. Usado por: criar mesa, criar/renomear cena, URL do mapa, nova pasta.
 */
import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/sheet/modals/Modal';
import { Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Props {
  isOpen: boolean;
  title: string;
  /** Label dourada acima do input. */
  label?: string;
  placeholder?: string;
  initialValue?: string;
  confirmText?: string;
  hint?: string;
  /** Transforma o valor a cada tecla (ex.: uppercase pra código de convite). */
  transform?: (v: string) => string;
  /** Permite confirmar com o campo vazio (default false → botão desabilitado). */
  allowEmpty?: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export function PromptModal({
  isOpen,
  title,
  label,
  placeholder,
  initialValue = '',
  confirmText = 'Confirmar',
  hint,
  transform,
  allowEmpty = false,
  onConfirm,
  onClose,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Semeia o valor (e foca) sempre que abre.
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      // Foco depois da animação de entrada do Modal.
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [isOpen, initialValue]);

  const podeConfirmar = allowEmpty || value.trim().length > 0;

  const confirmar = () => {
    if (!podeConfirmar) return;
    onConfirm(value.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={440}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!podeConfirmar}>
            {confirmText}
          </Button>
        </>
      }
    >
      <Field
        ref={inputRef}
        label={label}
        hint={hint}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(transform ? transform(e.target.value) : e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            confirmar();
          }
        }}
      />
    </Modal>
  );
}
