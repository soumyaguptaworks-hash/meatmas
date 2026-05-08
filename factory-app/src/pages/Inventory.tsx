import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { factoryApi, type InventoryItem, type StockLevel, type InventoryType } from '@/api/factory.api';

const LEVEL_CONFIG: Record<StockLevel, {
  label: string;
  variant: 'destructive' | 'warning' | 'success' | 'secondary';
  barColor: string;
}> = {
  CRITICAL: { label: 'Critical', variant: 'destructive', barColor: 'bg-red-500' },
  LOW:      { label: 'Low',      variant: 'warning',     barColor: 'bg-amber-500' },
  ADEQUATE: { label: 'OK',       variant: 'success',     barColor: 'bg-emerald-500' },
  EXCESS:   { label: 'Excess',   variant: 'secondary',   barColor: 'bg-blue-400' },
};

const TYPE_TABS: { label: string; value: InventoryType | 'ALL' }[] = [
  { label: 'All',         value: 'ALL' },
  { label: 'Stationary',  value: 'STATIONARY' },
  { label: 'Raw Material', value: 'RAW_MATERIAL' },
  { label: 'Processed',   value: 'PROCESSED' },
  { label: 'Packed',      value: 'PACKED' },
  { label: 'Wastage',     value: 'WASTAGE' },
];

export function Inventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<InventoryType | 'ALL'>('ALL');

  const load = useCallback((type: InventoryType | 'ALL', q: string) => {
    setLoading(true);
    setError('');
    factoryApi
      .getInventory(type === 'ALL' ? undefined : type, q || undefined)
      .then(({ data }) => setItems(data))
      .catch(() => setError('Could not load inventory.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(activeType, ''); }, [activeType, load]);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => load(activeType, search), 300);
    return () => clearTimeout(id);
  }, [search, activeType, load]);

  const criticalCount = items.filter(
    (i) => i.stockLevel === 'CRITICAL' || i.stockLevel === 'LOW',
  ).length;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar + type filter */}
      <div className="px-4 pt-4 pb-3 bg-background border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type tab chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {TYPE_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveType(value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeType === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {criticalCount > 0 && (
          <p className="text-xs text-red-600 font-medium">
            {criticalCount} item{criticalCount > 1 ? 's' : ''} need attention
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-3 space-y-3">
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

        {!loading && !error && items.length === 0 && (
          <div className="flex justify-center py-16">
            <p className="text-sm text-muted-foreground">No items found</p>
          </div>
        )}

        {items.map((item) => {
          const lvl = LEVEL_CONFIG[item.stockLevel];
          const pct = item.maxThreshold > 0
            ? Math.min((item.currentStock / item.maxThreshold) * 100, 100)
            : 0;

          return (
            <Card key={item.id} className="cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/inventory/${item.id}`)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.itemCode} · {item.category} ·{' '}
                      <span className="capitalize">{item.inventoryType?.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <Badge variant={lvl.variant}>{lvl.label}</Badge>
                </div>

                {/* Stock bar */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${lvl.barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {item.currentStock} {item.unit}
                    </span>
                    <span>Max {item.maxThreshold} {item.unit}</span>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground">
                  Updated{' '}
                  {new Date(item.lastUpdated).toLocaleDateString('en-IN', {
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
    </div>
  );
}
