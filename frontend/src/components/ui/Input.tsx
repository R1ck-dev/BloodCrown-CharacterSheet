/**
 * Input + Field — primitivos de formulario.
 *
 *   Input  = <input> estilizado standalone, suporta icones esquerda/direita
 *   Field  = wrapper com label + Input + erro/hint inline
 *
 * Compativel com React Hook Form via {...register('name')} ou ref forwarding.
 * React 19: ref como prop normal.
 */
import type { InputHTMLAttributes, ReactNode, Ref } from 'react';

type Size = 'sm' | 'md';
type Variant = 'default' | 'bare';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  size?: Size;
  variant?: Variant;
  /** Reflete em aria-invalid e na cor da borda */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  iconLeft,
  iconRight,
  size = 'md',
  variant = 'default',
  invalid = false,
  className = '',
  ref,
  ...rest
}: InputProps) {
  const inputClasses = [
    'bc-input',
    size === 'sm' && 'bc-input--sm',
    variant === 'bare' && 'bc-input--bare',
    iconLeft && 'bc-input--with-icon-left',
    iconRight && 'bc-input--with-icon-right',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="bc-input-wrap">
      {iconLeft && (
        <span className="bc-input-icon bc-input-icon--left" aria-hidden="true">
          {iconLeft}
        </span>
      )}
      <input
        ref={ref}
        className={inputClasses}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {iconRight && (
        <span className="bc-input-icon bc-input-icon--right" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Field — wrapper de label + Input + erro/hint
// ============================================================================

interface FieldProps extends InputProps {
  /** Label uppercase dourada acima do input */
  label?: string;
  /** Mensagem de erro embaixo (estiliza input como invalid automaticamente) */
  error?: string;
  /** Hint cinza italico embaixo (mutex com error) */
  hint?: string;
  /** ID do input — obrigatorio se houver label (a11y label-for binding) */
  id?: string;
}

export function Field({
  label,
  error,
  hint,
  id,
  ref,
  ...inputProps
}: FieldProps) {
  const inputId = id || (label ? `field-${Math.random().toString(36).slice(2, 8)}` : undefined);
  const messageId = error || hint ? `${inputId}-msg` : undefined;

  return (
    <div className="bc-field">
      {label && (
        <label htmlFor={inputId} className="bc-field__label">
          {label}
        </label>
      )}
      <Input
        id={inputId}
        ref={ref}
        invalid={Boolean(error) || inputProps.invalid}
        aria-describedby={messageId}
        {...inputProps}
      />
      {error && (
        <span id={messageId} className="bc-field__error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={messageId} className="bc-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}
