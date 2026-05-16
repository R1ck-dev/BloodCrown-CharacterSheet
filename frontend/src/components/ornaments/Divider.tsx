/**
 * Linha horizontal ornamental com glyph central opcional.
 * role="separator" pra a11y.
 */
import type { ReactNode } from 'react';

interface Props {
  /** Glyph ou label central — ex: '✦', '◆', '✶ Acesso ✶' */
  glyph?: ReactNode;
  variant?: 'default' | 'solid' | 'blood';
  className?: string;
}

export function Divider({ glyph = '✦', variant = 'default', className = '' }: Props) {
  const variantClass =
    variant === 'solid' ? 'bc-divider--solid'
    : variant === 'blood' ? 'bc-divider--blood'
    : '';

  return (
    <div
      className={`bc-divider ${variantClass} ${className}`.trim()}
      role="separator"
      aria-orientation="horizontal"
    >
      {glyph && <span className="bc-divider__glyph" aria-hidden="true">{glyph}</span>}
    </div>
  );
}
