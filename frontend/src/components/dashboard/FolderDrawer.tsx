/**
 * FolderDrawer — wrapper responsivo do FolderSidebar.
 *
 *   - Desktop/tablet (>=640px): renderiza FolderSidebar inline como aside lateral.
 *   - Mobile (<640px): renderiza um trigger "PASTAS" no fluxo + drawer off-canvas
 *     com backdrop. Esc, tap-no-backdrop e selecao de pasta fecham o drawer.
 *     Focus trap dentro do drawer + body scroll lock + restore foco no trigger.
 *
 * Auto-fecha o drawer ao selecionar uma pasta (UX mobile padrao).
 */
import { useEffect, useId, useRef, useState } from 'react';
import { Layers, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { FolderSidebar } from './FolderSidebar';
import type { FolderSelection } from './FolderSidebar';
import type { CharacterSummary, Folder } from '@/types/character';

interface Props {
  folders: Folder[];
  characters: CharacterSummary[];
  selected: FolderSelection;
  onSelect: (sel: FolderSelection) => void;
  onCreate: (name: string) => Promise<void> | void;
  onRename: (folderId: string, name: string) => Promise<void> | void;
  onDelete: (folder: Folder) => Promise<void> | void;
  busy?: boolean;
}

export function FolderDrawer(props: Props) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useFocusTrap(drawerRef, isMobile && open);

  // Esc fecha + bloqueia scroll body enquanto drawer aberto.
  useEffect(() => {
    if (!isMobile || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobile, open]);

  // Restaura foco no trigger quando o drawer fechar (apos mobile).
  useEffect(() => {
    if (isMobile && !open) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [isMobile, open]);

  // Intercepta onSelect pra fechar o drawer automaticamente em mobile.
  const handleSelect = (sel: FolderSelection) => {
    props.onSelect(sel);
    if (isMobile) setOpen(false);
  };

  if (!isMobile) {
    return <FolderSidebar {...props} />;
  }

  // Label da pasta atual pra mostrar no trigger.
  const currentLabel =
    props.selected === undefined
      ? 'Todas'
      : props.selected === null
        ? 'Sem pasta'
        : (props.folders.find((f) => f.id === props.selected)?.name ?? 'Pasta');

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="bc-folder-sidebar__trigger"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={titleId}
        aria-label="Abrir pastas"
      >
        <Layers size={14} aria-hidden="true" />
        Pastas <span style={{ color: 'var(--bc-gold-bright)' }}>·</span> {currentLabel}
      </button>

      {/* Backdrop */}
      <div
        className={`bc-folder-sidebar__backdrop${open ? ' bc-folder-sidebar__backdrop--open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Off-canvas drawer */}
      <div
        id={titleId}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Pastas"
        className={`bc-folder-sidebar bc-folder-sidebar--drawer${open ? ' bc-folder-sidebar--open' : ''}`}
        // o componente abaixo ja renderiza com a classe base — sobrescrevemos via wrapper:
        style={{ visibility: open ? 'visible' : 'hidden' }}
      >
        {/* Botao fechar no topo do drawer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px 8px 4px',
            marginBottom: -8,
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar pastas"
            style={{
              background: 'transparent',
              border: '1px solid var(--bc-edge)',
              color: 'var(--bc-ink-dim)',
              width: 32,
              height: 32,
              borderRadius: 'var(--bc-radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>
        <FolderSidebar {...props} onSelect={handleSelect} />
      </div>
    </>
  );
}
