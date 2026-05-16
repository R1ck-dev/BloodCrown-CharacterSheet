/**
 * Editor de Markdown controlado. 2 modos:
 *   - tabs (default): 2 abas "Editar | Visualizar" — bom pra modais compactos.
 *   - split: textarea esquerda + preview direita — bom pra textos longos (biography, notepad).
 *
 * Use com Controller do RHF (componente controlled, nao da pra usar register direto).
 */
import { useState, type CSSProperties } from 'react';
import { Pencil, Eye } from 'lucide-react';
import { MarkdownView } from './MarkdownView';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  mode?: 'tabs' | 'split';
  /** Tamanho minimo do textarea (px). */
  minHeight?: number;
  id?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 5,
  mode = 'tabs',
  minHeight = 100,
  id,
}: Props) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  const textareaStyle: CSSProperties = {
    resize: 'vertical',
    minHeight,
    width: '100%',
    fontFamily: 'var(--bc-font-mono)',
    fontSize: 13,
  };

  if (mode === 'split') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, minHeight }}>
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bc-input bc-scroll"
          style={textareaStyle}
        />
        <div
          className="bc-scroll"
          style={{
            background: 'rgba(10, 5, 7, 0.4)',
            border: '1px solid var(--bc-edge)',
            borderRadius: 'var(--bc-radius-sm)',
            padding: '10px 12px',
            overflowY: 'auto',
            minHeight,
            maxHeight: '70vh',
          }}
        >
          {value.trim() ? (
            <MarkdownView source={value} fontSize={13} />
          ) : (
            <p style={{ color: 'var(--bc-ink-faint)', fontStyle: 'italic', fontSize: 12, margin: 0 }}>
              Preview vazio. Comece a escrever na esquerda.
            </p>
          )}
        </div>
      </div>
    );
  }

  // mode === 'tabs'
  return (
    <div>
      <div
        role="tablist"
        style={{
          display: 'inline-flex',
          gap: 4,
          marginBottom: 6,
          background: 'rgba(10, 5, 7, 0.5)',
          padding: 3,
          borderRadius: 'var(--bc-radius-sm)',
          border: '1px solid var(--bc-edge)',
        }}
      >
        <TabBtn active={tab === 'edit'} onClick={() => setTab('edit')} icon={<Pencil size={11} />} label="Editar" />
        <TabBtn active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Eye size={11} />} label="Visualizar" />
      </div>
      {tab === 'edit' ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bc-input"
          style={textareaStyle}
        />
      ) : (
        <div
          className="bc-scroll"
          style={{
            background: 'rgba(10, 5, 7, 0.4)',
            border: '1px solid var(--bc-edge)',
            borderRadius: 'var(--bc-radius-sm)',
            padding: '10px 12px',
            minHeight,
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {value.trim() ? (
            <MarkdownView source={value} fontSize={13} />
          ) : (
            <p style={{ color: 'var(--bc-ink-faint)', fontStyle: 'italic', fontSize: 12, margin: 0 }}>
              Vazio — volte pra aba Editar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        background: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
        border: 'none',
        color: active ? 'var(--bc-gold-bright)' : 'var(--bc-ink-dim)',
        padding: '4px 10px',
        fontSize: 10,
        fontFamily: 'var(--bc-font-display)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        borderRadius: 3,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
