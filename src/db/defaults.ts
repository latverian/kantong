import type { Category, Settings } from './types';
import { SYSTEM_CATEGORY } from './types';

// Default categories (PRD F7). Icons are lucide icon keys resolved in components/CategoryIcon.
const expense: [string, string, string, string][] = [
  ['cat-makan', 'Makan & Minum', 'utensils', '#D97706'],
  ['cat-belanja', 'Belanja Harian', 'shopping-bag', '#DB2777'],
  ['cat-transport', 'Transportasi', 'tram-front', '#0284C7'],
  ['cat-sewa', 'Tempat Tinggal / Sewa', 'house', '#7C3AED'],
  ['cat-tagihan', 'Tagihan & Utilitas', 'receipt', '#CA8A04'],
  ['cat-pulsa', 'Pulsa & Internet', 'wifi', '#0891B2'],
  ['cat-kesehatan', 'Kesehatan', 'heart-pulse', '#16A34A'],
  ['cat-hiburan', 'Hiburan', 'gamepad-2', '#9333EA'],
  ['cat-pakaian', 'Pakaian', 'shirt', '#E11D48'],
  ['cat-keluarga', 'Kirim ke Keluarga', 'hand-heart', '#2563EB'],
  [SYSTEM_CATEGORY.transferFee, 'Biaya Transfer', 'arrow-left-right', '#64748B'],
  ['cat-lainnya-out', 'Lainnya', 'ellipsis', '#64748B'],
];

const income: [string, string, string, string][] = [
  ['cat-gaji', 'Gaji', 'banknote', '#15803D'],
  ['cat-bonus', 'Bonus / Lembur', 'sparkles', '#0D9488'],
  [SYSTEM_CATEGORY.interest, 'Bunga Tabungan', 'percent', '#047857'],
  ['cat-hadiah', 'Hadiah', 'gift', '#DB2777'],
  ['cat-penjualan', 'Penjualan', 'tag', '#CA8A04'],
  ['cat-lainnya-in', 'Lainnya', 'ellipsis', '#64748B'],
];

const systemIds = new Set<string>(Object.values(SYSTEM_CATEGORY));

export const defaultCategories = (): Category[] => [
  ...expense.map(([id, name, icon, color], i) => ({ id, name, icon, color, kind: 'expense' as const, sortOrder: i, archived: false, isSystem: systemIds.has(id) })),
  ...income.map(([id, name, icon, color], i) => ({ id, name, icon, color, kind: 'income' as const, sortOrder: i, archived: false, isSystem: systemIds.has(id) })),
];

export const defaultSettings = (): Settings => ({
  id: 'app',
  onboarded: false,
  primaryCurrency: 'IDR',
  theme: 'system',
  favoriteOneTap: true,
});

export const ACCOUNT_COLORS = ['#0369A1', '#047857', '#2563EB', '#7C3AED', '#D97706', '#EA580C', '#E11D48', '#475569'];

/** Default interest config values per currency (PRD F5). */
export const interestDefaults = (currency: 'IDR' | 'NTD') =>
  currency === 'IDR'
    ? { payout: 'daily' as const, taxPercent: 20, taxThreshold: 7_500_000 * 100 }
    : { payout: 'monthly' as const, taxPercent: 0, taxThreshold: 0 };
