import type { ReactNode } from 'react';

/** Lightweight SVG donut (DESIGN.md › Charts). Slices are drawn clockwise from 12 o'clock. */
export function Donut({ slices, size = 168, thickness = 22, children }: { slices: { value: number; color: string }[]; size?: number; thickness?: number; children?: ReactNode }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-muted)" strokeWidth={thickness} />
        {total > 0 &&
          slices.map((s, i) => {
            const len = (s.value / total) * c;
            const gap = slices.length > 1 ? Math.min(2, len / 2) : 0;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
