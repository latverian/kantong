import { ChartColumn, House, Plus, ReceiptText, Wallet } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from './ui';

const tabs = [
  { to: '/', label: 'Beranda', icon: House, end: true },
  { to: '/transaksi', label: 'Transaksi', icon: ReceiptText },
  null,
  { to: '/rekening', label: 'Rekening', icon: Wallet },
  { to: '/laporan', label: 'Laporan', icon: ChartColumn },
];

/** Bottom tab bar with the raised ink "+" button in the middle (DESIGN.md › Layout). */
export function TabBar() {
  const navigate = useNavigate();
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-outline bg-surface/90 backdrop-blur-md">
      <div className="grid h-[58px] grid-cols-5 items-center">
        {tabs.map((t) =>
          t ? (
            <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 text-[11px] font-semibold', isActive ? 'text-ink' : 'text-sub')}>
              {({ isActive }) => (
                <>
                  <t.icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                  {t.label}
                </>
              )}
            </NavLink>
          ) : (
            <div key="add" className="flex justify-center">
              <button
                aria-label="Tambah transaksi"
                onClick={() => navigate('/tambah')}
                className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_8px_24px_rgba(15,23,42,0.18)] active:scale-95"
              >
                <Plus size={28} strokeWidth={2.25} />
              </button>
            </div>
          ),
        )}
      </div>
    </nav>
  );
}
