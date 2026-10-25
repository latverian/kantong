// Monthly limits & category budgets (PRD F8).
import type { Account, Budget, Currency, Transaction } from '../db/types';
import { daysInMonth, monthOf } from './dates';
import { currencyOf, isOut } from './ledger';
import { floorPercent, MINOR } from './money';

export function budgetFor(budgets: Budget[], month: string, currency: Currency, categoryId?: string): Budget | undefined {
  const matches = budgets.filter(
    (b) => b.currency === currency && (categoryId ? b.scope === 'category' && b.categoryId === categoryId : b.scope === 'total'),
  );
  return matches.find((b) => b.month === month) ?? matches.find((b) => !b.month);
}

/** Expenses (incl. transfer fees) in a month for one currency, optionally one category. */
export function spentFor(txs: Transaction[], accountsById: Map<string, Account>, month: string, currency: Currency, categoryId?: string) {
  let sum = 0;
  for (const t of txs) {
    if (!isOut(t) || monthOf(t.date) !== month || currencyOf(t, accountsById) !== currency) continue;
    if (categoryId && t.categoryId !== categoryId) continue;
    sum += t.amount;
  }
  return sum;
}

export type LimitTone = 'ok' | 'warning' | 'over';

export interface LimitStatus {
  limit: number;
  spent: number;
  percent: number; // floored
  remaining: number;
  perDay: number; // floored to whole units
  daysLeft: number;
  pace: number; // ideal % for today
  tone: LimitTone;
  aheadOfPace: boolean;
}

export const toneOf = (percent: number): LimitTone => (percent >= 100 ? 'over' : percent >= 80 ? 'warning' : 'ok');

export function limitStatus(limit: number, spent: number, month: string, today: string): LimitStatus {
  const total = daysInMonth(month);
  const currentMonth = monthOf(today);
  const dayNum = Number(today.slice(8, 10));
  const daysLeft = month === currentMonth ? total - dayNum + 1 : month > currentMonth ? total : 0;
  const pace = month === currentMonth ? Math.floor((dayNum / total) * 100) : month < currentMonth ? 100 : 0;
  const percent = floorPercent(spent, limit);
  const remaining = limit - spent;
  const perDay = remaining > 0 && daysLeft > 0 ? Math.floor(remaining / MINOR / daysLeft) * MINOR : 0;
  return { limit, spent, percent, remaining, perDay, daysLeft, pace, tone: toneOf(percent), aheadOfPace: percent > pace };
}
