// Pure ledger maths — the single implementation of PRD §6 (Aturan hitung).
import type { Account, Currency, Transaction } from '../db/types';
import { CURRENCIES } from '../db/types';
import { dayOf, monthOf } from './dates';

export interface Effect {
  accountId: string;
  delta: number;
}

/** Balance effect of one transaction (PRD §6.1, "Saldo rekening" column). */
export function effectsOf(t: Transaction): Effect[] {
  switch (t.type) {
    case 'expense':
      return [{ accountId: t.accountId, delta: -t.amount }];
    case 'income':
    case 'interest':
    case 'adjustment':
      return [{ accountId: t.accountId, delta: t.amount }];
    case 'transfer':
      return t.toAccountId
        ? [
            { accountId: t.accountId, delta: -t.amount },
            { accountId: t.toAccountId, delta: t.toAmount ?? t.amount },
          ]
        : [{ accountId: t.accountId, delta: -t.amount }];
    case 'debt':
      return []; // utang/piutang arrives in v1.1 (F16)
  }
}

/** Account balances at the end of `untilDay` (inclusive), or now when omitted. */
export function balancesAt(accounts: Account[], txs: Transaction[], untilDay?: string): Map<string, number> {
  const out = new Map<string, number>(accounts.map((a) => [a.id, a.openingBalance]));
  for (const t of txs) {
    if (untilDay && dayOf(t.date) > untilDay) continue;
    for (const e of effectsOf(t)) if (out.has(e.accountId)) out.set(e.accountId, out.get(e.accountId)! + e.delta);
  }
  return out;
}

export const emptyByCurrency = (): Record<Currency, number> => ({ IDR: 0, NTD: 0 });

export function totalsByCurrency(accounts: Account[], balances: Map<string, number>): Record<Currency, number> {
  const t = emptyByCurrency();
  for (const a of accounts) t[a.currency] += balances.get(a.id) ?? 0;
  return t;
}

/** Money "Masuk": income + interest. "Keluar": expenses incl. transfer fees (PRD §6.2). */
export const isIn = (t: Transaction) => t.type === 'income' || t.type === 'interest';
export const isOut = (t: Transaction) => t.type === 'expense';

export const currencyOf = (t: Transaction, accountsById: Map<string, Account>): Currency | undefined => accountsById.get(t.accountId)?.currency;

export interface Flows {
  in: Record<Currency, number>;
  out: Record<Currency, number>;
  interest: Record<Currency, number>;
}

export function flows(txs: Transaction[], accountsById: Map<string, Account>, filter: (t: Transaction) => boolean): Flows {
  const f: Flows = { in: emptyByCurrency(), out: emptyByCurrency(), interest: emptyByCurrency() };
  for (const t of txs) {
    if (!filter(t)) continue;
    const c = currencyOf(t, accountsById);
    if (!c) continue;
    if (isIn(t)) f.in[c] += t.amount;
    if (isOut(t)) f.out[c] += t.amount;
    if (t.type === 'interest') f.interest[c] += t.amount;
  }
  return f;
}

export const monthFlows = (txs: Transaction[], accountsById: Map<string, Account>, month: string) =>
  flows(txs, accountsById, (t) => monthOf(t.date) === month);

/** Expense totals per category for one currency and month. */
export function spendingByCategory(txs: Transaction[], accountsById: Map<string, Account>, month: string, currency: Currency) {
  const m = new Map<string, number>();
  for (const t of txs) {
    if (!isOut(t) || monthOf(t.date) !== month || currencyOf(t, accountsById) !== currency) continue;
    const k = t.categoryId ?? 'none';
    m.set(k, (m.get(k) ?? 0) + t.amount);
  }
  return m;
}

/** Converts between currencies with the stored rate (IDR per 1 NTD). */
export function convert(amount: number, from: Currency, to: Currency, rate: number): number {
  if (from === to) return amount;
  return from === 'NTD' ? Math.round(amount * rate) : Math.round(amount / rate);
}

export function combined(byCurrency: Record<Currency, number>, primary: Currency, rate: number): number {
  return CURRENCIES.reduce((sum, c) => sum + convert(byCurrency[c], c, primary, rate), 0);
}
