import type { Currency } from '../db/types';

// Amounts are stored as integers in minor units ×100 (PRD §9): Rp1.280 → 128000.
export const MINOR = 100;

export const PREFIX: Record<Currency, string> = { IDR: 'Rp', NTD: 'NT$' };

const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

export const toMinor = (units: number) => Math.round(units * MINOR);
export const toUnits = (minor: number) => Math.round(minor / MINOR);

export const MINUS = '−';

/** "Rp1.250.000" / "NT$1.250". sign: 'auto' shows − for negatives, '+'/'-' force a sign. */
export function formatMoney(
  minor: number,
  currency: Currency,
  opts: { sign?: 'auto' | '+' | '-' | 'none'; hidden?: boolean; approx?: boolean } = {},
): string {
  const { sign = 'auto', hidden = false, approx = false } = opts;
  const units = Math.abs(toUnits(minor));
  const body = hidden ? '•••••' : nf.format(units);
  let s = '';
  if (sign === '+') s = '+';
  else if (sign === '-') s = MINUS;
  else if (sign === 'auto' && toUnits(minor) < 0) s = MINUS;
  return `${approx ? '≈ ' : ''}${s}${PREFIX[currency]}${body}`;
}

export const formatNumber = (n: number) => nf.format(n);

const df = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
/** Rates and percentages keep up to 2 decimals: 3,5 · 512,35 */
export const formatDecimal = (n: number) => df.format(n);
/** Value for an editable decimal field: 3.5 → "3,5" */
export const decimalInputValue = (n: number) => String(n).replace('.', ',');

/** Digits typed on the keypad ("1250000") → minor units. */
export const digitsToMinor = (digits: string) => (digits ? toMinor(Number(digits)) : 0);
export const minorToDigits = (minor: number) => (minor ? String(Math.abs(toUnits(minor))) : '');

/** Parses user text like "1.250.000" or "1250000" into minor units. */
export function parseMoneyInput(text: string): number {
  const digits = text.replace(/[^\d]/g, '');
  return digitsToMinor(digits);
}

/** Floor percentage used for progress (PRD §6.3): 99.6% shows 99%. */
export const floorPercent = (part: number, whole: number) => (whole > 0 ? Math.floor((part / whole) * 100) : 0);
