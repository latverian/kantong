import { ArrowDown, ArrowUp, Plus, Scale, Sparkles, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BudgetSheet } from '../components/BudgetSheet';
import { Donut } from '../components/Donut';
import { CategoryTile } from '../components/icons';
import { limitCaption } from '../components/LimitRow';
import { Button, Card, CurrencyBadge, Money, MonthSwitcher, Progress, ScreenHeader, Segmented, cn, toneText } from '../components/ui';
import type { Currency } from '../db/types';
import { CURRENCIES } from '../db/types';
import { monthOf } from '../lib/dates';
import { convert, monthFlows, spendingByCategory } from '../lib/ledger';
import { budgetFor, limitStatus, spentFor } from '../lib/limits';
import { formatMoney } from '../lib/money';
import { useData } from '../state/data';

type View = Currency | 'ALL';

export function Reports() {
  const d = useData();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'budget' ? 'budget' : 'summary';
  const [month, setMonth] = useState(monthOf(d.today));
  return (
    <main className="pb-32">
      <ScreenHeader title="Laporan">
        <Segmented
          value={tab}
          onChange={(t) => setParams(t === 'budget' ? { tab: 'budget' } : {}, { replace: true })}
          options={[
            { value: 'summary', label: 'Ringkasan' },
            { value: 'budget', label: 'Budget' },
          ]}
        />
      </ScreenHeader>
      <div className="space-y-5 px-4 pt-4">{tab === 'budget' ? <BudgetTab month={month} setMonth={setMonth} /> : <SummaryTab month={month} setMonth={setMonth} />}</div>
    </main>
  );
}

/** Largest-remainder rounding so legend percentages add up to 100 (PRD §6.3). */
function roundedPercents(values: number[]): number[] {
  const total = values.reduce((s, v) => s + v, 0);
  if (!total) return values.map(() => 0);
  const raw = values.map((v) => (v / total) * 100);
  const floors = raw.map(Math.floor);
  let left = 100 - floors.reduce((s, v) => s + v, 0);
  const order = raw.map((v, i) => [v - floors[i], i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) if (left-- > 0) floors[i]++;
  return floors;
}

function SummaryTab({ month, setMonth }: { month: string; setMonth: (m: string) => void }) {
  const d = useData();
  const navigate = useNavigate();
  const available = CURRENCIES.filter((c) => d.accounts.some((a) => a.currency === c));
  const [view, setView] = useState<View>(available.includes(d.settings.primaryCurrency) ? d.settings.primaryCurrency : available[0] ?? 'IDR');
  const primary = d.settings.primaryCurrency;
  const target: Currency = view === 'ALL' ? primary : view;
  const rate = d.fx?.rate ?? 0;
  const pick = (byCur: Record<Currency, number>) => (view === 'ALL' ? CURRENCIES.reduce((s, c) => s + convert(byCur[c], c, primary, rate), 0) : byCur[view]);

  const flows = monthFlows(d.txs, d.accountsById, month);
  const masuk = pick(flows.in);
  const keluar = pick(flows.out);
  const bunga = pick(flows.interest);

  const merged = new Map<string, number>();
  for (const c of view === 'ALL' ? CURRENCIES : [view]) {
    for (const [cat, v] of spendingByCategory(d.txs, d.accountsById, month, c)) merged.set(cat, (merged.get(cat) ?? 0) + convert(v, c, target, rate));
  }
  const sorted = [...merged].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, sorted.length > 5 ? 4 : 5);
  const rest = sorted.slice(top.length);
  const slices = [
    ...top.map(([id, v]) => ({ id, value: v, name: d.categoriesById.get(id)?.name ?? 'Tanpa kategori', color: d.categoriesById.get(id)?.color ?? '#94A3B8' })),
    ...(rest.length ? [{ id: 'rest', value: rest.reduce((s, [, v]) => s + v, 0), name: `Lainnya (${rest.length} kategori)`, color: '#94A3B8' }] : []),
  ];
  const percents = roundedPercents(slices.map((s) => s.value));

  return (
    <>
      <MonthSwitcher month={month} onChange={setMonth} />
      {available.length > 1 && (
        <Segmented<View>
          value={view}
          onChange={setView}
          options={[
            { value: 'IDR', label: 'IDR' },
            { value: 'NTD', label: 'NTD' },
            ...(rate ? [{ value: 'ALL' as View, label: 'Gabungan' }] : []),
          ]}
          accent={{ IDR: 'bg-idr text-white', NTD: 'bg-ntd text-white', ALL: 'bg-primary text-on-primary' }}
        />
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Masuk', icon: ArrowDown, value: masuk, sign: '+' as const, cls: 'text-income' },
          { label: 'Keluar', icon: ArrowUp, value: keluar, sign: '-' as const, cls: 'text-expense' },
          { label: 'Bersih', icon: Scale, value: masuk - keluar, sign: masuk - keluar > 0 ? ('+' as const) : ('auto' as const), cls: 'text-ink' },
        ].map((s) => (
          <Card key={s.label} className="p-3">
            <p className="t-caps flex items-center gap-1 text-sub">
              <s.icon size={12} /> {s.label}
            </p>
            <p className={cn('t-amount-sm mt-1 break-words', s.cls)}>{formatMoney(s.value, target, { sign: s.value ? s.sign : 'auto', approx: view === 'ALL' })}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h2 className="t-title text-ink">Pengeluaran per kategori</h2>
        <p className="t-body-sm text-sub">{view === 'ALL' ? `Dikonversi ke ${primary} · 1 NT$ = Rp${rate}` : `Pengeluaran ${view}`}</p>
        {slices.length ? (
          <div className="mt-4 flex flex-col items-center gap-4">
            <Donut slices={slices}>
              <span className="t-caps text-sub">Total</span>
              <span className="t-amount-md text-ink">{formatMoney(keluar, target, { approx: view === 'ALL' })}</span>
            </Donut>
            <ul className="w-full space-y-2">
              {slices.map((s, i) => (
                <li key={s.id}>
                  <button
                    disabled={s.id === 'rest' || s.id === 'none'}
                    onClick={() => navigate(`/transaksi?kategori=${s.id}&bulan=${month}`)}
                    className="flex w-full items-center gap-2 text-left"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="t-body min-w-0 flex-1 truncate text-ink">{s.name}</span>
                    <span className="t-amount-sm text-ink">{formatMoney(s.value, target)}</span>
                    <span className="t-body-sm w-10 text-right text-sub">{percents[i]}%</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="t-body-sm py-6 text-center text-sub">Belum ada pengeluaran di bulan ini.</p>
        )}
      </Card>

      {bunga > 0 && (
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-interest-c text-interest">
            <Sparkles size={20} />
          </span>
          <div className="flex-1">
            <p className="t-title text-ink">Bunga diterima</p>
            <p className="t-body-sm text-sub">Sudah termasuk dalam "Masuk"</p>
          </div>
          <span className="t-amount-md text-interest">{formatMoney(bunga, target, { sign: '+', approx: view === 'ALL' })}</span>
        </Card>
      )}
    </>
  );
}

function BudgetTab({ month, setMonth }: { month: string; setMonth: (m: string) => void }) {
  const d = useData();
  const [sheet, setSheet] = useState<{ scope: 'total' | 'category'; currency: Currency; categoryId?: string } | null>(null);
  const available = CURRENCIES.filter((c) => d.accounts.some((a) => a.currency === c));
  const first = limitStatus(1, 0, month, d.today);

  const categoryBudgets = (c: Currency) =>
    d.budgets
      .filter((b) => b.scope === 'category' && b.currency === c && b.categoryId && budgetFor(d.budgets, month, c, b.categoryId) === b)
      .map((b) => ({ b, cat: d.categoriesById.get(b.categoryId!), s: limitStatus(b.amount, spentFor(d.txs, d.accountsById, month, c, b.categoryId), month, d.today) }))
      .sort((x, y) => y.s.percent - x.s.percent);

  return (
    <>
      <MonthSwitcher month={month} onChange={setMonth} caption={first.daysLeft > 0 ? `${first.daysLeft} hari tersisa` : undefined} />

      <section className="space-y-3">
        <p className="t-caps px-1 text-sub">Batas bulanan</p>
        {available.map((c) => {
          const b = budgetFor(d.budgets, month, c);
          if (!b) {
            return (
              <button key={c} onClick={() => setSheet({ scope: 'total', currency: c })} className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-outline bg-surface p-4 text-left">
                <CurrencyBadge currency={c} />
                <span className="t-body flex-1 text-ink">Atur batas pengeluaran {c}</span>
                <Plus size={18} className="text-sub" />
              </button>
            );
          }
          const s = limitStatus(b.amount, spentFor(d.txs, d.accountsById, month, c), month, d.today);
          const catSum = categoryBudgets(c).reduce((sum, x) => sum + x.b.amount, 0);
          return (
            <Card key={c} className="p-4">
              <div className="flex items-center gap-2">
                <CurrencyBadge currency={c} />
                <span className="t-title flex-1 text-ink">Batas pengeluaran {c}</span>
                <button onClick={() => setSheet({ scope: 'total', currency: c })} className="t-label text-sub">
                  Ubah
                </button>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <Money value={s.spent} currency={c} className="t-amount-lg text-ink" />
                <span className="t-body text-sub">/ {formatMoney(s.limit, c)}</span>
                <span className={cn('t-amount-lg ml-auto', toneText[s.tone])}>{s.percent}%</span>
              </div>
              <div className="mt-1">
                <Progress percent={s.percent} tone={s.tone} pace={s.pace} height={10} paceLabel />
              </div>
              <p className={cn('t-body-sm mt-2', toneText[s.remaining < 0 ? 'over' : s.aheadOfPace ? 'warning' : 'ok'])}>{limitCaption(s, c, true)}</p>
              {b.month && <p className="t-body-sm mt-1 text-sub">Khusus bulan ini</p>}
              {catSum > b.amount && (
                <p className="t-body-sm mt-2 flex items-center gap-1.5 text-warning">
                  <TriangleAlert size={14} /> Total budget kategori ({formatMoney(catSum, c)}) melebihi batas bulanan
                </p>
              )}
            </Card>
          );
        })}
      </section>

      {available.map((c) => {
        const rows = categoryBudgets(c);
        if (!rows.length) return null;
        return (
          <section key={c}>
            <p className="t-caps mb-2 px-1 text-sub">Budget kategori · {c}</p>
            <div className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface dark:border-transparent">
              {rows.map(({ b, cat, s }) => (
                <button key={b.id} onClick={() => setSheet({ scope: 'category', currency: c, categoryId: b.categoryId })} className="flex w-full items-start gap-3 px-4 py-3 text-left active:bg-muted">
                  <CategoryTile category={cat} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="t-title truncate text-ink">{cat?.name ?? 'Kategori'}</span>
                      <span className={cn('t-amount-sm', toneText[s.tone])}>{s.percent}%</span>
                    </div>
                    <div className="mt-1.5">
                      <Progress percent={s.percent} tone={s.tone} />
                    </div>
                    <div className="t-body-sm mt-1.5 flex flex-wrap justify-between gap-x-3">
                      <span className={s.remaining < 0 ? 'text-expense' : s.tone === 'warning' ? 'text-warning' : 'text-sub'}>{limitCaption(s, c)}</span>
                      <span className="tabular-nums text-sub">
                        {formatMoney(s.spent, c)} / {formatMoney(s.limit, c)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      <Button variant="secondary" onClick={() => setSheet({ scope: 'category', currency: available[0] ?? 'IDR' })}>
        <Plus size={18} /> Tambah Budget Kategori
      </Button>

      {sheet && <BudgetSheet open onClose={() => setSheet(null)} month={month} {...sheet} />}
    </>
  );
}
