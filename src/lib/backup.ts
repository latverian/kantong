// Backup / restore (PRD F13). Data never leaves the phone except through the user's own share sheet.
import { db } from '../db/db';
import type { Account, Budget, Category, Favorite, FxRate, Settings, Transaction } from '../db/types';
import { dayOf, nowMoment, timeOf, todayKey } from './dates';
import { toUnits } from './money';
import { ensureSeeded, updateSettings } from './ops';

export interface BackupFile {
  app: 'kantong';
  version: 1;
  exportedAt: string;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  favorites: Favorite[];
  fxRates: FxRate[];
  settings: Settings[];
}

export type Snapshot = Omit<BackupFile, 'app' | 'version' | 'exportedAt'>;

const tables = () => [db.accounts, db.transactions, db.categories, db.budgets, db.favorites, db.fxRates, db.settings];

export const buildBackup = (s: Snapshot): BackupFile => ({ app: 'kantong', version: 1, exportedAt: new Date().toISOString(), ...s });

/**
 * Opens the iOS share sheet ("Simpan ke File" → iCloud Drive) or falls back to a download.
 * Must be called synchronously from the tap handler: Safari drops the share permission after an await.
 */
export async function shareOrDownload(filename: string, content: string, mime: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([content], filename, { type: mime });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return 'shared';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}

export async function exportBackup(s: Snapshot) {
  const result = await shareOrDownload(`kantong-backup-${todayKey()}.json`, JSON.stringify(buildBackup(s)), 'application/json');
  if (result !== 'cancelled') await updateSettings({ lastBackupAt: nowMoment() });
  return result;
}

const TYPE_LABEL: Record<Transaction['type'], string> = {
  expense: 'Pengeluaran',
  income: 'Pemasukan',
  transfer: 'Transfer',
  interest: 'Bunga',
  adjustment: 'Penyesuaian',
  debt: 'Utang/Piutang',
};

const csvCell = (v: string | number | undefined) => {
  const s = v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function buildCSV(s: Snapshot): string {
  const acc = new Map(s.accounts.map((a) => [a.id, a]));
  const cat = new Map(s.categories.map((c) => [c.id, c.name]));
  const head = ['tanggal', 'jam', 'jenis', 'rekening', 'mata_uang', 'kategori', 'nominal', 'ke_rekening', 'nominal_diterima', 'kurs', 'catatan'];
  const rows = [...s.transactions]
    .filter((t) => !(t.type === 'interest' && t.amount === 0))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => [
      dayOf(t.date),
      timeOf(t.date),
      TYPE_LABEL[t.type],
      acc.get(t.accountId)?.name,
      acc.get(t.accountId)?.currency,
      t.categoryId ? cat.get(t.categoryId) : '',
      toUnits(t.type === 'expense' ? -t.amount : t.amount),
      t.toAccountId ? acc.get(t.toAccountId)?.name : '',
      t.toAmount !== undefined ? toUnits(t.toAmount) : '',
      t.fxRate ?? '',
      t.note ?? '',
    ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

export const exportCSV = (s: Snapshot) => shareOrDownload(`kantong-transaksi-${todayKey()}.csv`, '﻿' + buildCSV(s), 'text/csv');

export interface BackupSummary {
  accounts: number;
  transactions: number;
  from?: string;
  to?: string;
  exportedAt: string;
}

export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;

const MAX_TEXT = 500;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MOMENT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const isStr = (v: unknown, max = MAX_TEXT): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;
const isOptStr = (v: unknown) => v === undefined || (typeof v === 'string' && v.length <= MAX_TEXT);
const isInt = (v: unknown): v is number => Number.isSafeInteger(v);
const isOneOf = <T extends string>(v: unknown, list: readonly T[]): v is T => typeof v === 'string' && (list as readonly string[]).includes(v);
const CURRENCY = ['IDR', 'NTD'] as const;

/**
 * Restore is the only way outside data enters the app, so every record is checked before it
 * touches the database ("never trust input"): types, enums, sizes, formats and references.
 */
export function validateBackup(data: unknown): asserts data is BackupFile {
  const fail = (what: string): never => {
    throw new Error(`File backup tidak valid (${what}).`);
  };
  const d = data as Partial<BackupFile> | null;
  if (!d || typeof d !== 'object' || d.app !== 'kantong' || d.version !== 1) fail('bukan backup Kantong');
  for (const key of ['accounts', 'transactions', 'categories', 'budgets', 'favorites', 'fxRates', 'settings'] as const) {
    if (!Array.isArray(d![key])) fail(`bagian ${key} hilang`);
  }
  const b = d as BackupFile;
  const ids = new Set<string>();
  const uniqueId = (id: unknown, where: string) => {
    if (!isStr(id, 100) || ids.has(id)) fail(`id ${where}`);
    ids.add(id as string);
  };

  const accountIds = new Set<string>();
  for (const a of b.accounts) {
    uniqueId(a?.id, 'rekening');
    if (!isStr(a.name, 100) || !isOneOf(a.currency, CURRENCY) || !isOneOf(a.type, ['bank', 'cash', 'ewallet'] as const) || !isInt(a.openingBalance)) fail(`rekening ${a.id}`);
    if (a.interest !== undefined) {
      const c = a.interest;
      const rates = Array.isArray(c?.rateHistory) && c.rateHistory.every((r) => typeof r?.rate === 'number' && r.rate >= 0 && r.rate <= 100 && DAY.test(r.from));
      if (!rates || !DAY.test(c.startDate) || !isOneOf(c.payout, ['daily', 'monthly'] as const) || typeof c.taxPercent !== 'number' || !isInt(c.taxThreshold)) fail(`bunga rekening ${a.name}`);
    }
    accountIds.add(a.id);
  }
  const categoryIds = new Set<string>();
  for (const c of b.categories) {
    uniqueId(c?.id, 'kategori');
    if (!isStr(c.name, 100) || !isOneOf(c.kind, ['expense', 'income'] as const)) fail(`kategori ${c.id}`);
    categoryIds.add(c.id);
  }
  for (const t of b.transactions) {
    uniqueId(t?.id, 'transaksi');
    const ok =
      isOneOf(t.type, ['expense', 'income', 'transfer', 'interest', 'adjustment', 'debt'] as const) &&
      accountIds.has(t.accountId) &&
      (t.toAccountId === undefined || accountIds.has(t.toAccountId)) &&
      isInt(t.amount) &&
      (t.toAmount === undefined || isInt(t.toAmount)) &&
      MOMENT.test(t.date) &&
      isOptStr(t.note) &&
      (t.categoryId === undefined || categoryIds.has(t.categoryId));
    if (!ok) fail(`transaksi ${t.id}`);
  }
  for (const x of b.budgets) {
    uniqueId(x?.id, 'budget');
    if (!isOneOf(x.scope, ['total', 'category'] as const) || !isOneOf(x.currency, CURRENCY) || !isInt(x.amount)) fail(`budget ${x.id}`);
  }
  for (const f of b.favorites) {
    uniqueId(f?.id, 'favorit');
    if (!isStr(f.label, 100) || !accountIds.has(f.accountId) || (f.amount !== undefined && !isInt(f.amount))) fail(`favorit ${f.id}`);
  }
  for (const r of b.fxRates) {
    uniqueId(r?.id, 'kurs');
    if (typeof r.rate !== 'number' || !(r.rate > 0 && r.rate < 1e6)) fail(`kurs ${r.id}`);
  }
  if (b.settings.length > 1 || b.settings.some((s) => s?.id !== 'app')) fail('pengaturan');
}

export function parseBackup(text: string): { data: BackupFile; summary: BackupSummary } {
  if (text.length > MAX_BACKUP_BYTES) throw new Error('File terlalu besar untuk backup Kantong.');
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('File bukan JSON yang valid.');
  }
  validateBackup(data);
  const days = data.transactions.map((t) => dayOf(t.date)).sort();
  return {
    data,
    summary: { accounts: data.accounts.length, transactions: data.transactions.length, from: days[0], to: days.at(-1), exportedAt: data.exportedAt },
  };
}

/** Replaces everything on this device with the backup's contents. */
export async function importBackup(data: BackupFile) {
  await db.transaction('rw', tables(), async () => {
    for (const t of tables()) await t.clear();
    await db.accounts.bulkAdd(data.accounts);
    await db.transactions.bulkAdd(data.transactions);
    await db.categories.bulkAdd(data.categories ?? []);
    await db.budgets.bulkAdd(data.budgets ?? []);
    await db.favorites.bulkAdd(data.favorites ?? []);
    await db.fxRates.bulkAdd(data.fxRates ?? []);
    if (data.settings?.length) await db.settings.bulkAdd(data.settings.map((s) => ({ ...s, onboarded: true })));
  });
  await ensureSeeded();
}

export async function wipeAll() {
  await db.transaction('rw', tables(), async () => {
    for (const t of tables()) await t.clear();
  });
  await ensureSeeded();
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (await navigator.storage?.persisted?.()) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export async function storageInfo(): Promise<{ usage?: number; persisted: boolean }> {
  try {
    const [est, persisted] = await Promise.all([navigator.storage?.estimate?.(), navigator.storage?.persisted?.()]);
    return { usage: est?.usage, persisted: !!persisted };
  } catch {
    return { persisted: false };
  }
}
