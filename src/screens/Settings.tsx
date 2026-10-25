import { ArrowLeftRight, CircleCheck, Database, Download, FileSpreadsheet, FolderOpen, HardDrive, Info, Moon, Star, Tags, Trash2, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DecimalInput, parseDecimal } from '../components/inputs';
import { Sheet } from '../components/Sheet';
import { Button, Group, Row, ScreenHeader, Segmented, Toggle } from '../components/ui';
import type { Currency, Settings } from '../db/types';
import { exportBackup, exportCSV, importBackup, parseBackup, storageInfo, wipeAll, type BackupFile, type BackupSummary } from '../lib/backup';
import { dayOf, formatAgo, formatLongDate, timeOf } from '../lib/dates';
import { decimalInputValue, formatDecimal, formatNumber } from '../lib/money';
import { setFxRate, updateSettings } from '../lib/ops';
import { useData } from '../state/data';
import { useToast } from '../state/toast';

const tile = (Icon: typeof Star, bg: string) => (
  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
    <Icon size={17} />
  </span>
);

export function SettingsScreen() {
  const d = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [rate, setRate] = useState(d.fx ? decimalInputValue(d.fx.rate) : '');
  const [restore, setRestore] = useState<{ data: BackupFile; summary: BackupSummary } | null>(null);
  const [wipe, setWipe] = useState(false);
  const [storage, setStorage] = useState<{ usage?: number; persisted: boolean }>({ persisted: false });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void storageInfo().then(setStorage);
  }, []);

  const rateChanged = parseDecimal(rate) > 0 && parseDecimal(rate) !== d.fx?.rate;
  const saveRate = async () => {
    await setFxRate(parseDecimal(rate));
    toast({ title: `Kurs disimpan: 1 NT$ = Rp${formatDecimal(parseDecimal(rate))}`, tone: 'success' });
  };

  const backup = async () => {
    const r = await exportBackup(d.snapshot);
    if (r !== 'cancelled') toast({ title: 'Backup dibuat', subtitle: 'Simpan file-nya di iCloud Drive (Files)', tone: 'success' });
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      setRestore(parseBackup(await file.text()));
    } catch (e) {
      toast({ title: (e as Error).message, tone: 'warning' });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const lastBackup = d.settings.lastBackupAt;

  return (
    <main className="pb-16">
      <ScreenHeader title="Pengaturan" back="/" />
      <div className="space-y-6 px-4 pt-5">
        <Group header="Kurs & mata uang" footer={d.fx ? `Diatur ${formatAgo(dayOf(d.fx.updatedAt), d.today)}, ${timeOf(d.fx.updatedAt)}. Dipakai untuk total gabungan dan perbandingan kurs transfer.` : 'Isi kurs supaya total gabungan IDR + NT$ bisa dihitung.'}>
          <div className="flex items-center gap-3 px-4 py-3">
            {tile(ArrowLeftRight, 'bg-idr-c text-idr')}
            <span className="t-body flex-1 text-ink">Mata uang utama</span>
            <Segmented<Currency> className="w-32" value={d.settings.primaryCurrency} onChange={(v) => updateSettings({ primaryCurrency: v })} options={[{ value: 'IDR', label: 'IDR' }, { value: 'NTD', label: 'NTD' }]} />
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            {tile(ArrowLeftRight, 'bg-ntd-c text-ntd-text')}
            <span className="t-body flex-1 text-ink">1 NT$ = Rp</span>
            <DecimalInput value={rate} onChange={setRate} className="w-28" />
            {rateChanged && (
              <button onClick={saveRate} className="t-label rounded-lg bg-primary px-3 py-2 text-on-primary">
                Simpan
              </button>
            )}
          </div>
        </Group>

        <Group header="Input cepat" footer="Tips: taruh ikon Kantong di Dock iPhone supaya bisa dibuka dengan satu tap.">
          <Row left={tile(Star, 'bg-warning-c text-warning')} title="Favorit" right={<span className="t-body text-sub">{d.favorites.length}</span>} chevron onClick={() => navigate('/pengaturan/favorit')} />
          <div className="flex items-center gap-3 px-4 py-3">
            {tile(Zap, 'bg-interest-c text-interest')}
            <span className="t-body flex-1 text-ink">Tap favorit langsung simpan</span>
            <Toggle checked={d.settings.favoriteOneTap} onChange={(v) => updateSettings({ favoriteOneTap: v })} label="Tap favorit langsung simpan" />
          </div>
        </Group>

        <Group header="Data" footer="Data hanya tersimpan di iPhone ini. Simpan backup secara berkala ke iCloud Drive.">
          <Row left={tile(Tags, 'bg-ntd-c text-ntd-text')} title="Kategori" chevron onClick={() => navigate('/pengaturan/kategori')} />
          <Row
            left={tile(Download, 'bg-interest-c text-interest')}
            title="Backup (Export JSON)"
            subtitle={lastBackup ? `Terakhir: ${formatAgo(dayOf(lastBackup), d.today)}` : 'Belum pernah backup'}
            right={lastBackup ? <CircleCheck size={18} className="text-income" /> : undefined}
            onClick={backup}
          />
          <Row left={tile(FileSpreadsheet, 'bg-idr-c text-idr')} title="Export CSV transaksi" subtitle="Untuk Excel, Numbers, atau Google Sheets" onClick={() => void exportCSV(d.snapshot)} />
          <Row left={tile(FolderOpen, 'bg-warning-c text-warning')} title="Restore dari backup" chevron onClick={() => fileRef.current?.click()} />
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </Group>

        <Group header="Tampilan">
          <div className="flex items-center gap-3 px-4 py-3">
            {tile(Moon, 'bg-muted text-sub')}
            <span className="t-body flex-1 text-ink">Tema</span>
            <Segmented<Settings['theme']>
              className="w-52"
              value={d.settings.theme}
              onChange={(v) => updateSettings({ theme: v })}
              options={[
                { value: 'system', label: 'iPhone' },
                { value: 'light', label: 'Terang' },
                { value: 'dark', label: 'Gelap' },
              ]}
            />
          </div>
        </Group>

        <Group header="Tentang">
          <Row left={tile(Info, 'bg-muted text-sub')} title="Versi" right={<span className="t-body text-sub">1.0.0</span>} />
          <Row
            left={tile(HardDrive, 'bg-muted text-sub')}
            title="Penyimpanan"
            subtitle={storage.persisted ? 'Tersimpan permanen di perangkat ini' : 'Tersimpan di perangkat ini'}
            right={storage.usage !== undefined ? <span className="t-body text-sub">{formatNumber(Math.max(0.1, storage.usage / 1_048_576))} MB</span> : undefined}
          />
          <Row left={tile(Trash2, 'bg-expense-c text-expense')} title={<span className="text-expense">Hapus semua data</span>} onClick={() => setWipe(true)} />
        </Group>
      </div>

      <Sheet open={!!restore} onClose={() => setRestore(null)} title="Restore dari backup" subtitle="Semua data di iPhone ini akan diganti">
        {restore && (
          <div className="space-y-4">
            <div className="t-body space-y-1 rounded-xl bg-muted p-4 text-ink">
              <p className="flex items-center gap-2">
                <Database size={16} /> {restore.summary.accounts} rekening · {restore.summary.transactions} transaksi
              </p>
              {restore.summary.from && (
                <p className="t-body-sm text-sub">
                  {formatLongDate(restore.summary.from)} – {formatLongDate(restore.summary.to!)}
                </p>
              )}
              <p className="t-body-sm text-sub">Dibuat {new Date(restore.summary.exportedAt).toLocaleString('id-ID')}</p>
            </div>
            <Button
              variant="destructive"
              onClick={async () => {
                await importBackup(restore.data);
                setRestore(null);
                toast({ title: 'Data dipulihkan dari backup', tone: 'success' });
                navigate('/');
              }}
            >
              Ganti semua data
            </Button>
          </div>
        )}
      </Sheet>

      <Sheet open={wipe} onClose={() => setWipe(false)} title="Hapus semua data?" subtitle="Rekening, transaksi, budget, dan favorit akan dihapus dari iPhone ini.">
        <div className="space-y-2">
          <Button variant="secondary" onClick={backup}>
            Backup dulu
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await wipeAll();
              setWipe(false);
              navigate('/onboarding', { replace: true });
            }}
          >
            Hapus semua
          </Button>
        </div>
      </Sheet>
    </main>
  );
}
