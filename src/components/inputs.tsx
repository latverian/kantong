import type { Currency } from '../db/types';
import { formatNumber, parseMoneyInput, PREFIX, toUnits } from '../lib/money';
import { cn } from './ui';

/** Money text field with live thousand separators; value in minor units. */
export function MoneyInput({ value, onChange, currency, className, autoFocus, large }: { value: number; onChange: (v: number) => void; currency: Currency; className?: string; autoFocus?: boolean; large?: boolean }) {
  return (
    <div className={cn('flex items-center gap-1 rounded-xl bg-muted px-3', large ? 'h-16 border-2 border-ink bg-surface' : 'h-12', className)}>
      <span className={cn('text-sub', large ? 't-amount-lg' : 't-body')}>{PREFIX[currency]}</span>
      <input
        inputMode="numeric"
        autoFocus={autoFocus}
        value={value ? formatNumber(Math.abs(toUnits(value))) : ''}
        placeholder="0"
        onChange={(e) => onChange(parseMoneyInput(e.target.value))}
        className={cn('min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-disabled', large ? 't-amount-lg' : 't-amount-md')}
      />
    </div>
  );
}

/** Decimal field that accepts "3,5" or "3.5". */
export function DecimalInput({ value, onChange, suffix, className }: { value: string; onChange: (v: string) => void; suffix?: string; className?: string }) {
  return (
    <div className={cn('flex h-10 items-center gap-1 rounded-lg bg-muted px-3', className)}>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))} className="t-amount-md w-16 min-w-0 bg-transparent text-right text-ink outline-none" />
      {suffix && <span className="t-body-sm text-sub">{suffix}</span>}
    </div>
  );
}

export const parseDecimal = (s: string) => {
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

export const TextInput = ({ value, onChange, placeholder, className, autoFocus }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; autoFocus?: boolean }) => (
  <input
    value={value}
    autoFocus={autoFocus}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={cn('h-12 w-full rounded-xl bg-muted px-4 text-ink outline-none placeholder:text-disabled', className)}
  />
);
