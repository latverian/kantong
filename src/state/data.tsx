import { useLiveQuery } from 'dexie-react-hooks';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { db } from '../db/db';
import type { Account, Budget, Category, Favorite, FxRate, Settings, Transaction } from '../db/types';
import type { Snapshot } from '../lib/backup';
import { todayKey } from '../lib/dates';
import { balancesAt } from '../lib/ledger';
import { runAccrual } from '../lib/ops';

export interface AppData {
  accounts: Account[]; // all, sorted
  activeAccounts: Account[]; // not archived
  accountsById: Map<string, Account>;
  txs: Transaction[]; // visible, newest first (zero-amount interest tombstones hidden)
  categories: Category[];
  categoriesById: Map<string, Category>;
  budgets: Budget[];
  favorites: Favorite[];
  settings: Settings;
  fx?: FxRate; // latest NTD→IDR rate
  balances: Map<string, number>;
  today: string;
  snapshot: Snapshot;
}

const Ctx = createContext<AppData | null>(null);

/** Current day; changes at midnight or when the app comes back to the foreground on a new day. */
function useToday() {
  const [today, setToday] = useState(todayKey);
  const ref = useRef(today);
  useEffect(() => {
    const check = () => {
      const k = todayKey();
      if (k === ref.current) return;
      ref.current = k;
      setToday(k);
      void runAccrual(k);
    };
    const id = window.setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  return today;
}

export function DataProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const today = useToday();
  const raw = useLiveQuery(async () => {
    const [accounts, transactions, categories, budgets, favorites, fxRates, settings] = await Promise.all([
      db.accounts.orderBy('sortOrder').toArray(),
      db.transactions.toArray(),
      db.categories.orderBy('sortOrder').toArray(),
      db.budgets.toArray(),
      db.favorites.orderBy('sortOrder').toArray(),
      db.fxRates.orderBy('updatedAt').toArray(),
      db.settings.toArray(),
    ]);
    return { accounts, transactions, categories, budgets, favorites, fxRates, settings };
  }, []);

  const value = useMemo<AppData | null>(() => {
    if (!raw || !raw.settings[0]) return null;
    const { accounts, transactions, categories, budgets, favorites, fxRates, settings } = raw;
    const txs = transactions
      .filter((t) => !(t.type === 'interest' && t.amount === 0))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    return {
      accounts,
      activeAccounts: accounts.filter((a) => !a.archived),
      accountsById: new Map(accounts.map((a) => [a.id, a])),
      txs,
      categories,
      categoriesById: new Map(categories.map((c) => [c.id, c])),
      budgets,
      favorites,
      settings: settings[0],
      fx: fxRates.at(-1),
      balances: balancesAt(accounts, transactions),
      today,
      snapshot: raw as unknown as Snapshot,
    };
  }, [raw, today]);

  if (!value) return <>{fallback}</>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData(): AppData {
  const v = useContext(Ctx);
  if (!v) throw new Error('useData outside DataProvider');
  return v;
}
