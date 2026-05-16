/**
 * Button — variant primary/ghost/danger + size sm/md/lg.
 * Suporta loading state (desabilita interacao + spinner inline).
 * React 19: ref como prop normal (sem forwardRef).
 */
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  /** Conteudo do botao. Se for so icone, passe ariaLabel descritivo. */
  children: ReactNode;
  /** Obrigatorio quando o botao mostra so um icone (a11y) */
  'aria-label'?: string;
  ref?: Ref<HTMLButtonElement>;
}

const variantClass: Record<Variant, string> = {
  primary: 'bc-btn--primary',
  ghost:   'bc-btn--ghost',
  danger:  'bc-btn--danger',
};

const sizeClass: Record<Size, string> = {
  sm: 'bc-btn--sm',
  md: '',
  lg: 'bc-btn--lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  disabled,
  className = '',
  type = 'button',
  children,
  ref,
  ...rest
}: Props) {
  const classes = [
    'bc-btn',
    variantClass[variant],
    sizeClass[size],
    block && 'bc-btn--block',
    loading && 'bc-btn--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
