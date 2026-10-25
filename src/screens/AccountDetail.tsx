import { ArrowLeftRight, ChevronLeft, CircleCheck, Info, Percent, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AccountTile } from '../components/icons';
import { MoneyInput } from '../components/inputs';
import { Sheet } from '../components/Sheet';
import { TxGroupedList } from '../components/TxList';
import { Badge, Button, Card, CurrencyBadge, EmptyState, Money, NavBar } from '../components/ui';
import type { Account } from '../db/types';
import { addDays, dayOf, formatAgo, monthOf } from '../lib/dates';
import { estimateDaily, rateOn } from '../lib/interest';
import { formatDecimal, formatMoney, MINOR } from '../lib/money';
import { adjustBalance } from '../lib/ops';
import { useData } from '../state/data';
import { useToast } from '../state/toast';

export function AccountDetail() {
  const { id } = useParams();
  const d = useData();
  const navigate = useNavigate();
  const [adjusting, setAdjusting] = useState(false);
  const account = d.accountsById.get(id ?? '');
  if (!account) return <p className="pt-safe p-6 text-sub">Rekening tidak ditemukan.</p>;

  const balance = d.balances.get(account.id) ?? 0;
  const txs = d.txs.filter((t) => t.accountId === account.id || t.toAccountId === account.id);

  return (
    <main className="pb-16">
      <NavBar
        title={account.name}
        left={
          <button onClick={() => navigate('/rekening')} className="t-body flex items-center text-idr">
            <ChevronLeft size={22} /> Rekening
          </button>
        }
        right={
          <button onClick={() => navigate(`/rekening/${account.id}/edit`)} className="t-body text-idr">
            Edit
          </button>
        }
      />
      <div className="space-y-5 px-4 pt-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <AccountTile account={account} size={48} />
            <CurrencyBadge currency={account.currency} />
          </div>
          <p className="t-body-sm mt-3 text-sub">Saldo</p>
          <Money value={balance} currency={account.currency} className="t-display block text-ink" />
          <p className="t-body-sm mt-1 flex items-center gap-1.5 text-sub">
            <CircleCheck size={14} />
            {account.lastReconciledAt ? `Terakhir dicocokkan: ${formatAgo(account.lastReconciledAt, d.today)}` : 'Belum pernah dicocokkan'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="secondary" className="h-11" onClick={() => setAdjusting(true)}>
              <SlidersHorizontal size={18} /> Sesuaikan Saldo
            </Button>
            <Button variant="secondary" className="h-11" onClick={() => navigate(`/tambah?type=transfer&from=${account.id}`)}>
              <ArrowLeftRight size={18} /> Transfer
            </Button>
          </div>
        </Card>

        {account.interest?.enabled && <InterestCard account={account} balance={balance} />}

        <section>
          <h2 className="t-headline-md mb-2 text-ink">Riwayat</h2>
          {txs.length ? <TxGroupedList txs={txs} accountContext={account.id} /> : <EmptyState icon={<Info size={32} />} text="Belum ada transaksi di rekening ini." />}
        </section>
      </div>
      <AdjustSheet open={adjusting} onClose={() => setAdjusting(false)} account={account} balance={balance} />
    </main>
  );
}

function InterestCard({ account, balance }: { account: Account; balance: number }) {
  const d = useData();
  const cfg = account.interest!;
  const yesterday = addDays(d.today, -1);
  const month = monthOf(d.today);
  const own = d.txs.filter((t) => t.type === 'interest' && t.accountId === account.id);
  const sumWhere = (f: (day: string) => boolean) => own.filter((t) => f(dayOf(t.date))).reduce((s, t) => s + t.amount, 0);
  const perDay = estimateDaily(balance, cfg, d.today);
  const rate = rateOn(cfg, d.today);
  const c = account.currency;
  const tile = (label: string, value: string, muted = false) => (
    <div className={muted ? 'rounded-xl bg-muted p-3' : 'rounded-xl border border-interest/25 bg-interest-c/50 p-3'}>
      <p className="t-caps text-sub">{label}</p>
      <p className={`t-amount-md mt-2 ${muted ? 'text-ink' : 'text-interest'}`}>{value}</p>
    </div>
  );
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-interest-c text-interest">
          <Percent size={18} />
        </span>
        <h2 className="t-title flex-1 text-ink">Bunga Tabungan</h2>
        <Badge tone="interest">{formatDecimal(rate)}% p.a.</Badge>
      </div>
      <div className="t-body-sm mt-3 divide-y divide-outline rounded-xl bg-muted px-3">
        <div className="flex justify-between py-2">
          <span className="text-sub">Suku bunga</span>
          <span className="text-ink">
            {formatDecimal(rate)}% p.a. · {cfg.payout === 'daily' ? 'Harian' : 'Bulanan'}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-sub">Pajak bunga</span>
          <span className="text-ink">{cfg.taxPercent ? `${formatDecimal(cfg.taxPercent)}% (saldo > ${formatMoney(cfg.taxThreshold, c)})` : 'Tidak ada'}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {cfg.payout === 'daily' ? (
          <>
            {tile('Kemarin', formatMoney(sumWhere((x) => x === yesterday), c, { sign: '+' }))}
            {tile('Bulan ini', formatMoney(sumWhere((x) => monthOf(x) === month), c, { sign: '+' }))}
          </>
        ) : (
          <>
            {tile('Berjalan', formatMoney(Math.round((cfg.pending + cfg.carry) / MINOR) * MINOR, c, { sign: '+' }))}
            {tile('Tahun ini', formatMoney(sumWhere((x) => x.slice(0, 4) === d.today.slice(0, 4)), c, { sign: '+' }))}
          </>
        )}
        {tile('Est. / tahun', formatMoney(perDay * 365, c, { approx: true }), true)}
      </div>
      <p className="t-body-sm mt-3 flex gap-1.5 text-sub">
        <Info size={14} className="mt-0.5 shrink-0" />
        Estimasi. Cocokkan berkala dengan saldo di aplikasi bank.
      </p>
    </Card>
  );
}

function AdjustSheet({ open, onClose, account, balance }: { open: boolean; onClose: () => void; account: Account; balance: number }) {
  const [actual, setActual] = useState(balance);
  const toast = useToast();
  useEffect(() => {
    if (open) setActual(balance);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- reset only when the sheet opens
  const diff = actual - balance;
  const save = async () => {
    const delta = await adjustBalance(account.id, actual);
    toast({ title: delta ? `Saldo disesuaikan ${formatMoney(delta, account.currency, { sign: delta > 0 ? '+' : 'auto' })}` : 'Saldo sudah cocok', tone: 'success' });
    onClose();
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Sesuaikan Saldo"
      subtitle={`${account.name} · cocokkan dengan saldo di aplikasi bank`}
      footer={
        <>
          <Button onClick={save}>Simpan Penyesuaian</Button>
          <button onClick={onClose} className="t-label mt-2 h-10 w-full text-sub">
            Batal
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
          <span className="t-body text-sub">Saldo di Kantong</span>
          <Money value={balance} currency={account.currency} className="t-amount-md text-ink" />
        </div>
        <div>
          <p className="t-label mb-2 text-ink">Saldo asli di {account.type === 'cash' ? 'dompet' : 'bank'}</p>
          <MoneyInput large autoFocus value={actual} onChange={setActual} currency={account.currency} />
        </div>
        <div className="rounded-xl bg-muted p-4">
          <Badge>Selisih {formatMoney(diff, account.currency, { sign: diff > 0 ? '+' : 'auto' })}</Badge>
          <p className="t-body-sm mt-2 text-sub">
            akan dicatat sebagai <b className="text-ink">Penyesuaian</b> (tidak masuk laporan pemasukan atau pengeluaran)
          </p>
        </div>
      </div>
    </Sheet>
  );
}
