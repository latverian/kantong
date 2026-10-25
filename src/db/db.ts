import Dexie, { type EntityTable } from 'dexie';
import type { Account, Budget, Category, Favorite, FxRate, Settings, Transaction } from './types';

export class KantongDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  budgets!: EntityTable<Budget, 'id'>;
  favorites!: EntityTable<Favorite, 'id'>;
  fxRates!: EntityTable<FxRate, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor(name = 'kantong') {
    super(name);
    this.version(1).stores({
      accounts: 'id, currency, sortOrder',
      transactions: 'id, date, accountId, toAccountId, type, categoryId, linkedTransactionId',
      categories: 'id, kind, sortOrder',
      budgets: 'id, scope, currency, categoryId',
      favorites: 'id, sortOrder',
      fxRates: 'id, updatedAt',
      settings: 'id',
    });
  }
}

export const db = new KantongDB();

/**
 * Random v4 UUID. crypto.randomUUID() exists only in secure contexts (HTTPS / localhost),
 * so on plain http (e.g. testing over Wi-Fi) fall back to getRandomValues, which works everywhere.
 */
export function uid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
