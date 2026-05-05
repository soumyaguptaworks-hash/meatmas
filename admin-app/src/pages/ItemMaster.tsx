import { useState } from 'react';
import { Plus, Search, Package, PackageCheck, PackageX, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const INITIAL_ITEMS = [
  { id: '1',  code: 'BEEF-001', name: 'Beef Tenderloin',  category: 'Beef',    unit: 'kg',  price: 1200, active: true },
  { id: '2',  code: 'BEEF-002', name: 'Beef Mince',       category: 'Beef',    unit: 'kg',  price: 550,  active: true },
  { id: '3',  code: 'CHKN-001', name: 'Whole Chicken',    category: 'Chicken', unit: 'pcs', price: 320,  active: true },
  { id: '4',  code: 'CHKN-002', name: 'Chicken Breast',   category: 'Chicken', unit: 'kg',  price: 320,  active: true },
  { id: '5',  code: 'CHKN-003', name: 'Chicken Wings',    category: 'Chicken', unit: 'kg',  price: 160,  active: true },
  { id: '6',  code: 'LAMB-001', name: 'Lamb Shoulder',    category: 'Lamb',    unit: 'kg',  price: 950,  active: true },
  { id: '7',  code: 'LAMB-002', name: 'Lamb Chops',       category: 'Lamb',    unit: 'kg',  price: 1100, active: true },
  { id: '8',  code: 'MUTT-001', name: 'Mutton Leg',       category: 'Mutton',  unit: 'kg',  price: 780,  active: true },
  { id: '9',  code: 'MUTT-002', name: 'Mutton Chops',     category: 'Mutton',  unit: 'kg',  price: 820,  active: true },
  { id: '10', code: 'PORK-001', name: 'Pork Belly',       category: 'Pork',    unit: 'kg',  price: 480,  active: false },
  { id: '11', code: 'PORK-002', name: 'Pork Ribs',        category: 'Pork',    unit: 'kg',  price: 520,  active: true },
  { id: '12', code: 'OTHR-001', name: 'Eggs (Tray)',      category: 'Other',   unit: 'tray',price: 120,  active: true },
];

const CATEGORY_COLORS: Record<string, string> = {
  Beef:    'bg-red-100 text-red-700',
  Chicken: 'bg-amber-100 text-amber-700',
  Lamb:    'bg-violet-100 text-violet-700',
  Mutton:  'bg-orange-100 text-orange-700',
  Pork:    'bg-pink-100 text-pink-700',
  Other:   'bg-gray-100 text-gray-600',
};

const ALL_CATEGORIES = ['All', 'Beef', 'Chicken', 'Lamb', 'Mutton', 'Pork', 'Other'];

type Item = typeof INITIAL_ITEMS[number];
interface AddItemForm { code: string; name: string; category: string; unit: string; price: string; }
const EMPTY_FORM: AddItemForm = { code: '', name: '', category: 'Beef', unit: 'kg', price: '' };

export function ItemMaster() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddItemForm>(EMPTY_FORM);

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || i.category === category;
    return matchSearch && matchCategory;
  });

  const activeCount   = items.filter((i) => i.active).length;
  const inactiveCount = items.filter((i) => !i.active).length;

  function handleAdd() {
    if (!form.name || !form.code) return;
    const newItem: Item = {
      id: String(Date.now()),
      code: form.code.toUpperCase(),
      name: form.name,
      category: form.category,
      unit: form.unit,
      price: Number(form.price) || 0,
      active: true,
    };
    setItems((prev) => [...prev, newItem]);
    setForm(EMPTY_FORM);
    setShowModal(false);
  }

  function toggleActive(id: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, active: !i.active } : i));
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setShowModal(true)} className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Items',  value: items.length,  icon: Package,      bg: 'bg-blue-50',    color: 'text-blue-500' },
          { label: 'Active',       value: activeCount,   icon: PackageCheck, bg: 'bg-emerald-50', color: 'text-emerald-500' },
          { label: 'Inactive',     value: inactiveCount, icon: PackageX,     bg: 'bg-gray-50',    color: 'text-gray-400' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <Card key={label} className="flex items-center gap-4 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Category tabs + search */}
      <Card className="p-4 space-y-3">
        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className={`ml-1.5 ${category === cat ? 'opacity-70' : 'opacity-50'}`}>
                  ({items.filter((i) => i.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
            />
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Code', 'Name', 'Category', 'Unit', 'Price (₹)', 'Status', 'Actions'].map((h, i) => (
                <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-5 py-4 font-mono text-xs font-medium text-gray-400">{item.code}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <span className="font-semibold text-gray-800">{item.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.category}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500">{item.unit}</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-800">
                  ₹{item.price.toLocaleString('en-IN')}
                </td>
                <td className="px-5 py-4 text-right">
                  <Badge variant={item.active ? 'success' : 'secondary'}>
                    {item.active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
                    <Button
                      variant="ghost" size="sm"
                      className={`h-7 text-xs ${item.active ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      onClick={() => toggleActive(item.id)}
                    >
                      {item.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Package className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No items found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or category filter.</p>
          </div>
        )}
      </Card>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Add New Item</h3>
                <p className="text-xs text-gray-400 mt-0.5">Add a product to your catalog</p>
              </div>
              <button onClick={() => setShowModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Item Code</label>
                  <input type="text" placeholder="e.g. BEEF-003"
                    value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-gray-700 bg-white"
                  >
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="g">g</option>
                    <option value="tray">tray</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Item Name</label>
                <input type="text" placeholder="e.g. Beef Brisket"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-gray-700 bg-white"
                  >
                    {ALL_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Price (₹)</label>
                  <input type="number" placeholder="0"
                    value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-1.5" /> Add Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
