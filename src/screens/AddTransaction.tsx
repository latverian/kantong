import { ArrowUpDown, CalendarDays, ChevronDown, Star, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Keypad } from '../components/Keypad';
import { AccountPickerSheet, CategoryGrid } from '../components/pickers';
import { formatRate } from '../components/TxList';
import { Button, CurrencyBadge, Segmented, Toggle, cn } from '../components/ui';
import type { Account, Favorite, Transaction } from '../db/types';
import { nowMoment } from '../lib/dates';
import { convert } from '../lib/ledger';
import { digitsToMinor, formatDecimal, formatMoney, formatNumber, minorToDigits, PREFIX } from '../lib/money';
import { deleteTransaction, restoreTransactions, saveFavorite, saveTransaction, type Alert } from '../lib/ops';
import { useData } from '../state/data';
import { useToast, type ToastInput } from '../state/toast';

type Mode = 'expense' | 'income' | 'transfer';
type Field = 'amount' | 'to' | 'fee';

export function AddTransaction() {
  const { id } = useParams();
  const { search } = useLocation();
  const d = useData();
  const existing = id ? d.txs.find((t) => t.id === id) ?? null : null;

  // A transfer fee row is edited through its parent transfer.
  const navigate = useNavigate();
  useEffect(() => {
    if (existing?.linkedTransactionId) navigate(`/transaksi/${existing.linkedTransactionId}`, { replace: true });
  }, [existing, navigate]);

  if (id && !existing) return <p className="pt-safe p-6 text-sub">Transaksi tidak ditemukan.</p>;
  // remount when the query changes (e.g. /tambah → /tambah?type=transfer) so the form starts fresh
  return <Editor key={id ?? `new${search}`} existing={existing} />;
}

function Editor({ existing }: { existing: Transaction | null }) {
  const d = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [params] = useSearchParams();
  const fixedType = existing && (existing.type === 'interest' || existing.type === 'adjustment') ? existing.type : null;

  const fee = existing ? d.txs.find((t) => t.linkedTransactionId === existing.id) : undefined;
  const pickDefaultAccount = (): string => {
    const wanted = params.get('from') ?? d.settings.lastAccountId;
    return d.activeAccounts.find((a) => a.id === wanted)?.id ?? d.activeAccounts[0]?.id ?? '';
  };

  const [mode, setMode] = useState<Mode>((existing?.type as Mode) ?? (params.get('type') === 'transfer' ? 'transfer' : 'expense'));
  const [accountId, setAccountId] = useState(existing?.accountId ?? pickDefaultAccount());
  const [toAccountId, setToAccountId] = useState(existing?.toAccountId ?? d.activeAccounts.find((a) => a.id !== accountId)?.id ?? '');
  const [amount, setAmount] = useState(minorToDigits(existing?.amount ?? 0));
  const [toAmount, setToAmount] = useState(minorToDigits(existing?.toAmount ?? 0));
  const [feeDigits, setFeeDigits] = useState(minorToDigits(fee?.amount ?? 0));
  const [field, setField] = useState<Field>('amount');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [date, setDate] = useState(existing?.date ?? nowMoment());
  const [note, setNote] = useState(existing?.note ?? '');
  const [asFavorite, setAsFavorite] = useState(false);
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);
  const [busy, setBusy] = useState(false);

  const account = d.accountsById.get(accountId);
  const toAccount = d.accountsById.get(toAccountId);
  const cross = mode === 'transfer' && account && toAccount && account.currency !== toAccount.currency;
  const kindCategories = useMemo(() => d.categories.filter((c) => !c.archived && c.kind === (mode === 'income' ? 'income' : 'expense') && !c.isSystem), [d.categories, mode]);

  // Default category per type (last used, else first).
  useEffect(() => {
    if (mode === 'transfer' || fixedType) return;
    if (kindCategories.some((c) => c.id === categoryId)) return;
    const last = d.settings.lastCategoryByType?.[mode];
    setCategoryId(kindCategories.find((c) => c.id === last)?.id ?? kindCategories[0]?.id ?? '');
  }, [mode, kindCategories, categoryId, d.settings.lastCategoryByType, fixedType]);

  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/', { replace: true }));
  const showAlerts = (alerts: Alert[], fallback: ToastInput | null) => {
    if (alerts.length) alerts.forEach((a) => toast({ title: a.title, subtitle: a.subtitle, tone: a.tone, action: { label: 'Lihat', onClick: () => navigate('/laporan?tab=budget') } }));
    else if (fallback) toast(fallback);
  };

  const amountMinor = digitsToMinor(amount);
  const toMinorAmount = digitsToMinor(toAmount);
  const feeMinor = digitsToMinor(feeDigits);
  const canSave =
    !busy && amountMinor > 0 && !!account && (mode !== 'transfer' || (!!toAccount && toAccountId !== accountId && (!cross || toMinorAmount > 0))) && (mode === 'transfer' || !!fixedType || !!categoryId);

  async function save() {
    if (!canSave) return;
    setBusy(true);
    try {
      const type = fixedType ?? mode;
      const { alerts } = await saveTransaction({
        id: existing?.id,
        type,
        accountId,
        toAccountId: mode === 'transfer' ? toAccountId : undefined,
        amount: fixedType === 'adjustment' && existing && existing.amount < 0 ? -amountMinor : amountMinor,
        toAmount: cross ? toMinorAmount : undefined,
        categoryId: mode === 'transfer' ? undefined : fixedType === 'interest' ? existing?.categoryId : categoryId,
        date,
        note,
        fee: mode === 'transfer' ? feeMinor : undefined,
      });
      if (asFavorite && mode !== 'transfer' && !existing) {
        const cat = d.categoriesById.get(categoryId);
        await saveFavorite({ label: note.trim() || cat?.name || 'Favorit', type: mode, amount: amountMinor, accountId, categoryId, note: note.trim() || undefined });
      }
      showAlerts(alerts, { title: existing ? 'Perubahan disimpan' : 'Transaksi tersimpan', tone: 'success' });
      goBack();
    } finally {
      setBusy(false);
    }
  }

  /** One tap on a favorite with an amount saves right away, with "Urungkan" (PRD F3). */
  async function applyFavorite(f: Favorite) {
    const acc = d.accountsById.get(f.accountId);
    if (!acc) return;
    if (f.amount && d.settings.favoriteOneTap) {
      setBusy(true);
      const { id, alerts } = await saveTransaction({ type: f.type, accountId: f.accountId, amount: f.amount, categoryId: f.categoryId, date: nowMoment(), note: f.note ?? f.label, favoriteId: f.id });
      setBusy(false);
      const amountText = formatMoney(f.amount, acc.currency, { sign: f.type === 'expense' ? '-' : '+' });
      toast({ title: `${f.label} ${amountText} tersimpan`, tone: 'success', action: { label: 'Urungkan', onClick: () => void deleteTransaction(id) } });
      showAlerts(alerts, null);
      goBack();
      return;
    }
    setMode(f.type);
    setAccountId(f.accountId);
    setCategoryId(f.categoryId);
    setNote(f.note ?? f.label);
    setAmount(minorToDigits(f.amount ?? 0));
    setField('amount');
  }

  async function remove() {
    if (!existing) return;
    const rows = await deleteTransaction(existing.id);
    toast({ title: 'Transaksi dihapus', tone: 'info', action: { label: 'Urungkan', onClick: () => void restoreTransactions(rows) } });
    goBack();
  }

  const swap = () => {
    setAccountId(toAccountId);
    setToAccountId(accountId);
    setAmount(toAmount || amount);
    setToAmount(toAmount ? amount : '');
  };

  const keypadValue = field === 'to' ? toAmount : field === 'fee' ? feeDigits : amount;
  const setKeypad = field === 'to' ? setToAmount : field === 'fee' ? setFeeDigits : setAmount;
  const title = existing ? (fixedType === 'interest' ? 'Edit Bunga' : fixedType === 'adjustment' ? 'Edit Penyesuaian' : 'Edit Transaksi') : 'Catat Transaksi';

  if (!d.activeAccounts.length) {
    return (
      <main className="pt-safe p-6">
        <p className="t-body mb-4 text-sub">Tambahkan rekening dulu sebelum mencatat transaksi.</p>
        <Button onClick={() => navigate('/rekening/baru', { replace: true })}>Tambah rekening</Button>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col bg-bg">
      <header className="pt-safe shrink-0 px-4">
        <div className="flex h-12 items-center justify-between">
          <button aria-label="Tutup" onClick={goBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sub">
            <X size={18} />
          </button>
          <h1 className="t-title text-ink">{title}</h1>
          {existing ? (
            <button aria-label="Hapus transaksi" onClick={remove} className="flex h-9 w-9 items-center justify-center rounded-full bg-expense-c text-expense">
              <Trash2 size={18} />
            </button>
          ) : (
            <span className="w-9" />
          )}
        </div>
        {!fixedType && (
          <Segmented<Mode>
            className="mt-1"
            value={mode}
            onChange={(m) => {
              setMode(m);
              setField('amount');
            }}
            options={[
              { value: 'expense', label: 'Pengeluaran' },
              { value: 'income', label: 'Pemasukan' },
              { value: 'transfer', label: 'Transfer' },
            ]}
          />
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-3">
        {!existing && mode !== 'transfer' && d.favorites.some((f) => f.type === mode) && (
          <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
            {d.favorites
              .filter((f) => f.type === mode && d.accountsById.get(f.accountId) && !d.accountsById.get(f.accountId)!.archived)
              .map((f) => (
                <button key={f.id} disabled={busy} onClick={() => applyFavorite(f)} className="t-label flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-outline bg-surface px-3 text-ink">
                  <Star size={14} className="text-warning" />
                  {f.label}
                  {f.amount !== undefined && <span className="text-ntd-text">{formatMoney(f.amount, d.accountsById.get(f.accountId)!.currency)}</span>}
                </button>
              ))}
          </div>
        )}

        {mode === 'transfer' && !fixedType ? (
          <TransferFields
            from={account}
            to={toAccount}
            amount={amount}
            toAmount={toAmount}
            fee={feeDigits}
            field={field}
            setField={setField}
            onPick={setPicker}
            onSwap={swap}
            marketRate={d.fx?.rate}
          />
        ) : (
          <div className="rounded-2xl border border-outline bg-surface p-4 text-center dark:border-transparent">
            <p className={cn('t-caps', mode === 'income' || fixedType === 'interest' ? 'text-income' : fixedType === 'adjustment' ? 'text-transfer' : 'text-expense')}>
              {fixedType === 'interest' ? 'Bunga' : fixedType === 'adjustment' ? 'Penyesuaian' : mode === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </p>
            <p className="mt-1 flex items-baseline justify-center gap-1 text-ink">
              <span className="t-amount-lg text-sub">{account ? PREFIX[account.currency] : ''}</span>
              <span className="t-display">{amount ? formatNumber(Number(amount)) : '0'}</span>
            </p>
            <button disabled={!!fixedType} onClick={() => setPicker('from')} className="mx-auto mt-3 flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
              {account && <CurrencyBadge currency={account.currency} />}
              <span className="t-label text-ink">{account?.name ?? 'Pilih rekening'}</span>
              {!fixedType && <ChevronDown size={16} className="text-sub" />}
            </button>
          </div>
        )}

        {mode !== 'transfer' && !fixedType && (
          <div className="mt-4">
            <p className="t-caps mb-2 text-sub">Kategori</p>
            <CategoryGrid categories={kindCategories} value={categoryId} onPick={setCategoryId} />
          </div>
        )}

        <div className="mt-4 divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface dark:border-transparent">
          <label className="flex items-center gap-3 px-4 py-3">
            <CalendarDays size={20} className="text-sub" />
            <span className="t-body flex-1 text-ink">Tanggal</span>
            <input type="datetime-local" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="bg-transparent text-right text-[15px] text-sub outline-none" />
          </label>
          <label className="flex items-center gap-3 px-4 py-3">
            <span className="t-body text-ink">Catatan</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={mode === 'transfer' ? 'mis. Kirim ke rumah' : 'mis. Makan malam'} className="min-w-0 flex-1 bg-transparent text-right text-ink outline-none placeholder:text-disabled" />
          </label>
          {!existing && mode !== 'transfer' && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Star size={20} className="text-warning" />
              <span className="t-body flex-1 text-ink">Simpan sebagai favorit</span>
              <Toggle checked={asFavorite} onChange={setAsFavorite} label="Simpan sebagai favorit" />
            </div>
          )}
        </div>
      </div>

      <div className="pb-safe shrink-0 border-t border-outline bg-bg px-4 pt-3">
        <Keypad value={keypadValue} onChange={setKeypad} />
        <Button className="mb-3 mt-3" disabled={!canSave} onClick={save}>
          {mode === 'transfer' ? 'Simpan Transfer' : 'Simpan'}
        </Button>
      </div>

      <AccountPickerSheet
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={picker === 'to' ? 'Ke rekening' : 'Dari rekening'}
        accounts={d.activeAccounts}
        balances={d.balances}
        value={picker === 'to' ? toAccountId : accountId}
        disabledId={mode === 'transfer' ? (picker === 'to' ? accountId : toAccountId) : undefined}
        onPick={(v) => (picker === 'to' ? setToAccountId(v) : setAccountId(v))}
      />
    </main>
  );
}

function TransferFields({ from, to, amount, toAmount, fee, field, setField, onPick, onSwap, marketRate }: {
  from?: Account;
  to?: Account;
  amount: string;
  toAmount: string;
  fee: string;
  field: Field;
  setField: (f: Field) => void;
  onPick: (p: 'from' | 'to') => void;
  onSwap: () => void;
  marketRate?: number;
}) {
  const { balances } = useData();
  const cross = from && to && from.currency !== to.currency;
  const sent = digitsToMinor(amount);
  const received = digitsToMinor(toAmount);
  // rate expressed as IDR per 1 NT$, whatever the direction
  const rate = cross && sent > 0 && received > 0 ? (from!.currency === 'NTD' ? received / sent : sent / received) : undefined;
  const expected = cross && marketRate && sent > 0 ? convert(sent, from!.currency, to!.currency, marketRate) : undefined;
  const diff = expected !== undefined && received > 0 ? received - expected : undefined;

  const box = (label: string, acc: Account | undefined, which: 'from' | 'to', digits: string, f: Field) => (
    <div className={cn('rounded-2xl border bg-surface p-4', field === f ? 'border-ink' : 'border-outline dark:border-transparent')}>
      <button onClick={() => onPick(which)} className="flex w-full items-center gap-2 text-left">
        <span className="t-body-sm text-sub">{label}</span>
        <span className="t-title text-ink">{acc?.name ?? 'Pilih rekening'}</span>
        {acc && <CurrencyBadge currency={acc.currency} />}
        <ChevronDown size={16} className="text-sub" />
        {acc && <span className="t-body-sm ml-auto text-sub">Saldo {formatMoney(balances.get(acc.id) ?? 0, acc.currency)}</span>}
      </button>
      <button onClick={() => setField(f)} className="mt-3 flex w-full items-baseline justify-between border-t border-outline pt-3">
        <span className="t-body text-sub">{which === 'from' ? (cross ? 'Dikirim' : 'Nominal') : 'Diterima'}</span>
        <span className={cn('t-display', which === 'to' ? 'text-idr' : 'text-ink')}>
          {acc ? PREFIX[acc.currency] : ''}
          {digits ? formatNumber(Number(digits)) : '0'}
        </span>
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="relative space-y-2">
        {box('Dari', from, 'from', amount, 'amount')}
        <button aria-label="Tukar rekening" onClick={onSwap} className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-outline bg-surface text-ink shadow">
          <ArrowUpDown size={18} />
        </button>
        {cross ? (
          box('Ke', to, 'to', toAmount, 'to')
        ) : (
          <div className="rounded-2xl border border-outline bg-surface p-4 dark:border-transparent">
            <button onClick={() => onPick('to')} className="flex w-full items-center gap-2 text-left">
              <span className="t-body-sm text-sub">Ke</span>
              <span className="t-title text-ink">{to?.name ?? 'Pilih rekening'}</span>
              {to && <CurrencyBadge currency={to.currency} />}
              <ChevronDown size={16} className="text-sub" />
            </button>
          </div>
        )}
      </div>

      {cross && (
        <div className="rounded-2xl bg-muted p-4">
          <p className="t-title text-ink">{rate ? `Kurs: 1 NT$ = Rp${formatRate(Number(rate.toFixed(2)))}` : 'Kurs dihitung otomatis'}</p>
          <p className="t-body-sm text-sub">Dihitung dari jumlah dikirim dan diterima</p>
          {diff !== undefined && marketRate && (
            <p className={cn('t-body-sm mt-2 border-t border-outline pt-2', diff < 0 ? 'text-warning' : 'text-income')}>
              Kurs pasar Rp{formatDecimal(marketRate)} · kamu dapat {formatMoney(Math.abs(diff), to!.currency)} {diff < 0 ? 'lebih sedikit' : 'lebih banyak'}
            </p>
          )}
        </div>
      )}

      <button onClick={() => setField('fee')} className={cn('flex w-full items-center justify-between rounded-2xl border bg-surface px-4 py-3 text-left', field === 'fee' ? 'border-ink' : 'border-outline dark:border-transparent')}>
        <span>
          <span className="t-body block text-ink">Biaya transfer</span>
          <span className="t-body-sm text-sub">dicatat sebagai pengeluaran · Biaya Transfer</span>
        </span>
        <span className="t-amount-md text-expense">{from ? formatMoney(digitsToMinor(fee), from.currency) : '—'}</span>
      </button>
    </div>
  );
}
