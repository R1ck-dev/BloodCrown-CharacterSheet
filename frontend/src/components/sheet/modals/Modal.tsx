/**
 * Modal base — backdrop com blur + frame heraldico centralizado.
 * Esc fecha. Click no backdrop fecha. Focus trap dentro do dialog. Foco
 * volta pro trigger ao fechar.
 *
 * Motion (v12+) AnimatePresence pra entry/exit. Importa de 'motion/react'
 * (substitui framer-motion no ecossistema React 19). Renderiza via portal
 * pra escapar do stacking context da Sheet (que tem position:sticky no header).
 *
 * Em viewport mobile delega 100% pro BottomSheet (slide-up + drag-dismiss)
 * preservando o HeraldicFrame por dentro pra manter a identidade visual.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { HeraldicFrame } from '@/components/ornaments/HeraldicFrame';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { BottomSheet } from '@/components/sheet/BottomSheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Largura maxima do modal em desktop. Em mobile vira sempre full-width via BottomSheet. */
  maxWidth?: number;
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = 520 }: Props) {
  const isMobile = useIsMobile();

  // Em mobile delega pro BottomSheet (preserva ornamento envolvendo o conteudo).
  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
        {children}
      </BottomSheet>
    );
  }

  return <DesktopModal {...{ isOpen, onClose, title, children, footer, maxWidth }} />;
}

function DesktopModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth,
}: Required<Pick<Props, 'isOpen' | 'onClose' | 'title' | 'children' | 'maxWidth'>> &
  Pick<Props, 'footer'>) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Ref ao onClose pra evitar que o effect re-rode quando o pai passa
  // uma arrow inline (re-render do pai cria nova ref a cada render e o
  // cleanup roubava foco do textarea a cada tecla — caso do notepad).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 'var(--bc-z-modal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(12px, 3vw, 24px)',
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bc-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            style={{
              width: '100%',
              maxWidth: `min(${maxWidth}px, calc(100vw - 32px))`,
              maxHeight: '90dvh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <HeraldicFrame
              variant="solid"
              padding="md"
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'transparent',
                  border: '1px solid var(--bc-edge)',
                  color: 'var(--bc-ink-dim)',
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--bc-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                <X size={14} />
              </button>

              <h2
                id="bc-modal-title"
                className="bc-cinzel bc-tracked"
                style={{
                  fontSize: 16,
                  color: 'var(--bc-gold-bright)',
                  margin: 0,
                  marginBottom: 18,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--bc-edge)',
                }}
              >
                {title}
              </h2>

              <div className="bc-scroll" style={{ overflowY: 'auto', minHeight: 0, flex: 1 }}>
                {children}
              </div>

              {footer && (
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: '1px solid var(--bc-edge)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                  }}
                >
                  {footer}
                </div>
              )}
            </HeraldicFrame>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
