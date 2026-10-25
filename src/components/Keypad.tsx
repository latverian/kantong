import { Delete } from 'lucide-react';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'] as const;
const MAX_DIGITS = 13;

/** Custom numeric keypad (DESIGN.md › Add Transaction). Works on a string of whole-unit digits. */
export function Keypad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const press = (k: (typeof KEYS)[number]) => {
    if (k === 'del') return onChange(value.slice(0, -1));
    const next = (value + k).replace(/^0+/, '');
    if (next.length <= MAX_DIGITS) onChange(next);
  };
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          aria-label={k === 'del' ? 'Hapus' : k}
          onClick={() => press(k)}
          className="t-amount-lg flex h-14 items-center justify-center rounded-xl bg-surface text-ink active:bg-muted"
        >
          {k === 'del' ? <Delete size={24} strokeWidth={1.75} /> : k}
        </button>
      ))}
    </div>
  );
}
