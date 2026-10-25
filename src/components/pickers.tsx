import { Check } from 'lucide-react';
import type { Account, Category } from '../db/types';
import { formatMoney } from '../lib/money';
import { AccountTile, CategoryTile } from './icons';
import { Sheet } from './Sheet';
import { CurrencyBadge, cn } from './ui';

export const ACCOUNT_TYPE_LABEL: Record<Account['type'], string> = { bank: 'Bank', cash: 'Tunai', ewallet: 'E-wallet' };

export function AccountPickerSheet({ open, onClose, title, accounts, balances, value, onPick, disabledId }: {
  open: boolean;
  onClose: () => void;
  title: string;
  accounts: Account[];
  balances: Map<string, number>;
  value?: string;
  onPick: (id: string) => void;
  disabledId?: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline dark:border-transparent">
        {accounts.map((a) => (
          <button
            key={a.id}
            disabled={a.id === disabledId}
            onClick={() => {
              onPick(a.id);
              onClose();
            }}
            className="flex w-full items-center gap-3 bg-surface px-4 py-3 text-left disabled:opacity-40"
          >
            <AccountTile account={a} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="t-body font-semibold text-ink">{a.name}</span>
                <CurrencyBadge currency={a.currency} />
              </div>
              <span className="t-body-sm text-sub">
                {ACCOUNT_TYPE_LABEL[a.type]} · Saldo {formatMoney(balances.get(a.id) ?? 0, a.currency)}
              </span>
            </div>
            {value === a.id && <Check size={20} className="text-income" />}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/** Two-row horizontally scrollable category grid (DESIGN.md › Add Transaction screen). */
export function CategoryGrid({ categories, value, onPick }: { categories: Category[]; value?: string; onPick: (id: string) => void }) {
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
      {/* row-major order across two rows: first row reads left to right */}
      <div className="grid gap-x-2 gap-y-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.ceil(categories.length / 2))}, 76px)` }}>
        {categories.map((c) => {
          const active = c.id === value;
          return (
            <button key={c.id} onClick={() => onPick(c.id)} className="flex flex-col items-center gap-1.5" aria-pressed={active}>
              <span className={cn('rounded-[14px] p-0.5', active ? 'ring-2 ring-ink' : 'ring-2 ring-transparent')}>
                <CategoryTile category={c} size={48} />
              </span>
              <span className={cn('line-clamp-2 text-center text-[11px] leading-tight', active ? 'font-semibold text-ink' : 'text-sub')}>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
