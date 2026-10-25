// Dates are kept as local, timezone-free strings: day "YYYY-MM-DD", moment "YYYY-MM-DDTHH:mm".
// Day boundaries follow the phone's local time (PRD §6.3).

const pad = (n: number) => String(n).padStart(2, '0');

export const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const dayKeyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const momentOf = (d: Date) => `${dayKeyOf(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const todayKey = () => dayKeyOf(new Date());
export const nowMoment = () => momentOf(new Date());

export const dayOf = (moment: string) => moment.slice(0, 10);
export const monthOf = (dayOrMoment: string) => dayOrMoment.slice(0, 7);
export const timeOf = (moment: string) => moment.slice(11, 16);

const toUTC = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const fromUTC = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export function addDays(day: string, n: number): string {
  const d = toUTC(day);
  d.setUTCDate(d.getUTCDate() + n);
  return fromUTC(d);
}

export const diffDays = (from: string, to: string) => Math.round((toUTC(to).getTime() - toUTC(from).getTime()) / 86_400_000);

export function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export const lastDayOfMonth = (month: string) => `${month}-${pad(daysInMonth(month))}`;
export const isLastDayOfMonth = (day: string) => day === lastDayOfMonth(monthOf(day));

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export const weekdayOf = (day: string) => DAYS[toUTC(day).getUTCDay()];

/** "Sabtu, 24 Okt 2026" */
export function formatLongDate(day: string): string {
  const d = toUTC(day);
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Sabtu, 24 Okt" */
export function formatShortDate(day: string): string {
  const d = toUTC(day);
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}

/** "24 Okt" */
export function formatDayMonth(day: string): string {
  const d = toUTC(day);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}

/** "Oktober 2026" */
export function formatMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** Date header in lists: "Hari ini", "Kemarin, Jumat 23 Okt", "Selasa, 20 Okt". */
export function formatDayHeader(day: string, today = todayKey()): string {
  if (day === today) return 'Hari ini';
  if (day === addDays(today, -1)) return `Kemarin, ${weekdayOf(day)} ${formatDayMonth(day)}`;
  return formatShortDate(day);
}

/** "Hari ini, 12:30" / "Kemarin, 18:40" / "Selasa, 20 Okt · 14:15" */
export function formatMoment(moment: string, today = todayKey()): string {
  const day = dayOf(moment);
  const time = timeOf(moment);
  if (day === today) return `Hari ini, ${time}`;
  if (day === addDays(today, -1)) return `Kemarin, ${time}`;
  return `${formatShortDate(day)} · ${time}`;
}

/** "3 hari lalu" / "hari ini" / "kemarin" */
export function formatAgo(day: string, today = todayKey()): string {
  const n = diffDays(day, today);
  if (n <= 0) return 'hari ini';
  if (n === 1) return 'kemarin';
  return `${n} hari lalu`;
}
