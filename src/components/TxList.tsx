import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Account, Category, Currency, Transaction } from '../db/types';
import { dayOf, formatDayHeader, formatDayMonth, timeOf } from '../lib/dates';
import { currencyOf, isIn, isOut } from '../lib/ledger';
import { formatMoney } from '../lib/money';
import { useData } from '../state/data';
import { CategoryTile, IconTile } from './icons';
import { cn } from './ui';

export function txTitle(t: Transaction, categoriesById: Map<string, Category>): string {
  if (t.type === 'transfer') return 'Transfer';
  if (t.type === 'adjustment') return 'Penyesuaian saldo';
  if (t.type === 'interest') return 'Bunga Tabungan';
  return categoriesById.get(t.categoryId ?? '')?.name ?? 'Tanpa kategori';
}

export function txToneClass(t: Transaction): string {
  if (t.type === 'expense') return 'text-expense';
  if (t.type === 'income') return 'text-income';
  if (t.type === 'interest') return 'text-interest';
  return 'text-transfer';
}

export function txAmountText(t: Transaction, accountsById: Map<string, Account>): string {
  const from = accountsById.get(t.accountId)?.currency ?? 'IDR';
  if (t.type === 'transfer') {
    const to = accountsById.get(t.toAccountId ?? '')?.currency ?? from;
    return from === to ? formatMoney(t.amount, from, { sign: 'none' }) : `${formatMoney(t.amount, from)} → ${formatMoney(t.toAmount ?? 0, to)}`;
  }
  if (t.type === 'expense') return formatMoney(t.amount, from, { sign: '-' });
  if (t.type === 'adjustment') return formatMoney(t.amount, from, { sign: t.amount >= 0 ? '+' : '-' });
  return formatMoney(t.amount, from, { sign: '+' });
}

function TxIcon({ t, category }: { t: Transaction; category?: Category }) {
  if (t.type === 'transfer') return <IconTile icon="arrow-left-right" color="#64748B" />;
  if (t.type === 'adjustment') return <IconTile icon="sliders" color="#64748B" />;
  if (t.type === 'interest') return <IconTile icon="percent" color="#047857" />;
  return <CategoryTile category={category} />;
}

/** One transaction row (DESIGN.md › Transaction row). */
export function TxRow({ t, showDate, accountContext }: { t: Transaction; showDate?: boolean; accountContext?: string }) {
  const { accountsById, categoriesById, today } = useData();
  const navigate = useNavigate();
  const from = accountsById.get(t.accountId);
  const to = accountsById.get(t.toAccountId ?? '');
  const parts: string[] = [];
  if (t.note && t.type !== 'interest') parts.push(t.note);
  if (t.type === 'transfer') {
    parts.push(`${from?.name ?? '?'} → ${to?.name ?? '?'}`);
    if (t.fxRate) parts.push(`kurs ${formatRate(t.fxRate)}`);
  } else if (t.accountId !== accountContext) parts.push(from?.name ?? '');
  if (t.type === 'interest' && t.isAuto && !t.isManuallyEdited) parts.push('Otomatis');
  else parts.push(showDate && dayOf(t.date) !== today ? formatDayMonth(dayOf(t.date)) : timeOf(t.date));
  return (
    <button onClick={() => navigate(`/transaksi/${t.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted">
      <TxIcon t={t} category={categoriesById.get(t.categoryId ?? '')} />
      <div className="min-w-0 flex-1">
        <div className="t-body truncate font-semibold text-ink">{txTitle(t, categoriesById)}</div>
        <div className="t-body-sm truncate text-sub">{parts.filter(Boolean).join(' · ')}</div>
      </div>
      <span className={cn('t-amount-md shrink-0 text-right', txToneClass(t))}>{txAmountText(t, accountsById)}</span>
    </button>
  );
}

export const formatRate = (r: number) => (Number.isInteger(r) ? String(r) : r.toFixed(2).replace('.', ','));

/** Several auto-interest rows of one day folded into one expandable row (PRD F11). */
function InterestGroup({ items }: { items: Transaction[] }) {
  const [open, setOpen] = useState(false);
  const { accountsById } = useData();
  const byCur = new Map<Currency, number>();
  for (const t of items) {
    const c = accountsById.get(t.accountId)?.currency ?? 'IDR';
    byCur.set(c, (byCur.get(c) ?? 0) + t.amount);
  }
  return (
    <div>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted">
        <IconTile icon="percent" color="#047857" />
        <div className="min-w-0 flex-1">
          <div className="t-body truncate font-semibold text-ink">Bunga Tabungan</div>
          <div className="t-body-sm text-sub">{items.length} rekening · Otomatis</div>
        </div>
        <span className="t-amount-md text-right text-interest">
          {[...byCur].map(([c, v]) => formatMoney(v, c, { sign: '+' })).join(' · ')}
        </span>
        <ChevronDown size={18} className={cn('text-disabled transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="border-t border-outline bg-bg/50">
          {items.map((t) => (
            <TxRow key={t.id} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

type Item = { kind: 'tx'; t: Transaction } | { kind: 'interest'; items: Transaction[] };

function foldInterest(txs: Transaction[]): Item[] {
  const out: Item[] = [];
  const interest = txs.filter((t) => t.type === 'interest' && t.isAuto && !t.isManuallyEdited);
  let placed = false;
  for (const t of txs) {
    if (interest.length > 1 && interest.includes(t)) {
      if (!placed) out.push({ kind: 'interest', items: interest });
      placed = true;
    } else out.push({ kind: 'tx', t });
  }
  return out;
}

/** Net subtotal per currency for one day: Masuk − Keluar (PRD §6.2). Transfers/adjustments excluded. */
function dayNet(txs: Transaction[], accountsById: Map<string, Account>) {
  const net = new Map<Currency, number>();
  for (const t of txs) {
    const c = currencyOf(t, accountsById);
    if (!c || (!isIn(t) && !isOut(t))) continue;
    net.set(c, (net.get(c) ?? 0) + (isIn(t) ? t.amount : -t.amount));
  }
  return [...net].filter(([, v]) => v !== 0);
}

/** Flat list of the latest items (Beranda › Transaksi terakhir), interest folded per day. */
export function RecentList({ txs, limit = 5 }: { txs: Transaction[]; limit?: number }) {
  const items: Item[] = [];
  const days = new Map<string, Transaction[]>();
  for (const t of txs.slice(0, limit * 4)) days.set(dayOf(t.date), [...(days.get(dayOf(t.date)) ?? []), t]);
  for (const list of days.values()) items.push(...foldInterest(list));
  return (
    <div className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface dark:border-transparent">
      {items.slice(0, limit).map((it) =>
        it.kind === 'tx' ? <TxRow key={it.t.id} t={it.t} showDate /> : <InterestGroup key={`i-${it.items[0].id}`} items={it.items} />,
      )}
    </div>
  );
}

/** Transactions grouped by day with date headers and net subtotals. */
export function TxGroupedList({ txs, accountContext }: { txs: Transaction[]; accountContext?: string }) {
  const { accountsById, today } = useData();
  const days = new Map<string, Transaction[]>();
  for (const t of txs) {
    const d = dayOf(t.date);
    days.set(d, [...(days.get(d) ?? []), t]);
  }
  return (
    <div className="space-y-5">
      {[...days].map(([day, list]) => {
        const net = dayNet(list, accountsById);
        return (
          <section key={day}>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h3 className="t-body text-sub">{formatDayHeader(day, today)}</h3>
              {net.length > 0 && (
                <span className="t-amount-sm text-sub">{net.map(([c, v]) => formatMoney(v, c, { sign: v > 0 ? '+' : 'auto' })).join(' · ')}</span>
              )}
            </div>
            <div className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface dark:border-transparent">
              {foldInterest(list).map((it) =>
                it.kind === 'tx' ? <TxRow key={it.t.id} t={it.t} accountContext={accountContext} /> : <InterestGroup key={`i-${day}`} items={it.items} />,
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

