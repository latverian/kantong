import { Archive, Plus } from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_ICON_CHOICES, CategoryTile, ICONS } from '../components/icons';
import { TextInput } from '../components/inputs';
import { Sheet } from '../components/Sheet';
import { Badge, Button, Group, Row, ScreenHeader, Segmented, cn } from '../components/ui';
import type { Category } from '../db/types';
import { saveCategory, setCategoryArchived } from '../lib/ops';
import { useData } from '../state/data';

const COLORS = ['#D97706', '#DB2777', '#0284C7', '#7C3AED', '#CA8A04', '#0891B2', '#16A34A', '#9333EA', '#E11D48', '#2563EB', '#0D9488', '#64748B'];

export function Categories() {
  const d = useData();
  const [kind, setKind] = useState<Category['kind']>('expense');
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const list = d.categories.filter((c) => c.kind === kind);

  return (
    <main className="pb-16">
      <ScreenHeader title="Kategori" back="/pengaturan">
        <Segmented value={kind} onChange={setKind} options={[{ value: 'expense', label: 'Pengeluaran' }, { value: 'income', label: 'Pemasukan' }]} />
      </ScreenHeader>
      <div className="space-y-4 px-4 pt-4">
        <Group footer="Kategori dipakai bersama untuk IDR dan NTD. Kategori sistem tidak bisa diarsipkan.">
          {list.map((c) => (
            <Row
              key={c.id}
              className={c.archived ? 'opacity-50' : ''}
              left={<CategoryTile category={c} />}
              title={c.name}
              right={c.isSystem ? <Badge>Sistem</Badge> : c.archived ? <Badge>Diarsipkan</Badge> : undefined}
              chevron
              onClick={() => setEditing(c)}
            />
          ))}
        </Group>
        <Button variant="secondary" onClick={() => setEditing({ kind, icon: 'tag', color: COLORS[0], name: '' })}>
          <Plus size={18} /> Tambah kategori
        </Button>
      </div>
      {editing && <CategorySheet value={editing} onClose={() => setEditing(null)} />}
    </main>
  );
}

function CategorySheet({ value, onClose }: { value: Partial<Category>; onClose: () => void }) {
  const [name, setName] = useState(value.name ?? '');
  const [icon, setIcon] = useState(value.icon ?? 'tag');
  const [color, setColor] = useState(value.color ?? COLORS[0]);
  const save = async () => {
    if (!name.trim()) return;
    await saveCategory({ id: value.id, name: name.trim(), icon, color, kind: value.kind ?? 'expense' });
    onClose();
  };
  return (
    <Sheet
      open
      onClose={onClose}
      title={value.id ? 'Edit kategori' : 'Kategori baru'}
      footer={
        <div className="space-y-2">
          <Button disabled={!name.trim()} onClick={save}>
            Simpan
          </Button>
          {value.id && !value.isSystem && (
            <Button
              variant="ghost"
              onClick={async () => {
                await setCategoryArchived(value.id!, !value.archived);
                onClose();
              }}
            >
              <Archive size={18} /> {value.archived ? 'Aktifkan lagi' : 'Arsipkan'}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CategoryTile category={{ icon, color } as Category} size={48} />
          <TextInput value={name} onChange={setName} placeholder="Nama kategori" autoFocus={!value.id} />
        </div>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button key={c} aria-label={`Warna ${c}`} onClick={() => setColor(c)} className={cn('h-8 w-8 rounded-full', color === c && 'ring-2 ring-ink ring-offset-2 ring-offset-surface')} style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {CATEGORY_ICON_CHOICES.map((k) => {
            const Icon = ICONS[k];
            return (
              <button key={k} aria-label={k} onClick={() => setIcon(k)} className={cn('flex aspect-square items-center justify-center rounded-xl', icon === k ? 'ring-2 ring-ink' : '')} style={{ backgroundColor: `${color}26`, color }}>
                <Icon size={20} strokeWidth={1.75} />
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
