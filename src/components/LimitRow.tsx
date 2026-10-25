import type { Currency } from '../db/types';
import type { LimitStatus } from '../lib/limits';
import { formatMoney } from '../lib/money';
import { CurrencyBadge, Money, Progress, toneText, cn } from './ui';

/** Caption under a limit/budget bar: "Sisa NT$2.520 · NT$315/hari" or "Lewat Rp30.000". */
export function limitCaption(s: LimitStatus, currency: Currency, withPace = false): string {
  if (s.remaining < 0) return `Lewat ${formatMoney(-s.remaining, currency)}`;
  const base = s.daysLeft > 0 ? `Sisa ${formatMoney(s.remaining, currency)} · ${formatMoney(s.perDay, currency)}/hari` : `Sisa ${formatMoney(s.remaining, currency)}`;
  if (!withPace || s.daysLeft === 0) return base;
  return `${base} · ${s.aheadOfPace ? 'di atas jadwal' : 'lebih hemat dari jadwal'}`;
}

/** Compact row used in the Beranda "Batas bulan ini" card. */
export function LimitRow({ currency, s }: { currency: Currency; s: LimitStatus }) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-2">
        <CurrencyBadge currency={currency} />
        <span className="t-body-sm flex-1 text-sub">Pengeluaran {currency}</span>
        <span className={cn('t-amount-md', toneText[s.tone])}>{s.percent}%</span>
      </div>
      <p className="mt-1">
        <Money value={s.spent} currency={currency} className="t-amount-md text-ink" />
        <span className="t-body-sm text-sub"> / {formatMoney(s.limit, currency)}</span>
      </p>
      <div className="mt-2">
        <Progress percent={s.percent} tone={s.tone} pace={s.pace} />
      </div>
      <p className={cn('t-body-sm mt-2', s.remaining < 0 ? 'text-expense' : 'text-sub')}>{limitCaption(s, currency)}</p>
    </div>
  );
}
