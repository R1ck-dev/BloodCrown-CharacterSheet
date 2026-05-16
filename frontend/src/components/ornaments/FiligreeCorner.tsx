/**
 * SVG ornamental usado nos 4 cantos de HeraldicFrame.
 * Decorativo — aria-hidden true (leitor de tela ignora).
 */

interface Props {
  size?: number;
  color?: string;
  opacity?: number;
}

export function FiligreeCorner({ size = 28, color = 'currentColor', opacity = 0.7 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M2 14 L2 8 Q2 2 8 2 L14 2 M2 4 L6 4 M4 2 L4 6 M8 6 Q8 8 10 8"
        stroke={color}
        strokeWidth="1"
        opacity={opacity}
        strokeLinecap="round"
      />
      <circle cx="4" cy="4" r="1.2" fill={color} opacity={opacity} />
      <circle cx="9" cy="9" r="0.8" fill={color} opacity={opacity * 0.6} />
    </svg>
  );
}
