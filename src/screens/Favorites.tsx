import { ChevronDown, ChevronUp, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { AccountTile, CategoryTile } from '../components/icons';
import { MoneyInput, TextInput } from '../components/inputs';
import { AccountPickerSheet, CategoryGrid } from '../components/pickers';
import { Sheet } from '../components/Sheet';
import { Button, CurrencyBadge, EmptyState, ScreenHeader, Segmented } from '../components/ui';
import type { Favorite } from '../db/types';
import { formatMoney } from '../lib/money';
import { deleteFavorite, moveFavorite, saveFavorite } from '../lib/ops';
import { useData } from '../state/data';

export function Favorites() {
  const d = useData();
  const [editing, setEditing] = useState<Partial<Favorite> | null>(null);
  return (
    <main className="pb-16">
      <ScreenHeader title="Favorit" back="/pengaturan" />
      <div className="space-y-4 px-4 pt-4">
        <p className="t-body-sm px-1 text-sub">Favorit muncul sebagai chip di layar Catat Transaksi. Favorit dengan nominal tersimpan dengan sekali tap.</p>
        {d.favorites.length ? (
          <div className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface dark:border-transparent">
            {d.favorites.map((f, i) => {
              const acc = d.accountsById.get(f.accountId);
              return (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => setEditing(f)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <CategoryTile category={d.categoriesById.get(f.categoryId)} />
                    <div className="min-w-0">
                      <p className="t-body truncate font-semibold text-ink">{f.label}</p>
                      <p className="t-body-sm truncate text-sub">
                        {f.amount !== undefined && acc ? formatMoney(f.amount, acc.currency) : 'Nominal diisi saat dipakai'} · {acc?.name ?? 'Rekening dihapus'}
                      </p>
                    </div>
                  </button>
                  <div className="flex flex-col">
                    <button aria-label="Naikkan" disabled={i === 0} onClick={() => moveFavorite(f.id, -1)} className="p-1 text-sub disabled:opacity-30">
                      <ChevronUp size={18} />
                    </button>
                    <button aria-label="Turunkan" disabled={i === d.favorites.length - 1} onClick={() => moveFavorite(f.id, 1)} className="p-1 text-sub disabled:opacity-30">
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={<Star size={40} />} text="Belum ada favorit. Tambahkan pengeluaran yang sering kamu catat, misalnya makan siang atau MRT." />
        )}
        <Button variant="secondary" disabled={!d.activeAccounts.length} onClick={() => setEditing({ type: 'expense', accountId: d.settings.lastAccountId ?? d.activeAccounts[0]?.id })}>
          <Plus size={18} /> Tambah favorit
        </Button>
      </div>
      {editing && <FavoriteSheet value={editing} onClose={() => setEditing(null)} />}
    </main>
  );
}

function FavoriteSheet({ value, onClose }: { value: Partial<Favorite>; onClose: () => void }) {
  const d = useData();
  const [label, setLabel] = useState(value.label ?? '');
  const [type, setType] = useState<Favorite['type']>(value.type ?? 'expense');
  const [amount, setAmount] = useState(value.amount ?? 0);
  const [accountId, setAccountId] = useState(value.accountId ?? d.activeAccounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(value.categoryId ?? '');
  const [picking, setPicking] = useState(false);
  const account = d.accountsById.get(accountId);
  const cats = d.categories.filter((c) => c.kind === type && !c.archived && !c.isSystem);
  const valid = label.trim() && account && cats.some((c) => c.id === categoryId);

  const save = async () => {
    if (!valid) return;
    await saveFavorite({ id: value.id, sortOrder: value.sortOrder, label: label.trim(), type, amount: amount > 0 ? amount : undefined, accountId, categoryId, note: label.trim() });
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={value.id ? 'Edit favorit' : 'Favorit baru'}
      footer={
        <div className="space-y-2">
          <Button disabled={!valid} onClick={save}>
            Simpan
          </Button>
          {value.id && (
            <Button
              variant="ghost"
              className="text-expense"
              onClick={async () => {
                await deleteFavorite(value.id!);
                onClose();
              }}
            >
              Hapus favorit
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <Segmented value={type} onChange={setType} options={[{ value: 'expense', label: 'Pengeluaran' }, { value: 'income', label: 'Pemasukan' }]} />
        <TextInput value={label} onChange={setLabel} placeholder="Nama, mis. Bento" autoFocus={!value.id} />
        <button onClick={() => setPicking(true)} className="flex w-full items-center gap-3 rounded-xl bg-muted px-3 py-2 text-left">
          <AccountTile account={account} size={36} />
          <span className="t-body flex-1 text-ink">{account?.name ?? 'Pilih rekening'}</span>
          {account && <CurrencyBadge currency={account.currency} />}
        </button>
        {account && (
          <div>
            <p className="t-caps mb-2 text-sub">Nominal (kosongkan kalau berubah-ubah)</p>
            <MoneyInput value={amount} onChange={setAmount} currency={account.currency} />
          </div>
        )}
        <div>
          <p className="t-caps mb-2 text-sub">Kategori</p>
          <CategoryGrid categories={cats} value={categoryId} onPick={setCategoryId} />
        </div>
      </div>
      <AccountPickerSheet open={picking} onClose={() => setPicking(false)} title="Rekening" accounts={d.activeAccounts} balances={d.balances} value={accountId} onPick={setAccountId} />
    </Sheet>
  );
}
