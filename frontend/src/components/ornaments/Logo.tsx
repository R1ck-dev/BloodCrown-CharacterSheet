/**
 * Logo BLOOD CROWN — BLOOD em branco, CROWN com shimmer dourado animado.
 * Tamanhos: sm (navbar), md (auth pages), lg (login hero), xl (splash futuro).
 */

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Renderiza como h1 ao inves de div (uso semantico em landing/login) */
  as?: 'div' | 'h1' | 'h2';
}

/* Cinzel a tamanhos grandes + tracking 0.22em estoura cards de ~420px.
   Tracking reduzido em lg/xl + fs menor mantem presenca de hero sem overflow. */
const sizes = {
  sm: { fs: 18, gap: 6,  tracking: '0.22em' },
  md: { fs: 26, gap: 8,  tracking: '0.20em' },
  lg: { fs: 34, gap: 10, tracking: '0.18em' },
  xl: { fs: 46, gap: 12, tracking: '0.18em' },
};

export function Logo({ size = 'lg', as: Tag = 'div' }: Props) {
  const s = sizes[size];
  return (
    <Tag
      style={{
        fontFamily: 'var(--bc-font-display)',
        fontWeight: 700,
        fontSize: s.fs,
        letterSpacing: s.tracking,
        display: 'inline-flex',
        justifyContent: 'center',
        gap: s.gap,
        lineHeight: 1,
        margin: 0,
        whiteSpace: 'nowrap',
        /* Tracking aplica apos a ultima letra, criando ~0.2em extra a direita.
           Margin negativa compensa pra alinhamento visual centrado. */
        marginRight: `-${s.tracking}`,
      }}
      aria-label="BloodCrown"
    >
      <span style={{ color: '#FBF6E4', textShadow: '0 0 14px rgba(255,255,255,0.15)' }}>BLOOD</span>
      <span className="bc-shimmer">CROWN</span>
    </Tag>
  );
}
