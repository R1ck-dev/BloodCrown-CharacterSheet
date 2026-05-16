/**
 * Renderer de Markdown integrado ao design system gotico-ritual.
 * Suporta GFM (tabelas, strikethrough, task lists, autolinks) via remark-gfm.
 * Estilos aplicados via `components` map — sem dependencia de CSS extra.
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { CSSProperties } from 'react';

interface Props {
  source: string;
  /** Override do tamanho de fonte base (default 12 — combina com descricao de card). */
  fontSize?: number;
}

const wrapperBase: CSSProperties = {
  color: 'var(--bc-ink-dim)',
  lineHeight: 1.55,
  fontStyle: 'normal',
  wordBreak: 'break-word',
};

export function MarkdownView({ source, fontSize = 12 }: Props) {
  if (!source || !source.trim()) return null;

  return (
    <div className="bc-md" style={{ ...wrapperBase, fontSize }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="bc-cinzel" style={{ fontSize: fontSize + 6, color: 'var(--bc-gold-bright)', margin: '0.4em 0 0.3em', letterSpacing: '0.08em' }}>{children}</h3>
          ),
          h2: ({ children }) => (
            <h4 className="bc-cinzel" style={{ fontSize: fontSize + 4, color: 'var(--bc-gold-bright)', margin: '0.4em 0 0.3em', letterSpacing: '0.06em' }}>{children}</h4>
          ),
          h3: ({ children }) => (
            <h5 className="bc-cinzel" style={{ fontSize: fontSize + 2, color: 'var(--bc-gold-dim)', margin: '0.4em 0 0.3em' }}>{children}</h5>
          ),
          p: ({ children }) => (
            <p style={{ margin: '0 0 0.5em' }}>{children}</p>
          ),
          strong: ({ children }) => (
            <strong style={{ color: 'var(--bc-ink)', fontWeight: 600 }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em style={{ color: 'var(--bc-gold-dim)' }}>{children}</em>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: '0 0 0.5em', paddingLeft: '1.2em' }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: '0 0 0.5em', paddingLeft: '1.4em' }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: '0.15em 0' }}>{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: '3px solid var(--bc-purple)',
                margin: '0.4em 0',
                padding: '0.2em 0.8em',
                background: 'rgba(123, 44, 191, 0.06)',
                color: 'var(--bc-ink-dim)',
                fontStyle: 'italic',
              }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, ...rest }) => {
            const isInline = !('className' in rest && typeof rest.className === 'string' && rest.className.startsWith('language-'));
            if (isInline) {
              return (
                <code
                  className="bc-mono"
                  style={{
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    color: 'var(--bc-gold-bright)',
                    padding: '0 4px',
                    borderRadius: 3,
                    fontSize: fontSize - 1,
                  }}
                >
                  {children}
                </code>
              );
            }
            return <code className="bc-mono" style={{ fontSize: fontSize - 1 }}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre
              className="bc-scroll"
              style={{
                background: 'rgba(10, 5, 7, 0.6)',
                border: '1px solid var(--bc-edge)',
                borderRadius: 'var(--bc-radius-sm)',
                padding: '0.6em 0.8em',
                margin: '0.4em 0',
                overflow: 'auto',
                fontSize: fontSize - 1,
              }}
            >
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bc-info)', textDecoration: 'underline' }}>
              {children}
            </a>
          ),
          hr: () => (
            <hr style={{ border: 'none', borderTop: '1px solid var(--bc-edge)', margin: '0.8em 0' }} />
          ),
          table: ({ children }) => (
            <table style={{ borderCollapse: 'collapse', width: '100%', margin: '0.4em 0', fontSize: fontSize - 1 }}>
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th style={{ border: '1px solid var(--bc-edge)', padding: '4px 8px', textAlign: 'left', background: 'rgba(212, 175, 55, 0.05)', color: 'var(--bc-gold-bright)' }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{ border: '1px solid var(--bc-edge)', padding: '4px 8px' }}>{children}</td>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
