import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Currency } from '../db/types';
import { formatMonth, addMonths } from '../lib/dates';
import type { LimitTone } from '../lib/limits';
import { formatMoney } from '../lib/money';

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export function Money({ value, currency, sign = 'auto', approx, className }: { value: number; currency: Currency; sign?: 'auto' | '+' | '-' | 'none'; approx?: boolean; className?: string }) {
  return <span className={cn('tabular-nums', className)}>{formatMoney(value, currency, { sign, approx })}</span>;
}

export function CurrencyBadge({ currency, solid }: { currency: Currency; solid?: boolean }) {
  const cls = solid ? 'bg-white/20 text-white' : currency === 'IDR' ? 'bg-idr-c text-idr' : 'bg-ntd-c text-ntd-text';
  return <span className={cn('t-caps inline-flex h-5 items-center rounded-full px-2', cls)}>{currency}</span>;
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'interest' | 'warning' | 'danger'; className?: string }) {
  const cls = {
    neutral: 'bg-muted text-sub',
    interest: 'bg-interest-c text-interest',
    warning: 'bg-warning-c text-warning',
    danger: 'bg-expense-c text-expense',
  }[tone];
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-semibold', cls, className)}>{children}</span>;
}

export function Segmented<T extends string>({ value, options, onChange, className, accent }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; className?: string; accent?: Partial<Record<T, string>> }) {
  return (
    <div role="tablist" className={cn('flex h-9 rounded-xl bg-muted p-0.5', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              't-label flex-1 rounded-[10px] transition-colors',
              active ? (accent?.[o.value] ?? 'bg-surface text-ink shadow-[0_1px_3px_rgba(15,23,42,0.12)]') : 'text-sub',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const toneFill: Record<LimitTone, string> = { ok: 'bg-income', warning: 'bg-warning', over: 'bg-expense' };
export const toneText: Record<LimitTone, string> = { ok: 'text-income', warning: 'text-warning', over: 'text-expense' };

/** Progress bar with optional thin ink pace marker for "today" (DESIGN.md › Monthly limit card). */
export function Progress({ percent, tone = 'ok', fill, pace, height = 8, paceLabel }: { percent: number; tone?: LimitTone; fill?: string; pace?: number; height?: number; paceLabel?: boolean }) {
  return (
    <div className="relative" style={{ paddingTop: paceLabel ? 18 : 0 }}>
      <div className="relative w-full overflow-hidden rounded-full bg-muted" style={{ height }}>
        <div className={cn('h-full rounded-full', fill ?? toneFill[tone])} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
      {pace !== undefined && pace > 0 && pace < 100 && (
        <>
          <div className="absolute w-0.5 rounded-full bg-ink" style={{ left: `${pace}%`, bottom: -3, height: height + 6 }} aria-hidden />
          {paceLabel && (
            <span className="absolute -translate-x-1/2 rounded bg-muted px-1 text-[10px] font-semibold text-ink" style={{ left: `${pace}%`, top: 0 }}>
              Hari ini
            </span>
          )}
        </>
      )}
    </div>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className={cn('block w-full rounded-2xl border border-outline bg-surface text-left dark:border-transparent', className)}>
      {children}
    </Comp>
  );
}

/** Grouped list like iOS Settings: rounded card with hairline dividers. */
export function Group({ children, className, header, footer }: { children: ReactNode; className?: string; header?: ReactNode; footer?: ReactNode }) {
  return (
    <section className={className}>
      {header && <div className="t-caps mb-2 flex items-center justify-between px-1 text-sub">{header}</div>}
      <div className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface dark:border-transparent">{children}</div>
      {footer && <p className="t-body-sm mt-2 px-1 text-sub">{footer}</p>}
    </section>
  );
}

export function Row({ left, title, subtitle, right, onClick, chevron, className }: { left?: ReactNode; title: ReactNode; subtitle?: ReactNode; right?: ReactNode; onClick?: () => void; chevron?: boolean; className?: string }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className={cn('flex w-full items-center gap-3 px-4 py-3 text-left', onClick && 'active:bg-muted', className)}>
      {left}
      <div className="min-w-0 flex-1">
        <div className="t-body truncate font-medium text-ink">{title}</div>
        {subtitle && <div className="t-body-sm truncate text-sub">{subtitle}</div>}
      </div>
      {right !== undefined && <div className="shrink-0 text-right">{right}</div>}
      {chevron && <ChevronRight size={18} className="shrink-0 text-disabled" />}
    </Comp>
  );
}

export function Button({ variant = 'primary', className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' }) {
  const cls = {
    primary: 'bg-primary text-on-primary disabled:bg-muted disabled:text-disabled',
    secondary: 'bg-muted text-ink',
    destructive: 'bg-expense-c text-expense',
    ghost: 'text-ink',
  }[variant];
  return (
    <button {...rest} className={cn('t-label-lg flex h-[52px] w-full items-center justify-center gap-2 rounded-xl px-4 active:opacity-80', cls, className)}>
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors', checked ? 'bg-income' : 'bg-muted')}
    >
      <span className={cn('absolute top-0.5 h-[27px] w-[27px] rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

/** Large-title header for tab screens, with optional back link and right-side actions. */
export function ScreenHeader({ title, overline, right, back, children }: { title: string; overline?: string; right?: ReactNode; back?: string | true; children?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="pt-safe px-4">
      {back && (
        <button onClick={() => (back === true ? navigate(-1) : navigate(back))} className="t-body -ml-1 mt-3 flex items-center text-idr">
          <ChevronLeft size={22} /> Kembali
        </button>
      )}
      <div className="flex items-end justify-between pt-3">
        <div>
          {overline && <p className="t-body-sm text-sub">{overline}</p>}
          <h1 className="t-headline-lg text-ink">{title}</h1>
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </header>
  );
}

/** Compact iOS nav bar used by detail screens: Batal / Title / Simpan. */
export function NavBar({ title, left, right }: { title: string; left?: ReactNode; right?: ReactNode }) {
  return (
    <header className="pt-safe sticky top-0 z-20 border-b border-outline bg-bg/90 backdrop-blur">
      <div className="grid h-12 grid-cols-[1fr_auto_1fr] items-center px-4">
        <div className="justify-self-start">{left}</div>
        <h1 className="t-title truncate text-ink">{title}</h1>
        <div className="justify-self-end">{right}</div>
      </div>
    </header>
  );
}

export function IconButton({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-full border border-outline bg-surface text-ink dark:border-transparent">
      {children}
    </button>
  );
}

export function MonthSwitcher({ month, onChange, caption }: { month: string; onChange: (m: string) => void; caption?: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-outline bg-surface px-2 py-1.5 dark:border-transparent">
      <button aria-label="Bulan sebelumnya" className="flex h-9 w-9 items-center justify-center text-sub" onClick={() => onChange(addMonths(month, -1))}>
        <ChevronLeft size={20} />
      </button>
      <div className="text-center">
        <p className="t-label-lg text-ink">{formatMonth(month)}</p>
        {caption && <p className="t-body-sm text-sub">{caption}</p>}
      </div>
      <button aria-label="Bulan berikutnya" className="flex h-9 w-9 items-center justify-center text-sub" onClick={() => onChange(addMonths(month, 1))}>
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export function EmptyState({ icon, text, action }: { icon: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="text-disabled">{icon}</div>
      <p className="t-body text-sub">{text}</p>
      {action}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="t-headline-md text-ink">{children}</h2>
      {right}
    </div>
  );
}

export function LinkButton({ children, onClick, className }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={cn('t-label text-sub', className)}>
      {children}
    </button>
  );
}
