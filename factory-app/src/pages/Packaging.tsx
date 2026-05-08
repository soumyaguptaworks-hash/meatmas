import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Plus, X, BoxSelect, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  factoryApi,
  type PackagingOrder,
  type PackagingStatus,
  type CreatePackagingBody,
} from '@/api/factory.api';

const STATUS_TABS: { label: string; value: PackagingStatus | 'ALL' }[] = [
  { label: 'All',         value: 'ALL' },
  { label: 'Pending',     value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed',   value: 'COMPLETED' },
  { label: 'Cancelled',   value: 'CANCELLED' },
];

const STATUS_CONFIG: Record<PackagingStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'secondary'; dot: string }> = {
  PENDING:     { label: 'Pending',     variant: 'warning',   dot: 'bg-amber-500' },
  IN_PROGRESS: { label: 'In Progress', variant: 'info',      dot: 'bg-blue-500' },
  COMPLETED:   { label: 'Completed',   variant: 'success',   dot: 'bg-emerald-500' },
  CANCELLED:   { label: 'Cancelled',   variant: 'secondary', dot: 'bg-slate-400' },
};

const UNITS = ['kg', 'g', 'pcs', 'litres'] as const;

// ─── Create Packaging Modal ────────────────────────────────────────────────

interface CreatePackagingModalProps {
  onClose: () => void;
  onCreated: (order: PackagingOrder) => void;
}

function CreatePackagingModal({ onClose, onCreated }: CreatePackagingModalProps) {
  const [form, setForm] = useState<CreatePackagingBody>({
    inputItem: '',
    inputQuantity: 0,
    inputUnit: 'kg',
    outputSku: '',
    packSize: 500,
    packsProduced: 0,
    packagingMaterial: '',
    wastageCount: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof CreatePackagingBody>(key: K, val: CreatePackagingBody[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.inputItem.trim()) { setError('Input item is required.'); return; }
    if (!form.inputQuantity || form.inputQuantity <= 0) { setError('Input quantity must be > 0.'); return; }
    if (!form.outputSku.trim()) { setError('Output SKU is required.'); return; }
    if (!form.packSize || form.packSize <= 0) { setError('Pack size must be > 0.'); return; }
    if (!form.packagingMaterial.trim()) { setError('Packaging material is required.'); return; }

    setError('');
    setSaving(true);
    try {
      const { data } = await factoryApi.createPackaging(form);
      onCreated(data);
      onClose();
    } catch {
      setError('Failed to create packaging order. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-base">New Packaging Order</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[72vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {/* Input Item */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Input Item
            </label>
            <Input
              placeholder="e.g. Boneless Chicken"
              value={form.inputItem}
              onChange={(e) => set('inputItem', e.target.value)}
            />
          </div>

          {/* Input Qty + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Input Quantity
              </label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.inputQuantity || ''}
                onChange={(e) => set('inputQuantity', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Unit
              </label>
              <div className="relative">
                <select
                  value={form.inputUnit}
                  onChange={(e) => set('inputUnit', e.target.value)}
                  className="w-full appearance-none rounded-xl border bg-background px-3 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Output SKU */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Output SKU
            </label>
            <Input
              placeholder="e.g. CHK-500G"
              value={form.outputSku}
              onChange={(e) => set('outputSku', e.target.value)}
            />
          </div>

          {/* Pack Size + Packs Produced */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Pack Size (g)
              </label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="500"
                value={form.packSize || ''}
                onChange={(e) => set('packSize', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Packs Produced
              </label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.packsProduced || ''}
                onChange={(e) => set('packsProduced', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Packaging Material */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Packaging Material
            </label>
            <Input
              placeholder="e.g. Vacuum Bag, Tray + Cling Film"
              value={form.packagingMaterial}
              onChange={(e) => set('packagingMaterial', e.target.value)}
            />
          </div>

          {/* Wastage Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Wastage Count
            </label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={form.wastageCount || ''}
              onChange={(e) => set('wastageCount', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={saving} onClick={handleSubmit}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function Packaging() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PackagingStatus | 'ALL'>('ALL');
  const [orders, setOrders] = useState<PackagingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    factoryApi
      .getPackaging(activeTab)
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Could not load packaging orders.'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  function handleCreated(newOrder: PackagingOrder) {
    setOrders((prev) => [newOrder, ...prev]);
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Filter chips */}
      <div className="px-4 pt-4 pb-3 bg-background border-b">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {STATUS_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-3 space-y-3 pb-24">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BoxSelect className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">No packaging orders found</p>
          </div>
        )}

        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, variant: 'secondary' as const, dot: 'bg-slate-400' };

          return (
            <Card key={order.id} className="cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/packaging/${order.id}`, { state: { order } })}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot} shrink-0`} />
                      <p className="font-semibold text-sm truncate">{order.outputSku}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 pl-4">
                      #{order.orderNumber}
                    </p>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Input:{' '}
                    <span className="font-medium text-foreground">
                      {order.inputItem}
                    </span>
                  </span>
                  <span>
                    Qty:{' '}
                    <span className="font-medium text-foreground">
                      {order.inputQuantity} {order.inputUnit}
                    </span>
                  </span>
                  <span>
                    Pack size:{' '}
                    <span className="font-medium text-foreground">{order.packSize}g</span>
                  </span>
                  <span>
                    Packs:{' '}
                    <span className="font-medium text-foreground">{order.packsProduced}</span>
                  </span>
                  <span>
                    Material:{' '}
                    <span className="font-medium text-foreground">{order.packagingMaterial}</span>
                  </span>
                  <span>
                    Wastage:{' '}
                    <span className={`font-medium ${order.wastageCount > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                      {order.wastageCount}
                    </span>
                  </span>
                </div>

                <p className="text-[10px] text-muted-foreground">
                  By {order.performedBy} ·{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </CardContent>
            </Card>
          );
        })}

        <div className="h-2" />
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="absolute bottom-6 right-4 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 shadow-lg active:scale-95 transition-transform min-h-[48px]"
        aria-label="Create packaging order"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">New Order</span>
      </button>

      {showCreate && (
        <CreatePackagingModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
