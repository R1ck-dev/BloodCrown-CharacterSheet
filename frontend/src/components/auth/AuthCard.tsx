/**
 * AuthCard — wrapper visual compartilhado por Login e Register.
 *
 * Composicao:
 *   - Glyph gigante de fundo (♚, ~5% opacity) — peso visual sem distrair
 *   - Halo radial roxo atras do card
 *   - Arco gotico SVG no topo (gradient dourado + estrela central)
 *   - HeraldicFrame com cantos filigrana (sem borda superior — continua o arco)
 *   - Pendant SVG embaixo com gema de sangue
 *
 * Children sao renderizados dentro do frame; AuthCard se encarrega do chrome.
 */
import type { ReactNode } from 'react';
import { HeraldicFrame } from '@/components/ornaments/HeraldicFrame';
import { Logo } from '@/components/ornaments/Logo';
import { Divider } from '@/components/ornaments/Divider';

interface Props {
  /** Glyph central do divider abaixo do logo. Ex: '✶  Acesso  ✶' */
  dividerGlyph?: string;
  /** Titulo abaixo do divider (ex: 'Criar Conta'). Opcional. */
  title?: string;
  /** Subtitulo italico abaixo do titulo. Opcional. */
  subtitle?: string;
  children: ReactNode;
  /** Rodape custom (link "Criar agora" / "Fazer login") */
  footer?: ReactNode;
}

export function AuthCard({ dividerGlyph = '✶  Acesso  ✶', title, subtitle, children, footer }: Props) {
  return (
    <div
      className="bc-page bc-grain"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Glyph heraldico gigante de fundo (decorativo) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 800,
          fontFamily: 'var(--bc-font-display)',
          color: 'rgba(212, 175, 55, 0.025)',
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 0.8,
          fontWeight: 700,
          zIndex: 1,
        }}
      >
        ♚
      </div>

      <div style={{ position: 'relative', width: 420, zIndex: 2 }}>
        {/* Arco gotico SVG no topo */}
        <svg
          viewBox="0 0 420 80"
          aria-hidden="true"
          style={{ display: 'block', width: '100%', height: 60, marginBottom: -1 }}
        >
          <defs>
            <linearGradient id="bc-arch-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="rgba(212,175,55,0.5)" />
              <stop offset="1" stopColor="rgba(212,175,55,0.15)" />
            </linearGradient>
          </defs>
          <path
            d="M0 80 L0 40 Q210 -20 420 40 L420 80 Z"
            fill="rgba(26,24,32,0.92)"
            stroke="url(#bc-arch-grad)"
            strokeWidth="1"
          />
          {/* Diamante central */}
          <path d="M210 12 L214 22 L210 32 L206 22 Z" fill="rgba(212,175,55,0.6)" />
          <circle cx="210" cy="22" r="1.5" fill="#F5D76E" />
          {/* Linhas decorativas laterais */}
          <line x1="80" y1="58" x2="180" y2="32" stroke="rgba(212,175,55,0.25)" strokeWidth="0.5" />
          <line x1="340" y1="58" x2="240" y2="32" stroke="rgba(212,175,55,0.25)" strokeWidth="0.5" />
        </svg>

        <HeraldicFrame
          style={{
            padding: '36px 38px 32px',
            borderTop: 'none',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        >
          {/* Logo + subline */}
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <Logo size="lg" as="h1" />
          </div>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span
              className="bc-cinzel bc-tracked"
              style={{ fontSize: 11, color: 'var(--bc-gold-dim)', fontWeight: 500 }}
            >
              R · P · G &nbsp;·&nbsp; M · A · N · A · G · E · R
            </span>
          </div>

          <Divider glyph={dividerGlyph} />

          {/* Titulo opcional */}
          {title && (
            <div style={{ textAlign: 'center', marginTop: 24, marginBottom: subtitle ? 6 : 22 }}>
              <h2
                className="bc-cinzel bc-tracked"
                style={{ fontSize: 18, color: 'var(--bc-ink)', fontWeight: 600, margin: 0 }}
              >
                {title.toUpperCase()}
              </h2>
              {subtitle && (
                <p
                  style={{
                    color: 'var(--bc-ink-dim)',
                    fontSize: 13,
                    fontStyle: 'italic',
                    margin: '6px 0 22px',
                    letterSpacing: '0.03em',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {!title && <div style={{ marginTop: 24 }} />}

          {children}

          {footer && (
            <div
              style={{
                textAlign: 'center',
                marginTop: 24,
                paddingTop: 20,
                borderTop: '1px solid rgba(212, 175, 55, 0.1)',
              }}
            >
              {footer}
            </div>
          )}
        </HeraldicFrame>

        {/* Pendant embaixo do card — gema de sangue */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -1 }}>
          <svg width="80" height="40" viewBox="0 0 80 40" aria-hidden="true">
            <path
              d="M0 0 L40 30 L80 0 L80 1 L40 31 L0 1 Z"
              fill="rgba(26,24,32,0.92)"
              stroke="rgba(212,175,55,0.3)"
              strokeWidth="1"
            />
            <circle
              cx="40"
              cy="28"
              r="2.5"
              fill="#8A0303"
              stroke="rgba(212,175,55,0.6)"
              strokeWidth="0.6"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
