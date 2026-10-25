import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export interface ToastInput {
  title: string;
  subtitle?: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastInput {
  id: number;
}

const Ctx = createContext<(t: ToastInput) => void>(() => {});

export const useToast = () => useContext(Ctx);

/** Ink toast above the tab bar, auto-dismissed after 5 seconds (DESIGN.md › Toast). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(1);

  const show = useCallback((t: ToastInput) => {
    const id = next.current++;
    setItems((cur) => [...cur.slice(-1), { ...t, id }]);
    window.setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== id)), 5000);
  }, []);

  const dismiss = (id: number) => setItems((cur) => cur.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 z-50 mx-auto flex max-w-[480px] flex-col gap-2 px-4" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}>
        {items.map((t) => {
          const Icon = t.tone === 'success' ? CircleCheck : t.tone === 'info' ? Info : TriangleAlert;
          const iconColor = t.tone === 'success' ? 'text-income' : t.tone === 'danger' ? 'text-expense' : t.tone === 'info' ? 'text-on-primary' : 'text-warning';
          return (
            <div key={t.id} role="status" className="anim-toast pointer-events-auto flex items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-on-primary shadow-[0_8px_24px_rgba(15,23,42,0.24)]">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 dark:bg-black/10 ${iconColor}`}>
                <Icon size={20} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="t-label leading-snug">{t.title}</p>
                {t.subtitle && <p className="t-body-sm opacity-70">{t.subtitle}</p>}
              </div>
              {t.action && (
                <button
                  className="t-label shrink-0 px-1 py-2"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
