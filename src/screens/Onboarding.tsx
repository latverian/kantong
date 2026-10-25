import { ChevronLeft, ChevronRight, FolderOpen, Lock, Plus, Sparkles, Trash2, WifiOff } from 'lucide-react';
import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountTile, defaultAccountIcon } from '../components/icons';
import { DecimalInput, MoneyInput, parseDecimal, TextInput } from '../components/inputs';
import { ACCOUNT_TYPE_LABEL } from '../components/pickers';
import { Sheet } from '../components/Sheet';
import { Badge, Button, CurrencyBadge, Segmented, Toggle, cn } from '../components/ui';
import { ACCOUNT_COLORS, interestDefaults } from '../db/defaults';
import type { Account, Currency } from '../db/types';
import { uid } from '../db/db';
import { importBackup, parseBackup } from '../lib/backup';
import { loadDemoData } from '../lib/demo';
import { formatMoney } from '../lib/money';
import { saveAccount, saveBudget, setFxRate, updateSettings } from '../lib/ops';
import { useToast } from '../state/toast';

interface Draft {
  key: string;
  name: string;
  currency: Currency;
  type: Account['type'];
  balance: number;
  interest: boolean;
  rate: string;
  color: string;
}

const SUGGESTED: Draft[] = [
  { key: 'bca', name: 'BCA', currency: 'IDR', type: 'bank', balance: 0, interest: false, rate: '', color: ACCOUNT_COLORS[0] },
  { key: 'seabank', name: 'SeaBank', currency: 'IDR', type: 'bank', balance: 0, interest: true, rate: '', color: ACCOUNT_COLORS[1] },
  { key: 'jago', name: 'Bank Jago', currency: 'IDR', type: 'bank', balance: 0, interest: true, rate: '', color: ACCOUNT_COLORS[4] },
  { key: 'dompet', name: 'Dompet NT$', currency: 'NTD', type: 'cash', balance: 0, interest: false, rate: '', color: ACCOUNT_COLORS[3] },
  { key: 'banknt', name: 'Bank NT$', currency: 'NTD', type: 'bank', balance: 0, interest: false, rate: '', color: ACCOUNT_COLORS[3] },
];

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [drafts, setDrafts] = useState<Draft[]>(SUGGESTED);
  const [limits, setLimits] = useState<Record<Currency, number>>({ IDR: 0, NTD: 0 });
  const [rate, setRate] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const finish = async () => {
    setBusy(true);
    for (const d of drafts.filter((x) => x.name.trim())) {
      const def = interestDefaults(d.currency);
      await saveAccount({
        name: d.name,
        currency: d.currency,
        type: d.type,
        openingBalance: d.balance,
        color: d.color,
        icon: defaultAccountIcon(d.type),
        interest: d.interest && parseDecimal(d.rate) > 0 ? { enabled: true, rate: parseDecimal(d.rate), ...def } : undefined,
      });
    }
    for (const c of ['IDR', 'NTD'] as Currency[]) if (limits[c] > 0) await saveBudget({ scope: 'total', currency: c, amount: limits[c], recurring: true });
    if (parseDecimal(rate) > 0) await setFxRate(parseDecimal(rate));
    await updateSettings({ onboarded: true });
    navigate('/', { replace: true });
  };

  return (
    <main className="pt-safe flex min-h-dvh flex-col px-5 pb-6">
      <div className="flex h-12 items-center justify-between">
        {step > 1 ? (
          <button aria-label="Kembali" onClick={() => setStep(step - 1)} className="-ml-2 p-2 text-ink">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-1.5" aria-label={`Langkah ${step} dari 3`}>
          {[1, 2, 3].map((i) => (
            <span key={i} className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-ink' : 'w-1.5 bg-outline')} />
          ))}
        </div>
      </div>

      {step === 1 && <Welcome onNext={() => setStep(2)} onDemo={async () => {
        setBusy(true);
        await loadDemoData();
        toast({ title: 'Data contoh dimuat', subtitle: 'Hapus kapan saja di Pengaturan → Hapus semua data', tone: 'info' });
        navigate('/', { replace: true });
      }} busy={busy} />}
      {step === 2 && <AccountsStep drafts={drafts} setDrafts={setDrafts} onNext={() => setStep(3)} />}
      {step === 3 && (
        <div className="flex flex-1 flex-col">
          <h1 className="t-headline-lg mt-4 text-ink">Batas & kurs</h1>
          <p className="t-body mt-2 text-sub">Opsional. Batas bulanan membantu kamu tahu kapan harus mengerem. Semua bisa diubah nanti.</p>
          <div className="mt-6 space-y-4">
            {(['NTD', 'IDR'] as Currency[])
              .filter((c) => drafts.some((d) => d.currency === c))
              .map((c) => (
                <div key={c}>
                  <p className="t-label mb-2 flex items-center gap-2 text-ink">
                    <CurrencyBadge currency={c} /> Batas pengeluaran bulanan {c}
                  </p>
                  <MoneyInput value={limits[c]} onChange={(v) => setLimits({ ...limits, [c]: v })} currency={c} />
                </div>
              ))}
            {drafts.some((d) => d.currency === 'IDR') && drafts.some((d) => d.currency === 'NTD') && (
              <div>
                <p className="t-label mb-2 text-ink">Kurs untuk total gabungan</p>
                <div className="flex items-center gap-2">
                  <span className="t-body text-sub">1 NT$ = Rp</span>
                  <DecimalInput value={rate} onChange={setRate} className="h-12 flex-1" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-auto space-y-2 pt-8">
            <Button disabled={busy} onClick={finish}>
              Mulai pakai Kantong
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

function Welcome({ onNext, onDemo, busy }: { onNext: () => void; onDemo: () => void; busy: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const restore = async (file?: File) => {
    if (!file) return;
    try {
      const { data } = parseBackup(await file.text());
      await importBackup(data);
      toast({ title: 'Data dipulihkan dari backup', tone: 'success' });
      navigate('/', { replace: true });
    } catch (e) {
      toast({ title: (e as Error).message, tone: 'warning' });
    }
  };
  return (
    <div className="flex flex-1 flex-col">
      <img src="icons/icon-192.png" alt="" className="mt-6 h-16 w-16 rounded-2xl" />
      <h1 className="t-headline-lg mt-5 text-ink">Selamat datang di Kantong</h1>
      <p className="t-body mt-2 text-sub">Kelola uang Rupiah dan NT$ dalam satu tempat: banyak rekening, bunga harian otomatis, dan batas pengeluaran bulanan.</p>
      <ul className="mt-6 space-y-3">
        {[
          [Lock, 'Data hanya di iPhone-mu', 'Tanpa server, tanpa akun, tanpa iklan.'],
          [WifiOff, 'Bisa offline', 'Semua fitur jalan tanpa internet.'],
          [Sparkles, 'Bunga harian otomatis', 'Saldo tabungan berbunga bertambah sendiri tiap hari.'],
        ].map(([Icon, title, text]) => {
          const I = Icon as typeof Lock;
          return (
            <li key={title as string} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-ink">
                <I size={20} />
              </span>
              <div>
                <p className="t-body font-semibold text-ink">{title as string}</p>
                <p className="t-body-sm text-sub">{text as string}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-2 pt-8">
        <Button onClick={onNext}>Mulai</Button>
        <Button variant="secondary" disabled={busy} onClick={onDemo}>
          Coba dengan data contoh
        </Button>
        <Button variant="ghost" onClick={() => fileRef.current?.click()}>
          <FolderOpen size={18} /> Pulihkan dari backup
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => restore(e.target.files?.[0])} />
      </div>
    </div>
  );
}

function AccountsStep({ drafts, setDrafts, onNext }: { drafts: Draft[]; setDrafts: Dispatch<SetStateAction<Draft[]>>; onNext: () => void }) {
  const [editing, setEditing] = useState<Draft | null>(null);
  const toast = useToast();
  const isNew = !!editing && !drafts.some((x) => x.key === editing.key);

  const save = (d: Draft) => setDrafts((cur) => (cur.some((x) => x.key === d.key) ? cur.map((x) => (x.key === d.key ? d : x)) : [...cur, d]));
  const remove = (d: Draft) => {
    const index = drafts.findIndex((x) => x.key === d.key);
    setDrafts((cur) => cur.filter((x) => x.key !== d.key));
    toast({
      title: `${d.name || 'Rekening'} dihapus dari daftar`,
      tone: 'info',
      action: { label: 'Urungkan', onClick: () => setDrafts((cur) => (cur.some((x) => x.key === d.key) ? cur : [...cur.slice(0, index), d, ...cur.slice(index)])) },
    });
  };
  const addNew = () =>
    setEditing({ key: uid(), name: '', currency: 'IDR', type: 'bank', balance: 0, interest: false, rate: '', color: ACCOUNT_COLORS[(drafts.length + 2) % ACCOUNT_COLORS.length] });

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="t-headline-lg mt-4 text-ink">Rekening kamu</h1>
      <p className="t-body mt-2 text-sub">Tambah, ubah, atau hapus sesuai rekening yang kamu punya. Saldo awal bisa diisi sekarang atau nanti.</p>

      {drafts.length > 0 ? (
        <div className="mt-5 divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface dark:border-transparent">
          {drafts.map((d) => (
            <div key={d.key} className="flex items-center gap-1 pl-4 pr-2">
              <button onClick={() => setEditing(d)} className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left">
                <AccountTile account={{ icon: defaultAccountIcon(d.type), color: d.color } as Account} />
                <div className="min-w-0 flex-1">
                  <p className="t-title truncate text-ink">{d.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="t-body-sm text-sub">{ACCOUNT_TYPE_LABEL[d.type]}</span>
                    <CurrencyBadge currency={d.currency} />
                    {d.interest && <Badge tone="interest">Bunga harian</Badge>}
                  </div>
                </div>
                <span className="t-body-sm flex shrink-0 items-center text-sub">
                  {d.balance ? formatMoney(d.balance, d.currency) : 'Isi saldo'} <ChevronRight size={16} />
                </span>
              </button>
              <button aria-label={`Hapus ${d.name}`} onClick={() => remove(d)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-expense active:bg-expense-c">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="t-body mt-5 rounded-2xl bg-surface p-4 text-center text-sub">Belum ada rekening. Tambahkan minimal satu rekening.</p>
      )}

      <button onClick={addNew} className="t-label-lg mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline text-ink active:bg-muted">
        <Plus size={18} /> Tambah rekening
      </button>

      <div className="mt-auto pt-8">
        <Button disabled={!drafts.some((d) => d.name.trim())} onClick={onNext}>
          Lanjut
        </Button>
      </div>
      {editing && <DraftSheet draft={editing} isNew={isNew} onClose={() => setEditing(null)} onSave={save} onDelete={remove} />}
    </div>
  );
}

function DraftSheet({ draft, isNew, onClose, onSave, onDelete }: { draft: Draft; isNew: boolean; onClose: () => void; onSave: (d: Draft) => void; onDelete: (d: Draft) => void }) {
  const [d, setD] = useState(draft);
  return (
    <Sheet
      open
      onClose={onClose}
      title={isNew ? 'Tambah rekening' : `Ubah ${draft.name}`}
      footer={
        <div className="space-y-2">
          <Button
            disabled={!d.name.trim()}
            onClick={() => {
              onSave({ ...d, name: d.name.trim() });
              onClose();
            }}
          >
            {isNew ? 'Tambahkan' : 'Simpan'}
          </Button>
          {!isNew && (
            <Button
              variant="ghost"
              className="text-expense"
              onClick={() => {
                onDelete(draft);
                onClose();
              }}
            >
              <Trash2 size={18} /> Hapus rekening
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <TextInput value={d.name} onChange={(name) => setD({ ...d, name })} placeholder="Nama rekening, mis. BRI" autoFocus={isNew} />
        <div className="flex gap-2">
          <Segmented<Currency> className="flex-1" value={d.currency} onChange={(currency) => setD({ ...d, currency })} options={[{ value: 'IDR', label: 'IDR' }, { value: 'NTD', label: 'NTD' }]} accent={{ IDR: 'bg-idr text-white', NTD: 'bg-ntd text-white' }} />
          <Segmented<Account['type']>
            className="flex-[1.6]"
            value={d.type}
            onChange={(type) => setD({ ...d, type })}
            options={[
              { value: 'bank', label: 'Bank' },
              { value: 'cash', label: 'Tunai' },
              { value: 'ewallet', label: 'E-wallet' },
            ]}
          />
        </div>
        <div>
          <p className="t-label mb-2 text-ink">Saldo saat ini</p>
          <MoneyInput value={d.balance} onChange={(balance) => setD({ ...d, balance })} currency={d.currency} />
        </div>
        <div className="rounded-xl bg-muted px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="t-body flex-1 font-semibold text-ink">Rekening berbunga</span>
            <Toggle checked={d.interest} onChange={(interest) => setD({ ...d, interest })} label="Rekening berbunga" />
          </div>
          {d.interest && (
            <div className="mt-3 flex items-center justify-between">
              <span className="t-body text-sub">Suku bunga</span>
              <DecimalInput value={d.rate} onChange={(rate) => setD({ ...d, rate })} suffix="% per tahun" className="bg-surface" />
            </div>
          )}
          {d.interest && <p className="t-body-sm mt-2 text-sub">Pajak {d.currency === 'IDR' ? '20% untuk saldo di atas Rp7.500.000' : '0%'} · bisa diubah nanti.</p>}
        </div>
      </div>
    </Sheet>
  );
}
