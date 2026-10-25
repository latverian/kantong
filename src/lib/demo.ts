// "Coba dengan data contoh": the PRD Lampiran A dataset (October 2026), so the app can be
// explored before entering real data. Features from v1.1 (debts, goals, schedules) are left out.
import { db, uid } from '../db/db';
import { defaultCategories, defaultSettings } from '../db/defaults';
import type { Account, Budget, Favorite, InterestConfig, Transaction } from '../db/types';
import { SYSTEM_CATEGORY } from '../db/types';
import { accrue } from './interest';
import { effectsOf } from './ledger';
import { toMinor } from './money';
import { runAccrual } from './ops';

const R = toMinor;
const now = '2026-10-01T00:00:00.000Z';

const interest = (rate: number): InterestConfig => ({
  enabled: true,
  payout: 'daily',
  rateHistory: [{ rate, from: '2026-10-01' }],
  taxPercent: 20,
  taxThreshold: R(7_500_000),
  startDate: '2026-10-01',
  carry: 0,
  pending: 0,
});

const acc = (id: string, name: string, currency: Account['currency'], type: Account['type'], color: string, icon: string, sortOrder: number, extra: Partial<Account> = {}): Account => ({
  id, name, currency, type, color, icon, sortOrder, openingBalance: 0, archived: false, createdAt: now, ...extra,
});

export async function loadDemoData() {
  const accounts: Account[] = [
    acc('demo-bca', 'BCA', 'IDR', 'bank', '#0369A1', 'landmark', 0),
    acc('demo-seabank', 'SeaBank', 'IDR', 'bank', '#047857', 'piggy-bank', 1, { interest: interest(4), lastReconciledAt: '2026-10-21' }),
    acc('demo-jago', 'Bank Jago', 'IDR', 'bank', '#D97706', 'landmark', 2, { interest: interest(3) }),
    acc('demo-dompet', 'Dompet NT$', 'NTD', 'cash', '#7C3AED', 'wallet', 3),
    acc('demo-banknt', 'Bank NT$', 'NTD', 'bank', '#7C3AED', 'landmark', 4),
  ];

  const txs: Transaction[] = [];
  const t = (type: Transaction['type'], accountId: string, units: number, date: string, categoryId?: string, note?: string, extra: Partial<Transaction> = {}) => {
    const row: Transaction = { id: uid(), type, accountId, amount: R(units), date, categoryId, note, isAuto: false, isManuallyEdited: false, createdAt: now, updatedAt: now, ...extra };
    txs.push(row);
    return row;
  };
  const oct = (d: number) => `2026-10-${String(d).padStart(2, '0')}`;

  // NTD — Lampiran A3: Sewa 5.000 · Makan 4.380 · Transport 1.320 · Belanja 1.294 · Lainnya 336 + Biaya Transfer 150
  t('expense', 'demo-banknt', 5000, `${oct(1)}T08:00`, 'cat-sewa', 'Sewa kamar');
  t('income', 'demo-banknt', 32000, `${oct(5)}T09:00`, 'cat-gaji', 'Gaji');
  for (let d = 1; d <= 23; d++) {
    t('expense', 'demo-dompet', 35, `${oct(d)}T08:10`, 'cat-transport', 'MRT');
    t('expense', 'demo-dompet', 120, `${oct(d)}T12:30`, 'cat-makan', 'Bento siang', { favoriteId: 'demo-fav-bento' });
    if (d % 2 === 0 && d <= 20) t('expense', 'demo-dompet', 150, `${oct(d)}T19:00`, 'cat-makan', 'Makan malam');
  }
  t('expense', 'demo-dompet', 240, `${oct(11)}T10:00`, 'cat-transport', 'Kereta TRA');
  t('expense', 'demo-dompet', 240, `${oct(18)}T17:00`, 'cat-transport', 'Kereta TRA');
  t('expense', 'demo-banknt', 404, `${oct(8)}T18:30`, 'cat-belanja', 'PX Mart');
  t('expense', 'demo-dompet', 336, `${oct(12)}T15:00`, 'cat-lainnya-out', 'Potong rambut');
  t('expense', 'demo-banknt', 404, `${oct(16)}T18:30`, 'cat-belanja', 'PX Mart');
  const transfer = t('transfer', 'demo-banknt', 5000, `${oct(23)}T10:00`, undefined, 'Kirim ke rumah', { toAccountId: 'demo-bca', toAmount: R(2_550_000), fxRate: 510 });
  t('expense', 'demo-banknt', 150, `${oct(23)}T10:00`, SYSTEM_CATEGORY.transferFee, 'Biaya transfer', { linkedTransactionId: transfer.id });
  t('expense', 'demo-banknt', 486, `${oct(23)}T18:40`, 'cat-belanja', 'PX Mart');
  t('expense', 'demo-dompet', 35, `${oct(24)}T08:10`, 'cat-transport', 'MRT', { favoriteId: 'demo-fav-mrt' });
  t('expense', 'demo-dompet', 120, `${oct(24)}T12:30`, 'cat-makan', 'Bento siang', { favoriteId: 'demo-fav-bento' });

  // IDR — Hiburan 530.000 · Belanja Harian 450.000 · Pulsa & Internet 100.000
  t('expense', 'demo-bca', 300_000, `${oct(7)}T20:00`, 'cat-hiburan', 'Konser online');
  t('expense', 'demo-bca', 450_000, `${oct(9)}T13:00`, 'cat-belanja', 'Belanja online');
  t('expense', 'demo-bca', 230_000, `${oct(14)}T21:00`, 'cat-hiburan', 'Game');
  t('expense', 'demo-bca', 100_000, `${oct(23)}T12:00`, 'cat-pulsa', 'Paket data');
  t('adjustment', 'demo-seabank', 420, `${oct(21)}T09:00`, undefined, 'Penyesuaian saldo', { adjustmentSource: 'manual' });

  // Opening balances (30 Sep) chosen so the 24 Okt balances match Lampiran A1.
  const target: Record<string, number> = {
    'demo-bca': R(8_450_000), 'demo-seabank': R(14_600_000), 'demo-jago': R(9_125_000), 'demo-dompet': R(3_600), 'demo-banknt': R(21_000),
  };
  for (const a of accounts) {
    const flows = txs.reduce((s, x) => s + effectsOf(x).filter((e) => e.accountId === a.id).reduce((p, e) => p + e.delta, 0), 0);
    a.openingBalance = target[a.id] - flows;
    if (!a.interest) continue;
    // interest depends on the opening balance, so refine it a few times
    for (let i = 0; i < 4; i++) {
      const r = accrue(a, txs.filter((x) => x.accountId === a.id), '2026-10-24')!;
      const earned = r.add.reduce((s, x) => s + x.amount, 0);
      a.openingBalance = Math.round((target[a.id] - flows - earned) / 100) * 100;
    }
  }

  const budgets: Budget[] = [
    { id: uid(), scope: 'total', currency: 'NTD', amount: R(15_000), recurring: true, lastAlert80: '2026-10' },
    { id: uid(), scope: 'total', currency: 'IDR', amount: R(2_000_000), recurring: true },
    { id: uid(), scope: 'category', categoryId: 'cat-makan', currency: 'NTD', amount: R(6_000), recurring: true },
    { id: uid(), scope: 'category', categoryId: 'cat-transport', currency: 'NTD', amount: R(1_500), recurring: true, lastAlert80: '2026-10' },
    { id: uid(), scope: 'category', categoryId: 'cat-hiburan', currency: 'IDR', amount: R(500_000), recurring: true, lastAlert80: '2026-10', lastAlert100: '2026-10' },
    { id: uid(), scope: 'category', categoryId: 'cat-belanja', currency: 'IDR', amount: R(1_000_000), recurring: true },
  ];

  const favorites: Favorite[] = [
    { id: 'demo-fav-bento', label: 'Bento', type: 'expense', amount: R(120), accountId: 'demo-dompet', categoryId: 'cat-makan', note: 'Bento siang', sortOrder: 0 },
    { id: 'demo-fav-mrt', label: 'MRT', type: 'expense', amount: R(35), accountId: 'demo-dompet', categoryId: 'cat-transport', note: 'MRT', sortOrder: 1 },
    { id: 'demo-fav-kopi', label: 'Kopi', type: 'expense', amount: R(65), accountId: 'demo-dompet', categoryId: 'cat-makan', note: 'Kopi', sortOrder: 2 },
    { id: 'demo-fav-pxmart', label: 'PX Mart', type: 'expense', accountId: 'demo-banknt', categoryId: 'cat-belanja', note: 'PX Mart', sortOrder: 3 },
  ];

  const allTables = [db.accounts, db.transactions, db.categories, db.budgets, db.favorites, db.fxRates, db.settings];
  await db.transaction('rw', allTables, async () => {
    for (const tb of allTables) await tb.clear();
    await db.categories.bulkAdd(defaultCategories());
    await db.accounts.bulkAdd(accounts);
    await db.transactions.bulkAdd(txs);
    await db.budgets.bulkAdd(budgets);
    await db.favorites.bulkAdd(favorites);
    await db.fxRates.add({ id: uid(), base: 'NTD', quote: 'IDR', rate: 512, source: 'manual', updatedAt: '2026-10-24T07:00' });
    await db.settings.put({ ...defaultSettings(), onboarded: true, lastAccountId: 'demo-dompet', lastBackupAt: '2026-10-22T21:00' });
  });
  await runAccrual();
}

