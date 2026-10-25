import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Bottom sheet with grab handle and dimmed backdrop (DESIGN.md › Layout, Elevation). */
export function Sheet({ open, onClose, title, subtitle, children, footer }: { open: boolean; onClose: () => void; title?: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="anim-fade absolute inset-0" style={{ background: 'var(--c-backdrop)' }} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="anim-sheet relative flex max-h-[92dvh] w-full max-w-[480px] flex-col rounded-t-3xl bg-surface shadow-[0_-8px_32px_rgba(15,23,42,0.12)]"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-outline" />
        {title && (
          <div className="flex shrink-0 items-start justify-between gap-3 px-6 pb-3 pt-3">
            <div>
              <h2 className="t-headline-md text-ink">{title}</h2>
              {subtitle && <p className="t-body-sm text-sub">{subtitle}</p>}
            </div>
            <button aria-label="Tutup" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sub">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">{children}</div>
        {footer && <div className="pb-safe shrink-0 border-t border-outline px-6 pt-3"><div className="pb-3">{footer}</div></div>}
      </div>
    </div>,
    document.body,
  );
}
