/**
 * Moldura ornamentada — gradient sutil, hairline interior dourado,
 * filigrana SVG nos 4 cantos. Variantes solid/glass.
 */
import type { CSSProperties, ReactNode } from 'react';
import { FiligreeCorner } from './FiligreeCorner';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'solid' | 'glass';
  /** Aplica espacamento interno: 'sm' (20px) ou 'md' (32px). 'none' nao adiciona. */
  padding?: 'none' | 'sm' | 'md';
  /** Esconde os cantos filigrana (uso ocasional pra wrappers internos) */
  noCorners?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function HeraldicFrame({
  children,
  variant = 'default',
  padding = 'none',
  noCorners = false,
  className = '',
  style,
}: Props) {
  const variantClass =
    variant === 'solid' ? 'bc-frame--solid'
    : variant === 'glass' ? 'bc-frame--glass'
    : '';
  const paddingClass =
    padding === 'md' ? 'bc-frame--padded'
    : padding === 'sm' ? 'bc-frame--padded-sm'
    : '';

  return (
    <div
      className={['bc-frame', variantClass, paddingClass, className].filter(Boolean).join(' ')}
      style={style}
    >
      <div className="bc-frame__inner" aria-hidden="true" />
      {!noCorners && (
        <>
          <div className="bc-frame__corner bc-frame__corner--tl">
            <FiligreeCorner />
          </div>
          <div className="bc-frame__corner bc-frame__corner--tr">
            <FiligreeCorner />
          </div>
          <div className="bc-frame__corner bc-frame__corner--bl">
            <FiligreeCorner />
          </div>
          <div className="bc-frame__corner bc-frame__corner--br">
            <FiligreeCorner />
          </div>
        </>
      )}
      {children}
    </div>
  );
}
