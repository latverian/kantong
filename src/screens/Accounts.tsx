import { Archive, Plus, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountTile } from '../components/icons';
import { ACCOUNT_TYPE_LABEL } from '../components/pickers';
import { Badge, Card, CurrencyBadge, EmptyState, IconButton, Money, ScreenHeader, cn } from '../components/ui';
import type { Account, Currency } from '../db/types';
import { CURRENCIES } from '../db/types';
import { estimateDaily } from '../lib/interest';
import { combined, totalsByCurrency } from '../lib/ledger';
import { formatDecimal, formatMoney } from '../lib/money';
import { useData } from '../state/data';

const CURRENCY_TITLE: Record<Currency, string> = { IDR: 'Rupiah · IDR', NTD: 'NT Dollar · NTD' };

export function Accounts() {
  const d = useData();
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);
  const list = d.accounts.filter((a) => showArchived || !a.archived);
  const totals = totalsByCurrency(d.accounts, d.balances);
  const shown = CURRENCIES.filter((c) => list.some((a) => a.currency === c));
  const archivedCount = d.accounts.filter((a) => a.archived).length;

  return (
    <main className="pb-32">
      <ScreenHeader
        title="Rekening"
        right={
          <IconButton label="Tambah rekening" onClick={() => navigate('/rekening/baru')}>
            <Plus size={22} />
          </IconButton>
        }
      />
      <div className="space-y-6 px-4 pt-4">
        {d.accounts.length === 0 ? (
          <EmptyState icon={<Plus size={40} />} text="Belum ada rekening." />
        ) : (
          <Card className="p-4">
            <p className="t-body-sm text-sub">Total saldo</p>
            {d.fx && CURRENCIES.every((c) => d.accounts.some((a) => a.currency === c)) ? (
              <>
                <p className="t-display mt-1 text-ink">{formatMoney(combined(totals, d.settings.primaryCurrency, d.fx.rate), d.settings.primaryCurrency, { approx: true })}</p>
                <p className="t-body-sm mt-1 text-sub">Gabungan · 1 NT$ = Rp{formatDecimal(d.fx.rate)}</p>
              </>
            ) : null}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {CURRENCIES.filter((c) => d.accounts.some((a) => a.currency === c)).map((c) => (
                <div key={c} className={cn('rounded-xl border p-3', c === 'IDR' ? 'border-idr/20 bg-idr-c' : 'border-ntd/20 bg-ntd-c')}>
                  <div className="flex items-center justify-between">
                    <span className="t-body-sm text-sub">{c === 'IDR' ? 'Rupiah' : 'NT Dollar'}</span>
                    <CurrencyBadge currency={c} />
                  </div>
                  <Money value={totals[c]} currency={c} className={cn('t-amount-md mt-1 block', c === 'IDR' ? 'text-idr' : 'text-ntd-text')} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {shown.map((c) => {
          const accounts = list.filter((a) => a.currency === c);
          return (
            <section key={c}>
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="t-caps text-sub">{CURRENCY_TITLE[c]}</span>
                <Money value={totals[c]} currency={c} className="t-amount-sm text-ink" />
              </div>
              <div className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface dark:border-transparent">
                {accounts.map((a) => (
                  <AccountRow key={a.id} account={a} />
                ))}
              </div>
            </section>
          );
        })}

        {archivedCount > 0 && (
          <button onClick={() => setShowArchived(!showArchived)} className="t-label mx-auto flex items-center gap-2 text-sub">
            <Archive size={16} /> {showArchived ? 'Sembunyikan' : 'Lihat'} rekening diarsipkan ({archivedCount})
          </button>
        )}
      </div>
    </main>
  );
}

function AccountRow({ account: a }: { account: Account }) {
  const d = useData();
  const navigate = useNavigate();
  const balance = d.balances.get(a.id) ?? 0;
  const perDay = a.interest?.enabled ? estimateDaily(balance, a.interest, d.today) : 0;
  const rate = a.interest?.rateHistory.filter((r) => r.from <= d.today).at(-1)?.rate;
  return (
    <button onClick={() => navigate(`/rekening/${a.id}`)} className={cn('flex w-full items-center gap-3 px-4 py-3 text-left active:bg-muted', a.archived && 'opacity-60')}>
      <AccountTile account={a} />
      <div className="min-w-0 flex-1">
        <p className="t-title truncate text-ink">{a.name}</p>
        <p className="t-body-sm text-sub">
          {ACCOUNT_TYPE_LABEL[a.type]} · {a.currency}
          {a.archived && ' · diarsipkan'}
        </p>
        {a.interest?.enabled && rate !== undefined && (
          <Badge tone="interest" className="mt-1">
            <TrendingUp size={12} /> {formatDecimal(rate)}% p.a. · {formatMoney(perDay, a.currency, { sign: '+' })}/hari
          </Badge>
        )}
      </div>
      <Money value={balance} currency={a.currency} className="t-amount-md shrink-0 text-ink" />
    </button>
  );
}
