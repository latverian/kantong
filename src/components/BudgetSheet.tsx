import { Bell, Info, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Currency } from '../db/types';
import { CURRENCIES } from '../db/types';
import { addMonths, formatMonth } from '../lib/dates';
import { budgetFor, spentFor } from '../lib/limits';
import { formatMoney, MINOR } from '../lib/money';
import { deleteBudget, saveBudget } from '../lib/ops';
import { useData } from '../state/data';
import { useToast } from '../state/toast';
import { CategoryGrid } from './pickers';
import { MoneyInput } from './inputs';
import { Sheet } from './Sheet';
import { Button, Segmented, Toggle, cn } from './ui';

const NICE: Record<Currency, number> = { NTD: 100 * MINOR, IDR: 50_000 * MINOR };
const nice = (v: number, c: Currency) => Math.max(NICE[c], Math.round(v / NICE[c]) * NICE[c]);

/** "Atur Batas Bulanan" (S20) and category budgets — one sheet for both scopes (PRD F8). */
export function BudgetSheet({ open, onClose, scope, currency: initialCurrency, categoryId: initialCategory, month }: {
  open: boolean;
  onClose: () => void;
  scope: 'total' | 'category';
  currency: Currency;
  categoryId?: string;
  month: string;
}) {
  const d = useData();
  const toast = useToast();
  const available = CURRENCIES.filter((c) => d.accounts.some((a) => a.currency === c));
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [categoryId, setCategoryId] = useState(initialCategory ?? '');
  const current = budgetFor(d.budgets, month, currency, scope === 'category' ? categoryId || '__none__' : undefined);
  const [amount, setAmount] = useState(current?.amount ?? 0);
  const [recurring, setRecurring] = useState(current ? !current.month : true);
  const [lastKey, setLastKey] = useState(`${currency}:${categoryId}`);

  // When the currency/category changes, load that budget's values.
  const key = `${currency}:${categoryId}`;
  if (key !== lastKey) {
    setLastKey(key);
    setAmount(current?.amount ?? 0);
    setRecurring(current ? !current.month : true);
  }

  const average = useMemo(() => {
    const months = [1, 2, 3].map((n) => addMonths(month, -n));
    const total = months.reduce((s, m) => s + spentFor(d.txs, d.accountsById, m, currency, scope === 'category' ? categoryId : undefined), 0);
    return Math.round(total / 3 / MINOR) * MINOR;
  }, [d.txs, d.accountsById, month, currency, categoryId, scope]);
  const suggestions = average > 0 ? [nice(average * 0.85, currency), nice(average * 1.2, currency)] : [];

  const expenseCats = d.categories.filter((c) => c.kind === 'expense' && !c.archived && !c.isSystem);

  async function save() {
    if (amount <= 0 || (scope === 'category' && !categoryId)) return;
    const same = d.budgets.filter((b) => b.scope === scope && b.currency === currency && (scope === 'total' || b.categoryId === categoryId));
    const recurringRow = same.find((b) => !b.month);
    const monthRow = same.find((b) => b.month === month);
    if (recurring) {
      await saveBudget({ id: recurringRow?.id, scope, currency, categoryId: scope === 'category' ? categoryId : undefined, amount, recurring: true, lastAlert80: recurringRow?.lastAlert80, lastAlert100: recurringRow?.lastAlert100 });
      if (monthRow) await deleteBudget(monthRow.id);
    } else {
      await saveBudget({ id: monthRow?.id, scope, currency, categoryId: scope === 'category' ? categoryId : undefined, amount, recurring: false, month, lastAlert80: monthRow?.lastAlert80, lastAlert100: monthRow?.lastAlert100 });
    }
    toast({ title: scope === 'total' ? `Batas ${currency} disimpan` : 'Budget kategori disimpan', tone: 'success' });
    onClose();
  }

  async function remove() {
    if (!current) return;
    await deleteBudget(current.id);
    toast({ title: scope === 'total' ? `Batas ${currency} dihapus` : 'Budget kategori dihapus', tone: 'info' });
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={scope === 'total' ? 'Atur Batas Bulanan' : 'Budget Kategori'}
      subtitle={scope === 'total' ? 'Total semua pengeluaran dalam satu bulan' : 'Batas pengeluaran untuk satu kategori'}
      footer={
        <>
          <Button disabled={amount <= 0 || (scope === 'category' && !categoryId)} onClick={save}>
            Simpan
          </Button>
          {current && (
            <button onClick={remove} className="t-label mt-2 h-10 w-full text-expense">
              Hapus {scope === 'total' ? 'batas' : 'budget'}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {available.length > 1 && (
          <Segmented<Currency> value={currency} onChange={setCurrency} options={available.map((c) => ({ value: c, label: c }))} accent={{ IDR: 'bg-idr text-white', NTD: 'bg-ntd text-white' }} />
        )}
        {scope === 'category' && (
          <div>
            <p className="t-caps mb-2 text-sub">Kategori</p>
            <CategoryGrid categories={expenseCats} value={categoryId} onPick={setCategoryId} />
          </div>
        )}
        <div>
          <p className="t-caps mb-2 text-sub">Nominal batas</p>
          <MoneyInput large value={amount} onChange={setAmount} currency={currency} />
          {average > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => setAmount(average)} className="t-label flex h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-ink">
                <TrendingUp size={14} className="text-ntd" /> Rata-rata 3 bln: {formatMoney(average, currency)}
              </button>
              {suggestions.map((s) => (
                <button key={s} onClick={() => setAmount(s)} className={cn('t-label h-9 rounded-full bg-muted px-3 text-ink', amount === s && 'bg-primary text-on-primary')}>
                  {formatMoney(s, currency)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="divide-y divide-outline rounded-2xl bg-muted">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <p className="t-body font-semibold text-ink">Berlaku tiap bulan</p>
              <p className="t-body-sm text-sub">{recurring ? 'Otomatis berlaku lagi setiap tanggal 1' : `Hanya untuk ${formatMonth(month)}`}</p>
            </div>
            <Toggle checked={recurring} onChange={setRecurring} label="Berlaku tiap bulan" />
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-c text-warning">
              <Bell size={18} />
            </span>
            <div>
              <p className="t-body font-semibold text-ink">Peringatan di 80% dan 100%</p>
              <p className="t-body-sm text-sub">Muncul setelah kamu menyimpan transaksi</p>
            </div>
          </div>
        </div>
        <p className="t-body-sm flex gap-2 text-sub">
          <Info size={16} className="mt-0.5 shrink-0" />
          Transfer, bunga, dan penyesuaian saldo tidak dihitung.
        </p>
      </div>
    </Sheet>
  );
}
