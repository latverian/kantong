import { ChevronRight, Plus, Settings, Sparkles, TrendingUp, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LimitRow } from '../components/LimitRow';
import { RecentList } from '../components/TxList';
import { Button, Card, CurrencyBadge, EmptyState, IconButton, LinkButton, SectionTitle, cn } from '../components/ui';
import type { Currency } from '../db/types';
import { CURRENCIES } from '../db/types';
import { addDays, addMonths, dayOf, formatShortDate, lastDayOfMonth, monthOf } from '../lib/dates';
import { balancesAt, combined, totalsByCurrency } from '../lib/ledger';
import { budgetFor, limitStatus, spentFor } from '../lib/limits';
import { formatDecimal, formatMoney } from '../lib/money';
import { useData } from '../state/data';

export function Home() {
  const d = useData();
  const navigate = useNavigate();
  const month = monthOf(d.today);
  const yesterday = addDays(d.today, -1);

  const totals = totalsByCurrency(d.accounts, d.balances);
  const prev = totalsByCurrency(d.accounts, balancesAt(d.accounts, d.txs, lastDayOfMonth(addMonths(month, -1))));
  const shown = CURRENCIES.filter((c) => d.activeAccounts.some((a) => a.currency === c));

  const interestAccounts = d.activeAccounts.filter((a) => a.interest?.enabled);
  const interestYesterday = d.txs.filter((t) => t.type === 'interest' && dayOf(t.date) === yesterday);
  const interestByCur = CURRENCIES.map((c) => [c, interestYesterday.filter((t) => d.accountsById.get(t.accountId)?.currency === c).reduce((s, t) => s + t.amount, 0)] as const).filter(([, v]) => v > 0);
  const interestSources = d.accounts.filter((a) => interestYesterday.some((t) => t.accountId === a.id)).map((a) => a.name);

  const limits = CURRENCIES.map((c) => {
    const b = budgetFor(d.budgets, month, c);
    return b ? { currency: c, s: limitStatus(b.amount, spentFor(d.txs, d.accountsById, month, c), month, d.today) } : null;
  }).filter((x) => x !== null);
  const hotCategories = d.budgets
    .filter((b) => b.scope === 'category' && b.categoryId && budgetFor(d.budgets, month, b.currency, b.categoryId) === b)
    .filter((b) => limitStatus(b.amount, spentFor(d.txs, d.accountsById, month, b.currency, b.categoryId), month, d.today).percent >= 80).length;

  if (!d.activeAccounts.length) {
    return (
      <main className="pb-32">
        <Header />
        <EmptyState icon={<Plus size={40} />} text="Belum ada rekening. Tambahkan rekening pertamamu untuk mulai mencatat." action={<Button className="w-auto px-6" onClick={() => navigate('/rekening/baru')}>Tambah rekening</Button>} />
      </main>
    );
  }

  return (
    <main className="space-y-6 pb-32">
      <Header />

      <section>
        <BalanceCarousel
          cards={shown.map((c) => ({ currency: c, total: totals[c], change: totals[c] - prev[c], count: d.activeAccounts.filter((a) => a.currency === c).length }))}
        />
        {shown.length > 1 && (
          <p className="t-body-sm mt-3 px-4 text-center text-sub">
            {d.fx ? (
              <>
                ≈ Total gabungan <span className="font-semibold text-ink">{formatMoney(combined(totals, d.settings.primaryCurrency, d.fx.rate), d.settings.primaryCurrency)}</span> · 1 NT$ = Rp{formatDecimal(d.fx.rate)}
              </>
            ) : (
              <LinkButton onClick={() => navigate('/pengaturan')}>Atur kurs NT$ → Rp untuk melihat total gabungan ›</LinkButton>
            )}
          </p>
        )}
      </section>

      <div className="space-y-6 px-4">
        {interestAccounts.length > 0 && (
          <button onClick={() => navigate('/rekening')} className="flex w-full items-center gap-3 rounded-2xl border border-interest/20 bg-interest-c px-4 py-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-interest text-white dark:text-black">
              <Sparkles size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="t-body text-interest">
                Bunga kemarin{' '}
                <span className="t-amount-md">{interestByCur.length ? interestByCur.map(([c, v]) => formatMoney(v, c, { sign: '+' })).join(' · ') : formatMoney(0, interestAccounts[0].currency)}</span>
              </p>
              <p className="t-body-sm text-interest/80">{interestSources.length ? `dari ${interestSources.join(' & ')}` : 'Belum ada bunga tercatat kemarin'}</p>
            </div>
            <ChevronRight size={18} className="text-interest" />
          </button>
        )}

        <Card className="px-4 pt-3">
          <div className="flex items-center justify-between">
            <h2 className="t-title text-ink">Batas bulan ini</h2>
            <LinkButton onClick={() => navigate('/laporan?tab=budget')}>Atur</LinkButton>
          </div>
          {limits.length ? (
            <div className="divide-y divide-outline">
              {limits.map((l) => (
                <LimitRow key={l.currency} currency={l.currency} s={l.s} />
              ))}
            </div>
          ) : (
            <p className="t-body-sm py-3 text-sub">Belum ada batas pengeluaran. Atur batas bulanan supaya tahu kapan harus mengerem.</p>
          )}
          {hotCategories > 0 && (
            <button onClick={() => navigate('/laporan?tab=budget')} className="t-label flex w-full items-center gap-2 border-t border-outline py-3 text-warning">
              <TriangleAlert size={16} /> {hotCategories} kategori hampir/lewat batas <ChevronRight size={16} className="ml-auto" />
            </button>
          )}
          {!limits.length && (
            <button onClick={() => navigate('/laporan?tab=budget')} className="t-label flex w-full items-center gap-2 border-t border-outline py-3 text-ink">
              Atur batas bulanan <ChevronRight size={16} className="ml-auto" />
            </button>
          )}
        </Card>

        <section>
          <SectionTitle right={<LinkButton onClick={() => navigate('/transaksi')}>Lihat semua</LinkButton>}>Transaksi terakhir</SectionTitle>
          {d.txs.length ? (
            <RecentList txs={d.txs} />
          ) : (
            <Card>
              <EmptyState icon={<Plus size={32} />} text="Belum ada transaksi" action={<Button className="w-auto px-6" onClick={() => navigate('/tambah')}>Catat transaksi pertama</Button>} />
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}

function Header() {
  const { today } = useData();
  const navigate = useNavigate();
  return (
    <header className="pt-safe flex items-end justify-between px-4">
      <div>
        <p className="t-body-sm text-sub">{formatShortDate(today)}</p>
        <h1 className="t-headline-lg text-ink">Beranda</h1>
      </div>
      <IconButton label="Pengaturan" onClick={() => navigate('/pengaturan')}>
        <Settings size={20} strokeWidth={1.75} />
      </IconButton>
    </header>
  );
}

/** IDR / NTD hero cards in a snap carousel with page dots (DESIGN.md › Balance card). */
function BalanceCarousel({ cards }: { cards: { currency: Currency; total: number; change: number; count: number }[] }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  return (
    <div>
      <div
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pt-4"
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth) * (cards.length - 1)) || 0);
        }}
      >
        {cards.map((c) => (
          <button
            key={c.currency}
            onClick={() => navigate('/rekening')}
            className={cn(
              'w-[calc(100%-40px)] shrink-0 snap-start rounded-3xl p-5 text-left text-white',
              cards.length === 1 && 'w-full',
              c.currency === 'IDR' ? 'bg-idr-card shadow-[0_12px_32px_rgba(3,105,161,0.25)]' : 'bg-ntd-card shadow-[0_12px_32px_rgba(124,58,237,0.25)]',
            )}
          >
            <div className="flex items-center justify-between">
              <CurrencyBadge currency={c.currency} solid />
              <span className="t-body-sm text-white/80">Total Saldo</span>
            </div>
            <p className="t-display mt-4 truncate">{formatMoney(c.total, c.currency)}</p>
            <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-3">
              <span className="t-body-sm flex items-center gap-1.5 text-white/90">
                <TrendingUp size={16} className={c.change < 0 ? 'rotate-180' : ''} />
                {formatMoney(c.change, c.currency, { sign: c.change > 0 ? '+' : 'auto' })} bulan ini
              </span>
              <span className="t-body-sm text-white/80">{c.count} rekening</span>
            </div>
          </button>
        ))}
        <div className="w-1 shrink-0" />
      </div>
      {cards.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {cards.map((c, i) => (
            <span key={c.currency} className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-4 bg-ink' : 'w-1.5 bg-outline')} />
          ))}
        </div>
      )}
    </div>
  );
}
