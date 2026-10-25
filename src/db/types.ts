// Data model — mirrors PRD.md §9. All amounts are integers in minor units ×100.

export type Currency = 'IDR' | 'NTD';
export const CURRENCIES: Currency[] = ['IDR', 'NTD'];

export type AccountType = 'bank' | 'cash' | 'ewallet';

export interface InterestConfig {
  enabled: boolean;
  payout: 'daily' | 'monthly';
  rateHistory: { rate: number; from: string }[]; // % per year, valid from day (YYYY-MM-DD)
  taxPercent: number;
  taxThreshold: number; // tax applies only when the day's balance is above this
  startDate: string; // no interest before this day
  lastAccruedDate?: string;
  carry: number; // rounding remainder carried to the next posting (minor units, fractional)
  pending: number; // monthly payout: accrued but not yet posted (minor units, fractional)
  dirtyFrom?: string; // set when history changed before lastAccruedDate → full recompute
}

export interface Account {
  id: string;
  name: string;
  currency: Currency;
  type: AccountType;
  openingBalance: number;
  color: string;
  icon: string;
  sortOrder: number;
  archived: boolean;
  lastReconciledAt?: string; // day
  interest?: InterestConfig;
  createdAt: string;
}

export type TxType = 'expense' | 'income' | 'transfer' | 'interest' | 'adjustment' | 'debt';

export interface Transaction {
  id: string;
  type: TxType;
  accountId: string;
  toAccountId?: string; // transfer
  amount: number; // positive; adjustment may be negative
  toAmount?: number; // transfer: amount received in the destination currency
  fxRate?: number; // transfer between currencies: destination units per source unit
  categoryId?: string;
  date: string; // YYYY-MM-DDTHH:mm (local)
  note?: string;
  linkedTransactionId?: string; // transfer fee → parent transfer
  favoriteId?: string;
  adjustmentSource?: 'manual' | 'cash_count';
  isAuto: boolean;
  isManuallyEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  kind: 'expense' | 'income';
  icon: string;
  color: string;
  sortOrder: number;
  archived: boolean;
  isSystem: boolean;
}

export interface Budget {
  id: string;
  scope: 'total' | 'category';
  categoryId?: string;
  currency: Currency;
  amount: number;
  month?: string; // set → only that month; unset → every month
  recurring: boolean;
  lastAlert80?: string; // month the 80% alert was shown
  lastAlert100?: string;
}

export interface Favorite {
  id: string;
  label: string;
  type: 'expense' | 'income';
  amount?: number;
  accountId: string;
  categoryId: string;
  note?: string;
  sortOrder: number;
}

export interface FxRate {
  id: string;
  base: 'NTD';
  quote: 'IDR';
  rate: number; // IDR per 1 NTD
  source: 'manual' | 'auto';
  updatedAt: string; // moment
}

export interface Settings {
  id: 'app';
  onboarded: boolean;
  primaryCurrency: Currency;
  theme: 'system' | 'light' | 'dark';
  favoriteOneTap: boolean;
  lastAccountId?: string;
  lastCategoryByType?: Partial<Record<'expense' | 'income', string>>;
  lastBackupAt?: string; // moment
}

export const SYSTEM_CATEGORY = { interest: 'cat-bunga', transferFee: 'cat-biaya-transfer' } as const;
