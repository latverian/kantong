// All writes go through here so interest recomputation and limit alerts stay consistent.
import { db, uid } from '../db/db';
import { defaultCategories, defaultSettings } from '../db/defaults';
import type { Account, Budget, Category, Currency, Favorite, InterestConfig, Settings, Transaction } from '../db/types';
import { SYSTEM_CATEGORY } from '../db/types';
import { dayOf, monthOf, nowMoment, todayKey } from './dates';
import { accrue } from './interest';
import { balancesAt } from './ledger';
import { budgetFor, limitStatus, spentFor } from './limits';
import { formatMoney } from './money';

const stamp = () => new Date().toISOString();

export async function ensureSeeded() {
  await db.transaction('rw', db.settings, db.categories, async () => {
    if (!(await db.settings.get('app'))) await db.settings.put(defaultSettings());
    if ((await db.categories.count()) === 0) await db.categories.bulkPut(defaultCategories());
  });
}

export const updateSettings = (patch: Partial<Omit<Settings, 'id'>>) => db.settings.update('app', patch);

// ---------- Interest ----------

/** Flags interest accounts whose history changed on or before their last accrued day. */
async function markDirty(accountIds: (string | undefined)[], day: string) {
  for (const id of new Set(accountIds.filter(Boolean) as string[])) {
    const a = await db.accounts.get(id);
    const cfg = a?.interest;
    if (!cfg?.enabled || !cfg.lastAccruedDate || day > cfg.lastAccruedDate) continue;
    const dirtyFrom = cfg.dirtyFrom && cfg.dirtyFrom < day ? cfg.dirtyFrom : day;
    await db.accounts.update(id, { interest: { ...cfg, dirtyFrom } });
  }
}

let accrualRun: Promise<void> | null = null;

/** Posts interest for every finished day. Serialised so overlapping calls never double-post. */
export function runAccrual(today = todayKey()): Promise<void> {
  const run = (accrualRun ?? Promise.resolve()).then(async () => {
    const accounts = await db.accounts.toArray();
    for (const a of accounts) {
      if (!a.interest?.enabled) continue;
      const txs = await db.transactions.where('accountId').equals(a.id).or('toAccountId').equals(a.id).toArray();
      const r = accrue(a, txs, today);
      if (!r) continue;
      const unchanged =
        !r.add.length && !r.removeIds.length && r.config.lastAccruedDate === a.interest.lastAccruedDate && !a.interest.dirtyFrom;
      if (unchanged) continue;
      await db.transaction('rw', db.transactions, db.accounts, async () => {
        if (r.removeIds.length) await db.transactions.bulkDelete(r.removeIds);
        const now = stamp();
        if (r.add.length) await db.transactions.bulkAdd(r.add.map((t) => ({ ...t, id: uid(), createdAt: now, updatedAt: now })));
        await db.accounts.update(a.id, { interest: r.config });
      });
    }
  });
  accrualRun = run.catch(() => {});
  return run;
}

// ---------- Limit alerts ----------

export interface Alert {
  title: string;
  subtitle?: string;
  tone: 'warning' | 'danger';
}

/** Compares spending before/after a change and returns the 80%/100% alerts to show (once per month). */
async function limitAlerts(before: Transaction[], after: Transaction[], changed: Transaction[]): Promise<Alert[]> {
  const today = todayKey();
  const month = monthOf(today);
  const relevant = changed.filter((t) => t.type === 'expense' && monthOf(t.date) === month);
  if (!relevant.length) return [];
  const [accounts, budgets, categories] = await Promise.all([db.accounts.toArray(), db.budgets.toArray(), db.categories.toArray()]);
  const byId = new Map(accounts.map((a) => [a.id, a]));
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const alerts: Alert[] = [];

  const targets = new Map<string, { currency: Currency; categoryId?: string }>();
  for (const t of relevant) {
    const currency = byId.get(t.accountId)?.currency;
    if (!currency) continue;
    targets.set(`${currency}`, { currency });
    if (t.categoryId) targets.set(`${currency}:${t.categoryId}`, { currency, categoryId: t.categoryId });
  }

  for (const { currency, categoryId } of targets.values()) {
    const b = budgetFor(budgets, month, currency, categoryId);
    if (!b) continue;
    const prev = limitStatus(b.amount, spentFor(before, byId, month, currency, categoryId), month, today);
    const next = limitStatus(b.amount, spentFor(after, byId, month, currency, categoryId), month, today);
    const crossed100 = prev.percent < 100 && next.percent >= 100 && b.lastAlert100 !== month;
    const crossed80 = prev.percent < 80 && next.percent >= 80 && b.lastAlert80 !== month;
    if (!crossed80 && !crossed100) continue;
    const label = categoryId ? catName.get(categoryId) ?? 'Kategori' : `Pengeluaran ${currency} bulan ini`;
    const what = categoryId ? 'budget' : 'batas';
    if (crossed100) {
      alerts.push({ tone: 'danger', title: `${label} melewati ${what}`, subtitle: `Lewat ${formatMoney(-next.remaining, currency)}` });
    } else {
      alerts.push({
        tone: 'warning',
        title: `${label} sudah ${next.percent}% dari ${what}`,
        subtitle: `Sisa ${formatMoney(next.remaining, currency)} · ${formatMoney(next.perDay, currency)}/hari`,
      });
    }
    const patch: Partial<Budget> = crossed100 ? { lastAlert100: month, lastAlert80: month } : { lastAlert80: month };
    await db.budgets.update(b.id, patch);
  }
  return alerts.sort((a, b) => (a.tone === b.tone ? 0 : a.tone === 'danger' ? -1 : 1));
}

// ---------- Transactions ----------

export interface TxInput {
  id?: string;
  type: Transaction['type'];
  accountId: string;
  toAccountId?: string;
  amount: number;
  toAmount?: number;
  categoryId?: string;
  date: string;
  note?: string;
  favoriteId?: string;
  fee?: number; // transfer fee, stored as a linked expense
}

export async function saveTransaction(input: TxInput): Promise<{ id: string; alerts: Alert[] }> {
  const before = await db.transactions.toArray();
  const existing = input.id ? before.find((t) => t.id === input.id) : undefined;
  const id = input.id ?? uid();
  const now = stamp();
  const isTransfer = input.type === 'transfer';

  const accounts = new Map((await db.accounts.toArray()).map((a) => [a.id, a]));
  const from = accounts.get(input.accountId);
  const to = input.toAccountId ? accounts.get(input.toAccountId) : undefined;
  const crossCurrency = isTransfer && from && to && from.currency !== to.currency;
  const toAmount = isTransfer ? (crossCurrency ? input.toAmount ?? input.amount : input.amount) : undefined;

  const tx: Transaction = {
    id,
    type: input.type,
    accountId: input.accountId,
    toAccountId: isTransfer ? input.toAccountId : undefined,
    amount: input.amount,
    toAmount,
    fxRate: crossCurrency && input.amount > 0 ? Number(((toAmount ?? 0) / input.amount).toFixed(4)) : undefined,
    categoryId: isTransfer ? undefined : input.categoryId,
    date: input.date,
    note: input.note?.trim() || undefined,
    favoriteId: input.favoriteId ?? existing?.favoriteId,
    adjustmentSource: existing?.adjustmentSource,
    isAuto: false,
    isManuallyEdited: existing?.type === 'interest' ? true : false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const oldFee = before.find((t) => t.linkedTransactionId === id);
  const changed: Transaction[] = [tx];
  await db.transaction('rw', db.transactions, async () => {
    await db.transactions.put(tx);
    if (isTransfer && input.fee && input.fee > 0) {
      const fee: Transaction = {
        id: oldFee?.id ?? uid(),
        type: 'expense',
        accountId: input.accountId,
        amount: input.fee,
        categoryId: SYSTEM_CATEGORY.transferFee,
        date: input.date,
        note: 'Biaya transfer',
        linkedTransactionId: id,
        isAuto: false,
        isManuallyEdited: false,
        createdAt: oldFee?.createdAt ?? now,
        updatedAt: now,
      };
      await db.transactions.put(fee);
      changed.push(fee);
    } else if (oldFee) {
      await db.transactions.delete(oldFee.id);
    }
  });

  const firstDay = [dayOf(tx.date), existing && dayOf(existing.date)].filter(Boolean).sort()[0] as string;
  await markDirty([tx.accountId, tx.toAccountId, existing?.accountId, existing?.toAccountId], firstDay);
  await runAccrual();

  if (tx.type === 'expense' || tx.type === 'income') {
    const s = await db.settings.get('app');
    await updateSettings({
      lastAccountId: tx.accountId,
      lastCategoryByType: { ...s?.lastCategoryByType, [tx.type]: tx.categoryId },
    });
  }

  const after = await db.transactions.toArray();
  const alerts = await limitAlerts(before, after, changed);
  return { id, alerts };
}

/** Deletes a transaction (and its linked fee). Returns the removed rows so the caller can offer "Urungkan". */
export async function deleteTransaction(id: string): Promise<Transaction[]> {
  const tx = await db.transactions.get(id);
  if (!tx) return [];
  if (tx.type === 'interest') {
    // Auto interest would be regenerated by the next recompute, so keep a zero-amount manual row as a tombstone.
    const removed = [{ ...tx }];
    await db.transactions.update(id, { amount: 0, isManuallyEdited: true, updatedAt: stamp() });
    await markDirty([tx.accountId], dayOf(tx.date));
    await runAccrual();
    return removed;
  }
  const linked = await db.transactions.where('linkedTransactionId').equals(id).toArray();
  const removed = [tx, ...linked];
  await db.transactions.bulkDelete(removed.map((t) => t.id));
  await markDirty([tx.accountId, tx.toAccountId], dayOf(tx.date));
  await runAccrual();
  return removed;
}

export async function restoreTransactions(rows: Transaction[]) {
  if (!rows.length) return;
  await db.transactions.bulkPut(rows);
  const first = rows.map((t) => dayOf(t.date)).sort()[0];
  await markDirty(rows.flatMap((t) => [t.accountId, t.toAccountId]), first);
  await runAccrual();
}

/** Records the difference between the app balance and the real balance (PRD F6). */
export async function adjustBalance(accountId: string, actual: number, note?: string): Promise<number> {
  const [account, txs] = await Promise.all([db.accounts.get(accountId), db.transactions.toArray()]);
  if (!account) return 0;
  const current = balancesAt([account], txs).get(accountId) ?? 0;
  const delta = actual - current;
  const now = stamp();
  if (delta !== 0) {
    await db.transactions.add({
      id: uid(),
      type: 'adjustment',
      accountId,
      amount: delta,
      date: nowMoment(),
      note: note ?? 'Penyesuaian saldo',
      adjustmentSource: 'manual',
      isAuto: false,
      isManuallyEdited: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  await db.accounts.update(accountId, { lastReconciledAt: todayKey() });
  return delta;
}

// ---------- Accounts ----------

export interface AccountInput {
  id?: string;
  name: string;
  currency: Currency;
  type: Account['type'];
  openingBalance: number;
  color: string;
  icon: string;
  interest?: { enabled: boolean; rate: number; payout: InterestConfig['payout']; taxPercent: number; taxThreshold: number };
}

export async function saveAccount(input: AccountInput): Promise<string> {
  const existing = input.id ? await db.accounts.get(input.id) : undefined;
  const today = todayKey();
  const id = input.id ?? uid();
  const count = await db.accounts.count();

  let interest: InterestConfig | undefined = existing?.interest;
  const want = input.interest;
  if (want?.enabled) {
    const prev = existing?.interest;
    const reenabled = !prev?.enabled;
    const history = reenabled ? [] : [...(prev?.rateHistory ?? [])];
    const currentRate = prev && !reenabled ? history.filter((r) => r.from <= today).at(-1)?.rate : undefined;
    if (currentRate !== want.rate) {
      // a new rate applies from today; earlier days keep their old rate (PRD F5)
      const rest = history.filter((r) => r.from !== today);
      rest.push({ rate: want.rate, from: today });
      history.splice(0, history.length, ...rest);
    }
    const startDate = reenabled ? today : prev!.startDate;
    const settingsChanged =
      reenabled || currentRate !== want.rate || prev?.payout !== want.payout || prev?.taxPercent !== want.taxPercent || prev?.taxThreshold !== want.taxThreshold;
    interest = {
      enabled: true,
      payout: want.payout,
      rateHistory: history,
      taxPercent: want.taxPercent,
      taxThreshold: want.taxThreshold,
      startDate,
      lastAccruedDate: reenabled ? undefined : prev?.lastAccruedDate,
      carry: reenabled ? 0 : prev?.carry ?? 0,
      pending: reenabled ? 0 : prev?.pending ?? 0,
      dirtyFrom: reenabled ? undefined : settingsChanged ? startDate : prev?.dirtyFrom,
    };
  } else if (existing?.interest) {
    interest = { ...existing.interest, enabled: false };
  }

  const account: Account = {
    id,
    name: input.name.trim(),
    currency: input.currency,
    type: input.type,
    openingBalance: input.openingBalance,
    color: input.color,
    icon: input.icon,
    sortOrder: existing?.sortOrder ?? count,
    archived: existing?.archived ?? false,
    lastReconciledAt: existing?.lastReconciledAt,
    interest,
    createdAt: existing?.createdAt ?? stamp(),
  };
  if (existing && existing.openingBalance !== input.openingBalance && interest?.enabled) interest.dirtyFrom = interest.startDate;
  await db.accounts.put(account);
  await runAccrual();
  return id;
}

export const setAccountArchived = (id: string, archived: boolean) => db.accounts.update(id, { archived });

export async function accountHasTransactions(id: string) {
  return (await db.transactions.where('accountId').equals(id).or('toAccountId').equals(id).count()) > 0;
}

export async function deleteAccount(id: string) {
  if (await accountHasTransactions(id)) throw new Error('Rekening masih punya transaksi. Arsipkan saja.');
  const favs = (await db.favorites.toArray()).filter((f) => f.accountId === id);
  await db.transaction('rw', db.accounts, db.favorites, async () => {
    await db.accounts.delete(id);
    await db.favorites.bulkDelete(favs.map((f) => f.id));
  });
}

// ---------- Budgets, favorites, categories, fx ----------

export async function saveBudget(b: Omit<Budget, 'id'> & { id?: string }) {
  const id = b.id ?? uid();
  await db.budgets.put({ ...b, id });
  return id;
}
export const deleteBudget = (id: string) => db.budgets.delete(id);

export async function saveFavorite(f: Omit<Favorite, 'id' | 'sortOrder'> & { id?: string; sortOrder?: number }) {
  const id = f.id ?? uid();
  const sortOrder = f.sortOrder ?? (await db.favorites.count());
  await db.favorites.put({ ...f, id, sortOrder });
  return id;
}
export const deleteFavorite = (id: string) => db.favorites.delete(id);

export async function moveFavorite(id: string, dir: -1 | 1) {
  const favs = await db.favorites.orderBy('sortOrder').toArray();
  const i = favs.findIndex((f) => f.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= favs.length) return;
  [favs[i], favs[j]] = [favs[j], favs[i]];
  await db.favorites.bulkPut(favs.map((f, k) => ({ ...f, sortOrder: k })));
}

export async function saveCategory(c: Omit<Category, 'id' | 'sortOrder' | 'archived' | 'isSystem'> & { id?: string }) {
  const existing = c.id ? await db.categories.get(c.id) : undefined;
  const id = c.id ?? uid();
  const sortOrder = existing?.sortOrder ?? (await db.categories.where('kind').equals(c.kind).count());
  await db.categories.put({ ...c, id, sortOrder, archived: existing?.archived ?? false, isSystem: existing?.isSystem ?? false });
  return id;
}
export const setCategoryArchived = (id: string, archived: boolean) => db.categories.update(id, { archived });

export async function setFxRate(rate: number) {
  await db.fxRates.add({ id: uid(), base: 'NTD', quote: 'IDR', rate, source: 'manual', updatedAt: nowMoment() });
}
