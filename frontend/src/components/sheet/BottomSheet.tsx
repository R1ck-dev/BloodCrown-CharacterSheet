/**
 * BottomSheet — painel deslizante a partir do rodape, padrao mobile.
 *
 * Substitui FloatingPanel em viewport mobile (LeftDock vira BottomDock e
 * abre seus paineis aqui). Tambem e' usado pelo Modal em mobile (Etapa 5).
 *
 * UX:
 *   - Slide-up via motion.div com transition spring.
 *   - Drag-to-dismiss: arrastar pra baixo > 120px OU velocity > 500 fecha.
 *     Threshold mais alto que o tipico (100px) pra evitar dismiss acidental
 *     em tap-drift.
 *   - Backdrop blur + tap-to-close.
 *   - Handle "grip" no topo (decorativo + indica gesto).
 *
 * A11y:
 *   - role="dialog" + aria-modal="true" + aria-labelledby pro titulo.
 *   - Focus trap (useFocusTrap) cicla Tab/Shift+Tab dentro do sheet.
 *   - Esc fecha. Restaura foco no trigger ao fechar.
 *   - body { overflow: hidden } enquanto aberto.
 *
 * Render via portal pra escapar de stacking contexts.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** ID estavel pra aria-labelledby. Default gerado a partir do titulo. */
  titleId?: string;
}

const DISMISS_OFFSET_PX = 120;
const DISMISS_VELOCITY = 500;

export function BottomSheet({ isOpen, onClose, title, children, footer, titleId }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const labelId = titleId ?? `bc-bs-${title.replace(/\s+/g, '-').toLowerCase()}`;

  useFocusTrap(sheetRef, isOpen);

  // Esc fecha + bloqueia scroll do body enquanto aberto.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DISMISS_OFFSET_PX || info.velocity.y > DISMISS_VELOCITY) {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(6px)',
              zIndex: 'var(--bc-z-modal)',
            }}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelId}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: '85dvh',
              background:
                'linear-gradient(180deg, rgba(26, 24, 32, 0.98), rgba(14, 10, 18, 0.98))',
              borderTop: '1px solid var(--bc-edge-strong)',
              borderTopLeftRadius: 'var(--bc-radius-md)',
              borderTopRightRadius: 'var(--bc-radius-md)',
              boxShadow: 'var(--bc-shadow-xl), inset 0 1px 0 rgba(212, 175, 55, 0.10)',
              backdropFilter: 'blur(12px)',
              zIndex: 'calc(var(--bc-z-modal) + 1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Handle grip — alvo principal pra drag */}
            <div
              style={{
                padding: '10px 0 6px',
                display: 'flex',
                justifyContent: 'center',
                touchAction: 'none',
                cursor: 'grab',
              }}
              aria-hidden="true"
            >
              <span
                style={{
                  display: 'block',
                  width: 40,
                  height: 4,
                  borderRadius: 'var(--bc-radius-pill)',
                  background: 'color-mix(in srgb, var(--bc-gold) 35%, transparent)',
                }}
              />
            </div>

            {/* Header */}
            <header
              style={{
                padding: '6px 16px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: '1px solid var(--bc-edge)',
              }}
            >
              <span style={{ color: 'var(--bc-gold)', fontSize: 12 }} aria-hidden="true">
                ✦
              </span>
              <h2
                id={labelId}
                className="bc-cinzel bc-tracked"
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: 'var(--bc-gold-bright)',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--bc-edge)',
                  color: 'var(--bc-ink-dim)',
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--bc-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            </header>

            {/* Conteudo scrollavel */}
            <div
              className="bc-scroll"
              style={{
                padding: '12px 16px 16px',
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
                touchAction: 'pan-y',
              }}
            >
              {children}
            </div>

            {footer && (
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid var(--bc-edge)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
