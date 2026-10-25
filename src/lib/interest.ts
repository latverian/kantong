// Daily interest engine (PRD F5). Pure: given an account and its transactions, returns the
// interest transactions to add/remove and the updated config.
import type { Account, InterestConfig, Transaction } from '../db/types';
import { SYSTEM_CATEGORY } from '../db/types';
import { addDays, dayOf, diffDays, isLastDayOfMonth } from './dates';
import { effectsOf } from './ledger';
import { MINOR } from './money';

export function rateOn(cfg: InterestConfig, day: string): number {
  let rate = 0;
  for (const r of [...cfg.rateHistory].sort((a, b) => a.from.localeCompare(b.from))) if (r.from <= day) rate = r.rate;
  return rate;
}

/** Net interest for one day on a balance (minor units, fractional). */
export function dailyNet(balance: number, ratePercent: number, cfg: Pick<InterestConfig, 'taxPercent' | 'taxThreshold'>): number {
  if (balance <= 0 || ratePercent <= 0) return 0;
  const gross = (balance * ratePercent) / 100 / 365;
  const tax = balance > cfg.taxThreshold ? (gross * cfg.taxPercent) / 100 : 0;
  return gross - tax;
}

/** Rounds to whole currency units; the remainder is carried to the next posting. */
const roundUnits = (exact: number) => Math.round(exact / MINOR) * MINOR;

export interface AccrualResult {
  add: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[];
  removeIds: string[];
  config: InterestConfig;
}

const isAutoInterest = (t: Transaction, accountId: string) => t.type === 'interest' && t.accountId === accountId && t.isAuto && !t.isManuallyEdited;

/**
 * Accrues interest for every finished day up to (and including) yesterday.
 * Interest for day D is computed on the balance at the end of D and posted dated D 23:59.
 * When history changed before the last accrued day (`dirtyFrom`) everything is recomputed
 * from the start date; manually edited interest rows are kept as they are.
 */
export function accrue(account: Account, txs: Transaction[], today: string): AccrualResult | null {
  const cfg = account.interest;
  if (!cfg?.enabled) return null;
  const until = addDays(today, -1);
  const full = !!cfg.dirtyFrom || !cfg.lastAccruedDate;

  const removeIds = full ? txs.filter((t) => isAutoInterest(t, account.id) && dayOf(t.date) >= cfg.startDate).map((t) => t.id) : [];
  const removed = new Set(removeIds);
  const base = txs.filter((t) => !removed.has(t.id));

  const start = full ? cfg.startDate : addDays(cfg.lastAccruedDate!, 1);
  let carry = full ? 0 : cfg.carry;
  let pending = full ? 0 : cfg.pending;

  if (start > until) {
    return { add: [], removeIds, config: { ...cfg, carry, pending, lastAccruedDate: addDays(start, -1), dirtyFrom: undefined } };
  }

  let balance = account.openingBalance;
  const deltaByDay = new Map<string, number>();
  const manualDays = new Set<string>();
  for (const t of base) {
    const d = dayOf(t.date);
    if (t.type === 'interest' && t.accountId === account.id && d >= start) manualDays.add(d);
    for (const e of effectsOf(t)) {
      if (e.accountId !== account.id) continue;
      if (d < start) balance += e.delta;
      else if (d <= until) deltaByDay.set(d, (deltaByDay.get(d) ?? 0) + e.delta);
    }
  }

  const add: AccrualResult['add'] = [];
  const post = (day: string, amount: number) => {
    add.push({
      type: 'interest',
      accountId: account.id,
      amount,
      categoryId: SYSTEM_CATEGORY.interest,
      date: `${day}T23:59`,
      isAuto: true,
      isManuallyEdited: false,
    });
    balance += amount;
  };

  const days = diffDays(start, until);
  for (let i = 0, day = start; i <= days; i++, day = addDays(day, 1)) {
    balance += deltaByDay.get(day) ?? 0;
    if (manualDays.has(day)) continue; // user-edited interest for this day stays as is
    const net = dailyNet(balance, rateOn(cfg, day), cfg);
    if (cfg.payout === 'daily') {
      const exact = net + carry;
      const posted = roundUnits(exact);
      carry = exact - posted;
      if (posted > 0) post(day, posted);
    } else {
      pending += net;
      if (isLastDayOfMonth(day)) {
        const exact = pending + carry;
        const posted = roundUnits(exact);
        carry = exact - posted;
        pending = 0;
        if (posted > 0) post(day, posted);
      }
    }
  }

  return { add, removeIds, config: { ...cfg, carry, pending, lastAccruedDate: until, dirtyFrom: undefined } };
}

/** Estimated net interest per day at the current balance (for badges and previews). */
export function estimateDaily(balance: number, cfg: InterestConfig, today: string): number {
  return roundUnits(dailyNet(balance, rateOn(cfg, today), cfg));
}
