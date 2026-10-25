import { Lock, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ACCOUNT_ICON_CHOICES, defaultAccountIcon, ICONS } from '../components/icons';
import { DecimalInput, MoneyInput, parseDecimal } from '../components/inputs';
import { Button, CurrencyBadge, Group, NavBar, Segmented, Toggle, cn } from '../components/ui';
import { ACCOUNT_COLORS, interestDefaults } from '../db/defaults';
import type { Account, Currency } from '../db/types';
import { dailyNet, rateOn } from '../lib/interest';
import { decimalInputValue, formatMoney, MINOR } from '../lib/money';
import { accountHasTransactions, deleteAccount, saveAccount, setAccountArchived } from '../lib/ops';
import { useData } from '../state/data';
import { useToast } from '../state/toast';

export function AccountForm() {
  const { id } = useParams();
  const d = useData();
  const existing = id ? d.accountsById.get(id) : undefined;
  if (id && !existing) return <p className="pt-safe p-6 text-sub">Rekening tidak ditemukan.</p>;
  return <Form key={id ?? 'new'} existing={existing} />;
}

function Form({ existing }: { existing?: Account }) {
  const d = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState(existing?.name ?? '');
  const [currency, setCurrency] = useState<Currency>(existing?.currency ?? 'IDR');
  const [type, setType] = useState<Account['type']>(existing?.type ?? 'bank');
  const [opening, setOpening] = useState(existing?.openingBalance ?? 0);
  const [color, setColor] = useState(existing?.color ?? ACCOUNT_COLORS[0]);
  const [icon, setIcon] = useState(existing?.icon ?? 'landmark');
  const [iconTouched, setIconTouched] = useState(!!existing);
  const cfg = existing?.interest;
  const defaults = interestDefaults(currency);
  const [interestOn, setInterestOn] = useState(!!cfg?.enabled);
  const [rate, setRate] = useState(cfg ? decimalInputValue(rateOn(cfg, d.today)) : '');
  const [payout, setPayout] = useState(cfg?.payout ?? defaults.payout);
  const [tax, setTax] = useState(decimalInputValue(cfg?.taxPercent ?? defaults.taxPercent));
  const [threshold, setThreshold] = useState(cfg?.taxThreshold ?? defaults.taxThreshold);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (existing) void accountHasTransactions(existing.id).then(setLocked);
  }, [existing]);

  // New accounts: follow the type for the icon until the user picks one, and use per-currency interest defaults.
  useEffect(() => {
    if (!iconTouched) setIcon(defaultAccountIcon(type));
  }, [type, iconTouched]);
  useEffect(() => {
    if (cfg) return;
    const def = interestDefaults(currency);
    setPayout(def.payout);
    setTax(decimalInputValue(def.taxPercent));
    setThreshold(def.taxThreshold);
  }, [currency, cfg]);

  const balance = existing ? d.balances.get(existing.id) ?? 0 : opening;
  const preview = interestOn ? dailyNet(balance, parseDecimal(rate), { taxPercent: parseDecimal(tax), taxThreshold: threshold }) : 0;
  const perDay = Math.round(preview / MINOR) * MINOR;
  const canSave = name.trim().length > 0 && (!interestOn || parseDecimal(rate) > 0);

  async function save() {
    if (!canSave) return;
    const savedId = await saveAccount({
      id: existing?.id,
      name,
      currency,
      type,
      openingBalance: existing ? existing.openingBalance : opening,
      color,
      icon,
      interest: interestOn || cfg ? { enabled: interestOn, rate: parseDecimal(rate), payout, taxPercent: parseDecimal(tax), taxThreshold: threshold } : undefined,
    });
    toast({ title: existing ? 'Rekening disimpan' : 'Rekening ditambahkan', tone: 'success' });
    navigate(existing ? `/rekening/${savedId}` : '/rekening', { replace: true });
  }

  async function archive() {
    if (!existing) return;
    await setAccountArchived(existing.id, !existing.archived);
    toast({ title: existing.archived ? 'Rekening diaktifkan lagi' : 'Rekening diarsipkan', tone: 'success' });
    navigate('/rekening', { replace: true });
  }

  async function remove() {
    if (!existing) return;
    try {
      await deleteAccount(existing.id);
      toast({ title: 'Rekening dihapus', tone: 'success' });
      navigate('/rekening', { replace: true });
    } catch (e) {
      toast({ title: (e as Error).message, tone: 'warning' });
    }
  }

  return (
    <main className="pb-16">
      <NavBar
        title={existing ? 'Edit Rekening' : 'Rekening Baru'}
        left={
          <button onClick={() => navigate(-1)} className="t-body text-sub">
            Batal
          </button>
        }
        right={
          <button onClick={save} disabled={!canSave} className="t-label-lg text-ink disabled:text-disabled">
            Simpan
          </button>
        }
      />
      <div className="space-y-6 px-4 pt-4">
        <Group header="Informasi utama">
          <label className="flex items-center gap-3 px-4 py-3">
            <span className="t-body text-sub">Nama</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. SeaBank" className="t-body min-w-0 flex-1 bg-transparent text-right font-semibold text-ink outline-none placeholder:font-normal placeholder:text-disabled" />
          </label>
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="t-body flex-1 text-sub">Mata uang</span>
              {locked ? (
                <span className="flex items-center gap-2">
                  <CurrencyBadge currency={currency} />
                  <Lock size={16} className="text-disabled" />
                </span>
              ) : (
                <Segmented<Currency> className="w-40" value={currency} onChange={setCurrency} options={[{ value: 'IDR', label: 'IDR' }, { value: 'NTD', label: 'NTD' }]} accent={{ IDR: 'bg-idr text-white', NTD: 'bg-ntd text-white' }} />
              )}
            </div>
            {locked && <p className="t-body-sm mt-1 text-disabled">Tidak bisa diubah karena sudah ada transaksi</p>}
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="t-body flex-1 text-sub">Jenis</span>
            <Segmented<Account['type']>
              className="w-56"
              value={type}
              onChange={setType}
              options={[
                { value: 'bank', label: 'Bank' },
                { value: 'cash', label: 'Tunai' },
                { value: 'ewallet', label: 'E-wallet' },
              ]}
            />
          </div>
        </Group>

        <Group header="Saldo" footer={existing ? 'Ubah saldo lewat Sesuaikan Saldo di halaman rekening.' : 'Saldo saat rekening mulai dicatat di Kantong.'}>
          {existing ? (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="t-body text-sub">Saldo saat ini</span>
              <span className="t-amount-lg text-ink">{formatMoney(balance, currency)}</span>
            </div>
          ) : (
            <div className="p-3">
              <MoneyInput value={opening} onChange={setOpening} currency={currency} />
            </div>
          )}
        </Group>

        <Group header="Warna & ikon">
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-3">
              {ACCOUNT_COLORS.map((c) => (
                <button key={c} aria-label={`Warna ${c}`} onClick={() => setColor(c)} className={cn('h-9 w-9 rounded-full', color === c && 'ring-2 ring-ink ring-offset-2 ring-offset-surface')} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_ICON_CHOICES.map((k) => {
                const Icon = ICONS[k];
                return (
                  <button
                    key={k}
                    aria-label={k}
                    onClick={() => {
                      setIcon(k);
                      setIconTouched(true);
                    }}
                    className={cn('flex h-11 w-11 items-center justify-center rounded-xl', icon === k ? 'ring-2 ring-ink' : '')}
                    style={{ backgroundColor: `${color}26`, color }}
                  >
                    <Icon size={22} strokeWidth={1.75} />
                  </button>
                );
              })}
            </div>
          </div>
        </Group>

        <Group header="Bunga tabungan">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <p className="t-title text-ink">Rekening berbunga</p>
              <p className="t-body-sm text-sub">Bunga dihitung otomatis tiap hari</p>
            </div>
            <Toggle checked={interestOn} onChange={setInterestOn} label="Rekening berbunga" />
          </div>
          {interestOn && (
            <>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="t-body text-ink">Suku bunga</span>
                <DecimalInput value={rate} onChange={setRate} suffix="% per tahun" />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="t-body text-ink">Pencairan</span>
                <Segmented className="w-44" value={payout} onChange={setPayout} options={[{ value: 'daily', label: 'Harian' }, { value: 'monthly', label: 'Bulanan' }]} />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="t-body text-ink">Pajak bunga</span>
                <DecimalInput value={tax} onChange={setTax} suffix="%" />
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="t-body text-ink">Batas saldo kena pajak</span>
                <MoneyInput className="h-10 w-40" value={threshold} onChange={setThreshold} currency={currency} />
              </div>
            </>
          )}
        </Group>

        {interestOn && parseDecimal(rate) > 0 && (
          <div className="rounded-2xl border border-interest/25 bg-interest-c p-4">
            <p className="t-caps flex items-center gap-1.5 text-interest">
              <Sparkles size={14} /> Estimasi bunga bersih
            </p>
            <p className="t-amount-lg mt-1 text-interest">
              {formatMoney(perDay, currency, { sign: '+' })}/hari · ≈ {formatMoney(perDay * 30, currency)}/bulan
            </p>
            <p className="t-body-sm mt-1 text-interest/80">
              Dari saldo {formatMoney(balance, currency)}
              {parseDecimal(tax) > 0 && balance > threshold ? ` setelah dipotong pajak ${tax}%` : ''}. Perubahan suku bunga berlaku mulai hari ini.
            </p>
          </div>
        )}

        {existing && (
          <div className="space-y-2">
            <Button variant="secondary" onClick={archive}>
              {existing.archived ? 'Aktifkan lagi' : 'Arsipkan rekening'}
            </Button>
            {!locked && (
              <Button variant="destructive" onClick={remove}>
                Hapus rekening
              </Button>
            )}
            <p className="t-body-sm px-1 text-center text-sub">Rekening yang diarsipkan disembunyikan tanpa menghapus riwayatnya.</p>
          </div>
        )}
      </div>
    </main>
  );
}
