/**
 * Escudo SVG ornamentado com o valor de Classe de Armadura no centro.
 * Visual: corpo do escudo com gradient + borda dourada + hairline interna +
 * label "CA" pequena acima do numero.
 */

interface Props {
  total: number;
  size?: number;
}

export function DefenseShield({ total, size = 92 }: Props) {
  const width = (size / 88) * 76;
  return (
    <div
      style={{
        width,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
      }}
      role="img"
      aria-label={`Classe de Armadura: ${total}`}
    >
      <svg viewBox="0 0 76 88" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <defs>
          <linearGradient id="bc-shield-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2A2335" />
            <stop offset="1" stopColor="#0E0A12" />
          </linearGradient>
        </defs>
        <path
          d="M38 4 L70 12 L70 44 Q70 70 38 84 Q6 70 6 44 L6 12 Z"
          fill="url(#bc-shield-grad)"
          stroke="rgba(212, 175, 55, 0.5)"
          strokeWidth="1.2"
        />
        <path
          d="M38 10 L66 16 L66 44 Q66 66 38 78 Q10 66 10 44 L10 16 Z"
          fill="none"
          stroke="rgba(212, 175, 55, 0.2)"
          strokeWidth="0.5"
        />
      </svg>
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <div
          className="bc-cinzel"
          style={{ fontSize: 9, color: 'var(--bc-gold-dim)', letterSpacing: '0.2em', marginBottom: -2 }}
        >
          CA
        </div>
        <div
          className="bc-cinzel"
          style={{
            fontSize: 30,
            color: 'var(--bc-ink)',
            fontWeight: 700,
            lineHeight: 1,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          {total}
        </div>
      </div>
    </div>
  );
}
