/**
 * Medalhão heráldico — placa de pedra esculpida com aro dourado gravado, abrigando
 * um ícone. Reutilizado em cabeçalhos (Dashboard/Mesa), crests de card de mesa,
 * cabeçalhos de painel e estados vazios. Round ou square; tamanho fluido por prop.
 *
 * NÃO confundir com `.bc-medallion` (a pedra com NÚMERO dos atributos da Ficha).
 * Este usa a classe `.bc-medal` e recebe o ícone já pronto (elemento lucide).
 */
import type { CSSProperties, ReactNode } from 'react';

interface Props {
  /** Ícone já dimensionado pelo chamador (ex.: <Castle size={26} />). */
  icon: ReactNode;
  /** Lado (px) da placa. Quadrada usa raio proporcional (~16%). */
  size?: number;
  shape?: 'round' | 'square';
  className?: string;
  style?: CSSProperties;
  /** Decorativo por padrão (leitor de tela ignora). */
  'aria-label'?: string;
}

export function Medallion({ icon, size = 44, shape = 'square', className = '', style, ...rest }: Props) {
  const borderRadius = shape === 'round' ? '50%' : Math.round(size * 0.16);
  return (
    <span
      className={`bc-medal bc-medal--${shape} ${className}`.trim()}
      style={{ width: size, height: size, borderRadius, ...style }}
      aria-hidden={rest['aria-label'] ? undefined : true}
      aria-label={rest['aria-label']}
    >
      {icon}
    </span>
  );
}
