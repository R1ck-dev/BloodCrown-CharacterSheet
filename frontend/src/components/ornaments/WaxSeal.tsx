/**
 * Selo de cera vermelho-sangue com glyph central. Decorativo —
 * aria-hidden quando puramente ornamental.
 */
import type { ReactNode } from 'react';

interface Props {
  /** Tamanho: sm/md/lg ou numero customizado (em px) */
  size?: 'sm' | 'md' | 'lg';
  variant?: 'blood' | 'gold' | 'purple';
  /** Glyph central — string curta (1-2 chars). Default '✠' */
  glyph?: ReactNode;
  /** Se true, marca aria-hidden (puramente decorativo) */
  decorative?: boolean;
  /** Label acessivel quando nao for decorativo (ex: "selo de aprovacao") */
  ariaLabel?: string;
}

const sizeClass = {
  sm: 'bc-seal--sm',
  md: 'bc-seal--md',
  lg: 'bc-seal--lg',
};

const variantClass = {
  blood: '',
  gold: 'bc-seal--gold',
  purple: 'bc-seal--purple',
};

export function WaxSeal({
  size = 'md',
  variant = 'blood',
  glyph = '✠',
  decorative = true,
  ariaLabel,
}: Props) {
  return (
    <div
      className={`bc-seal ${sizeClass[size]} ${variantClass[variant]}`.trim()}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={!decorative ? ariaLabel : undefined}
      role={!decorative ? 'img' : undefined}
    >
      {glyph}
    </div>
  );
}
