import { describe, expect, it } from 'vitest';
import { buildBackup, parseBackup, type Snapshot } from './backup';

const snapshot = (): Snapshot => ({
  accounts: [{ id: 'a1', name: 'BCA', currency: 'IDR', type: 'bank', openingBalance: 100, color: '#000', icon: 'landmark', sortOrder: 0, archived: false, createdAt: '' }],
  transactions: [{ id: 't1', type: 'expense', accountId: 'a1', amount: 500, date: '2026-10-24T12:30', categoryId: 'c1', note: 'Bento', isAuto: false, isManuallyEdited: false, createdAt: '', updatedAt: '' }],
  categories: [{ id: 'c1', name: 'Makan', kind: 'expense', icon: 'utensils', color: '#000', sortOrder: 0, archived: false, isSystem: false }],
  budgets: [],
  favorites: [],
  fxRates: [{ id: 'f1', base: 'NTD', quote: 'IDR', rate: 512, source: 'manual', updatedAt: '2026-10-24T07:00' }],
  settings: [{ id: 'app', onboarded: true, primaryCurrency: 'IDR', theme: 'system', favoriteOneTap: true }],
});

const asText = (mutate: (b: ReturnType<typeof buildBackup>) => void = () => {}) => {
  const b = buildBackup(snapshot());
  mutate(b);
  return JSON.stringify(b);
};

describe('backup validation (never trust input)', () => {
  it('accepts a backup made by the app', () => {
    const { summary } = parseBackup(asText());
    expect(summary).toMatchObject({ accounts: 1, transactions: 1, from: '2026-10-24' });
  });

  it('rejects non-JSON and foreign files', () => {
    expect(() => parseBackup('not json')).toThrow(/JSON/);
    expect(() => parseBackup('{"hello":"world"}')).toThrow(/bukan backup Kantong/);
  });

  it('rejects wrong types, unknown enums and broken references', () => {
    expect(() => parseBackup(asText((b) => ((b.transactions[0] as unknown as Record<string, unknown>).amount = '500')))).toThrow(/transaksi/);
    expect(() => parseBackup(asText((b) => ((b.transactions[0] as unknown as Record<string, unknown>).type = 'steal')))).toThrow(/transaksi/);
    expect(() => parseBackup(asText((b) => (b.transactions[0].accountId = 'ghost')))).toThrow(/transaksi/);
    expect(() => parseBackup(asText((b) => (b.transactions[0].date = '24/10/2026')))).toThrow(/transaksi/);
    expect(() => parseBackup(asText((b) => ((b.accounts[0] as unknown as Record<string, unknown>).currency = 'USD')))).toThrow(/rekening/);
  });

  it('rejects duplicate ids and oversized text', () => {
    expect(() => parseBackup(asText((b) => b.transactions.push({ ...b.transactions[0] })))).toThrow(/id transaksi/);
    expect(() => parseBackup(asText((b) => (b.transactions[0].note = 'x'.repeat(10_000))))).toThrow(/transaksi/);
  });

  it('keeps markup in notes as plain data (React renders it as text)', () => {
    const { data } = parseBackup(asText((b) => (b.transactions[0].note = '<img src=x onerror=alert(1)>')));
    expect(data.transactions[0].note).toBe('<img src=x onerror=alert(1)>');
  });
});
