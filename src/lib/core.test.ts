import { describe, expect, it } from 'vitest';
import type { Account, InterestConfig, Transaction } from '../db/types';
import { addDays, daysInMonth, formatDayHeader, formatLongDate, weekdayOf } from './dates';
import { accrue, dailyNet } from './interest';
import { balancesAt, combined, monthFlows } from './ledger';
import { budgetFor, limitStatus, spentFor } from './limits';
import { formatMoney, toMinor } from './money';

const R = toMinor;

const cfg = (rate: number, extra: Partial<InterestConfig> = {}): InterestConfig => ({
  enabled: true,
  payout: 'daily',
  rateHistory: [{ rate, from: '2026-10-01' }],
  taxPercent: 20,
  taxThreshold: R(7_500_000),
  startDate: '2026-10-01',
  carry: 0,
  pending: 0,
  ...extra,
});

const account = (id: string, opening: number, extra: Partial<Account> = {}): Account => ({
  id, name: id, currency: 'IDR', type: 'bank', openingBalance: opening, color: '', icon: '', sortOrder: 0, archived: false, createdAt: '', ...extra,
});

let n = 0;
const tx = (p: Partial<Transaction> & Pick<Transaction, 'type' | 'accountId' | 'amount' | 'date'>): Transaction => ({
  id: `t${n++}`, isAuto: false, isManuallyEdited: false, createdAt: '', updatedAt: '', ...p,
});

describe('format', () => {
  it('formats Rupiah and NT$ with Indonesian separators (PRD §10)', () => {
    expect(formatMoney(R(1_250_000), 'IDR')).toBe('Rp1.250.000');
    expect(formatMoney(R(1250), 'NTD')).toBe('NT$1.250');
    expect(formatMoney(-R(45_000), 'IDR')).toBe('−Rp45.000');
    expect(formatMoney(R(32_000), 'NTD', { sign: '+' })).toBe('+NT$32.000');
    expect(formatMoney(R(5), 'IDR', { hidden: true })).toBe('Rp•••••');
  });
  it('knows 24 Okt 2026 is a Saturday', () => {
    expect(weekdayOf('2026-10-24')).toBe('Sabtu');
    expect(formatLongDate('2026-10-24')).toBe('Sabtu, 24 Okt 2026');
    expect(formatDayHeader('2026-10-23', '2026-10-24')).toBe('Kemarin, Jumat 23 Okt');
    expect(formatDayHeader('2026-10-20', '2026-10-24')).toBe('Selasa, 20 Okt');
    expect(daysInMonth('2026-10')).toBe(31);
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });
});

describe('interest (PRD F5)', () => {
  it('SeaBank example: Rp14.600.000 at 4% with 20% tax → Rp1.280/day', () => {
    expect(dailyNet(R(14_600_000), 4, cfg(4)) / 100).toBeCloseTo(1280, 6);
    expect(dailyNet(R(9_125_000), 3, cfg(3)) / 100).toBeCloseTo(600, 6);
  });

  it('no tax at or below the threshold', () => {
    expect(dailyNet(R(7_500_000), 3.65, cfg(3.65)) / 100).toBeCloseTo(750, 6);
  });

  it('posts one rounded transaction per finished day and carries the remainder', () => {
    const a = account('sea', R(9_300_000), { interest: cfg(3) }); // 611.51/day net
    const r = accrue(a, [], '2026-10-04')!;
    expect(r.add.map((t) => t.date)).toEqual(['2026-10-01T23:59', '2026-10-02T23:59', '2026-10-03T23:59']);
    expect(r.add.every((t) => t.amount % 100 === 0)).toBe(true);
    const total = r.add.reduce((s, t) => s + t.amount, 0) / 100;
    expect(Math.abs(total - 3 * 611.5)).toBeLessThan(1.5);
    expect(r.config.lastAccruedDate).toBe('2026-10-03');
  });

  it('is incremental and idempotent', () => {
    const a = account('sea', R(14_600_000), { interest: cfg(4) });
    const first = accrue(a, [], '2026-10-03')!;
    const posted = first.add.map((t, i) => ({ ...t, id: `i${i}`, createdAt: '', updatedAt: '' }));
    const again = accrue({ ...a, interest: first.config }, posted, '2026-10-03')!;
    expect(again.add).toHaveLength(0);
    const next = accrue({ ...a, interest: first.config }, posted, '2026-10-04')!;
    expect(next.add.map((t) => t.date)).toEqual(['2026-10-03T23:59']);
  });

  it('recomputes everything after a backdated change, keeping manual edits', () => {
    const a = account('sea', R(14_600_000), { interest: cfg(4) });
    const first = accrue(a, [], '2026-10-05')!;
    const posted = first.add.map((t, i) => ({ ...t, id: `i${i}`, createdAt: '', updatedAt: '' }));
    posted[1] = { ...posted[1], amount: R(999), isManuallyEdited: true };
    const withdrawal = tx({ type: 'expense', accountId: 'sea', amount: R(10_000_000), date: '2026-10-01T10:00' });
    const r = accrue({ ...a, interest: { ...first.config, dirtyFrom: '2026-10-01' } }, [...posted, withdrawal], '2026-10-05')!;
    expect(r.removeIds).toEqual(['i0', 'i2', 'i3']);
    expect(r.add.map((t) => t.date)).toEqual(['2026-10-01T23:59', '2026-10-03T23:59', '2026-10-04T23:59']);
    expect(r.add[0].amount).toBe(R(504)); // 4.6jt below threshold: no tax
  });

  it('monthly payout posts once on the last day of the month', () => {
    const a = account('nt', R(100_000), { currency: 'NTD', interest: cfg(1.2, { payout: 'monthly', taxPercent: 0, taxThreshold: 0 }) });
    const r = accrue(a, [], '2026-11-02')!;
    expect(r.add.map((t) => t.date)).toEqual(['2026-10-31T23:59']);
    expect(r.add[0].amount / 100).toBe(102); // 100.000 × 1.2% × 31/365 ≈ 101.9
    expect(r.config.pending).toBeGreaterThan(0);
  });

  it('applies rate changes only from their start day', () => {
    const a = account('sea', R(14_600_000), { interest: cfg(4, { rateHistory: [{ rate: 4, from: '2026-10-01' }, { rate: 0, from: '2026-10-02' }] }) });
    const r = accrue(a, [], '2026-10-04')!;
    expect(r.add).toHaveLength(1);
  });
});

describe('ledger & limits (PRD §6, F8)', () => {
  const accounts = [account('bca', R(1_000), {}), account('dompet', R(20_000), { currency: 'NTD', type: 'cash' })];
  const byId = new Map(accounts.map((a) => [a.id, a]));
  const txs = [
    tx({ type: 'expense', accountId: 'dompet', amount: R(12_480), date: '2026-10-10T10:00', categoryId: 'cat-makan' }),
    tx({ type: 'income', accountId: 'dompet', amount: R(32_000), date: '2026-10-05T09:00' }),
    tx({ type: 'transfer', accountId: 'dompet', toAccountId: 'bca', amount: R(5_000), toAmount: R(2_550_000), date: '2026-10-23T10:00' }),
    tx({ type: 'interest', accountId: 'bca', amount: R(1_880), date: '2026-10-23T23:59' }),
    tx({ type: 'adjustment', accountId: 'bca', amount: -R(80), date: '2026-10-23T23:00' }),
  ];

  it('balances follow the effect table', () => {
    const b = balancesAt(accounts, txs);
    expect(b.get('dompet')).toBe(R(20_000 - 12_480 + 32_000 - 5_000));
    expect(b.get('bca')).toBe(R(1_000 + 2_550_000 + 1_880 - 80));
  });

  it('flows exclude transfers and adjustments', () => {
    const f = monthFlows(txs, byId, '2026-10');
    expect(f.in).toEqual({ IDR: R(1_880), NTD: R(32_000) });
    expect(f.out).toEqual({ IDR: 0, NTD: R(12_480) });
  });

  it('limit status matches Lampiran A (24 Okt: 83%, sisa NT$2.520, NT$315/hari, pace 77%)', () => {
    const s = limitStatus(R(15_000), R(12_480), '2026-10', '2026-10-24');
    expect(s).toMatchObject({ percent: 83, remaining: R(2_520), perDay: R(315), daysLeft: 8, pace: 77, tone: 'warning', aheadOfPace: true });
    const idr = limitStatus(R(2_000_000), R(1_080_000), '2026-10', '2026-10-24');
    expect(idr).toMatchObject({ percent: 54, perDay: R(115_000), tone: 'ok', aheadOfPace: false });
    const friday = limitStatus(R(15_000), R(12_325), '2026-10', '2026-10-23');
    expect(friday).toMatchObject({ percent: 82, perDay: R(297), pace: 74 });
  });

  it('spending and budgets per currency/category', () => {
    expect(spentFor(txs, byId, '2026-10', 'NTD')).toBe(R(12_480));
    expect(spentFor(txs, byId, '2026-10', 'NTD', 'cat-makan')).toBe(R(12_480));
    const budgets = [
      { id: 'a', scope: 'total' as const, currency: 'NTD' as const, amount: 1, recurring: true },
      { id: 'b', scope: 'total' as const, currency: 'NTD' as const, amount: 2, recurring: false, month: '2026-10' },
    ];
    expect(budgetFor(budgets, '2026-10', 'NTD')?.id).toBe('b');
    expect(budgetFor(budgets, '2026-11', 'NTD')?.id).toBe('a');
  });

  it('combined total uses the stored rate', () => {
    expect(combined({ IDR: R(32_175_000), NTD: R(24_600) }, 'IDR', 512)).toBe(R(44_770_200));
  });
});
