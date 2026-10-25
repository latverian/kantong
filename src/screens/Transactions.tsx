import { ChevronDown, ReceiptText, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategoryTile } from '../components/icons';
import { Sheet } from '../components/Sheet';
import { TxGroupedList, txTitle } from '../components/TxList';
import { Card, CurrencyBadge, EmptyState, IconButton, MonthSwitcher, Money, ScreenHeader, cn } from '../components/ui';
import type { Currency, Transaction } from '../db/types';
import { CURRENCIES } from '../db/types';
import { monthOf } from '../lib/dates';
import { monthFlows } from '../lib/ledger';
import { toUnits } from '../lib/money';
import { useData } from '../state/data';

const TYPE_OPTIONS: { value: Transaction['type']; label: string }[] = [
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'interest', label: 'Bunga' },
  { value: 'adjustment', label: 'Penyesuaian' },
];

export function Transactions() {
  const d = useData();
  const [params] = useSearchParams();
  const [month, setMonth] = useState(params.get('bulan') ?? monthOf(d.today));
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(params.get('kategori'));
  const [type, setType] = useState<Transaction['type'] | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [sheet, setSheet] = useState<'account' | 'category' | 'type' | null>(null);

  const flows = monthFlows(d.txs, d.accountsById, month);
  const shownCurrencies = CURRENCIES.filter((c) => d.accounts.some((a) => a.currency === c));

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return d.txs.filter((t) => {
      if (monthOf(t.date) !== month) return false;
      const from = d.accountsById.get(t.accountId);
      const to = d.accountsById.get(t.toAccountId ?? '');
      if (currency && from?.currency !== currency && to?.currency !== currency) return false;
      if (accountId && t.accountId !== accountId && t.toAccountId !== accountId) return false;
      if (categoryId && t.categoryId !== categoryId) return false;
      if (type && t.type !== type) return false;
      if (q) {
        const hay = [t.note, txTitle(t, d.categoriesById), from?.name, to?.name, String(toUnits(t.amount))].join(' ').toLowerCase();
        if (!hay.includes(q.replace(/\./g, ''))) return false;
      }
      return true;
    });
  }, [d.txs, d.accountsById, d.categoriesById, month, currency, accountId, categoryId, type, query]);

  const chip = (active: boolean, label: string, onClick: () => void, caret = false) => (
    <button onClick={onClick} className={cn('t-label flex h-8 shrink-0 items-center gap-1 rounded-full px-3', active ? 'bg-primary text-on-primary' : 'bg-muted text-ink')}>
      {label}
      {caret && <ChevronDown size={14} />}
    </button>
  );

  return (
    <main className="pb-32">
      <ScreenHeader
        title="Transaksi"
        right={
          <IconButton label="Cari" onClick={() => setSearching((s) => !s)}>
            {searching ? <X size={20} /> : <Search size={20} strokeWidth={1.75} />}
          </IconButton>
        }
      />
      <div className="space-y-4 px-4 pt-4">
        {searching && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari catatan, kategori, atau nominal"
            className="h-12 w-full rounded-xl bg-muted px-4 text-ink outline-none placeholder:text-disabled"
          />
        )}
        <MonthSwitcher month={month} onChange={setMonth} />

        <div className={cn('grid gap-3', shownCurrencies.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
          {shownCurrencies.map((c) => (
            <Card key={c} className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="t-body-sm text-sub">Arus kas</span>
                <CurrencyBadge currency={c} />
              </div>
              <div className="t-body-sm flex justify-between gap-2">
                <span className="text-sub">Masuk</span>
                <Money value={flows.in[c]} currency={c} sign="+" className="t-amount-sm text-income" />
              </div>
              <div className="t-body-sm mt-1 flex justify-between gap-2">
                <span className="text-sub">Keluar</span>
                <Money value={flows.out[c]} currency={c} sign={flows.out[c] ? '-' : 'auto'} className="t-amount-sm text-expense" />
              </div>
            </Card>
          ))}
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {chip(!currency && !accountId && !categoryId && !type, 'Semua', () => {
            setCurrency(null);
            setAccountId(null);
            setCategoryId(null);
            setType(null);
          })}
          {shownCurrencies.length > 1 && CURRENCIES.map((c) => chip(currency === c, c, () => setCurrency(currency === c ? null : c)))}
          {chip(!!accountId, accountId ? d.accountsById.get(accountId)?.name ?? 'Rekening' : 'Rekening', () => setSheet('account'), true)}
          {chip(!!categoryId, categoryId ? d.categoriesById.get(categoryId)?.name ?? 'Kategori' : 'Kategori', () => setSheet('category'), true)}
          {chip(!!type, type ? TYPE_OPTIONS.find((o) => o.value === type)!.label : 'Jenis', () => setSheet('type'), true)}
        </div>

        {list.length ? (
          <TxGroupedList txs={list} />
        ) : (
          <EmptyState icon={<ReceiptText size={40} />} text={query || currency || accountId || categoryId || type ? 'Tidak ada transaksi yang cocok.' : 'Belum ada transaksi di bulan ini.'} />
        )}
      </div>

      <Sheet open={sheet === 'account'} onClose={() => setSheet(null)} title="Filter rekening">
        <Choices
          options={[{ value: null, label: 'Semua rekening' }, ...d.accounts.map((a) => ({ value: a.id, label: `${a.name}${a.archived ? ' (arsip)' : ''}` }))]}
          value={accountId}
          onPick={(v) => {
            setAccountId(v);
            setSheet(null);
          }}
        />
      </Sheet>
      <Sheet open={sheet === 'category'} onClose={() => setSheet(null)} title="Filter kategori">
        <Choices
          options={[{ value: null, label: 'Semua kategori' }, ...d.categories.filter((c) => !c.archived).map((c) => ({ value: c.id, label: `${c.name} · ${c.kind === 'income' ? 'masuk' : 'keluar'}`, icon: <CategoryTile category={c} size={32} /> }))]}
          value={categoryId}
          onPick={(v) => {
            setCategoryId(v);
            setSheet(null);
          }}
        />
      </Sheet>
      <Sheet open={sheet === 'type'} onClose={() => setSheet(null)} title="Filter jenis">
        <Choices
          options={[{ value: null, label: 'Semua jenis' }, ...TYPE_OPTIONS]}
          value={type}
          onPick={(v) => {
            setType(v as Transaction['type'] | null);
            setSheet(null);
          }}
        />
      </Sheet>
    </main>
  );
}

function Choices<T extends string | null>({ options, value, onPick }: { options: { value: T; label: string; icon?: React.ReactNode }[]; value: T; onPick: (v: T) => void }) {
  return (
    <div className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline dark:border-transparent">
      {options.map((o) => (
        <button key={o.value ?? 'all'} onClick={() => onPick(o.value)} className="flex w-full items-center gap-3 bg-surface px-4 py-3 text-left">
          {o.icon}
          <span className={cn('t-body flex-1', o.value === value ? 'font-semibold text-ink' : 'text-ink')}>{o.label}</span>
          {o.value === value && <span className="t-label text-income">✓</span>}
        </button>
      ))}
    </div>
  );
}
