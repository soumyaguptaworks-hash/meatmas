import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, XCircle, Layers, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { factoryApi, type InventoryItem, type StockLevel } from '@/api/factory.api';

const LEVEL_CONFIG: Record<StockLevel, {
  label: string;
  variant: 'destructive' | 'warning' | 'success' | 'secondary';
  barColor: string;
  bgColor: string;
  textColor: string;
}> = {
  CRITICAL: { label: 'Critical', variant: 'destructive', barColor: 'bg-red-500',     bgColor: 'bg-red-50/60',     textColor: 'text-red-600' },
  LOW:      { label: 'Low',      variant: 'warning',     barColor: 'bg-amber-500',   bgColor: 'bg-amber-50/60',   textColor: 'text-amber-600' },
  ADEQUATE: { label: 'OK',       variant: 'success',     barColor: 'bg-emerald-500', bgColor: 'bg-emerald-50/60', textColor: 'text-emerald-600' },
  EXCESS:   { label: 'Excess',   variant: 'secondary',   barColor: 'bg-blue-400',    bgColor: 'bg-blue-50/60',    textColor: 'text-blue-600' },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export function InventoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = (location.state as { item?: InventoryItem } | null)?.item ?? null;
  const [item, setItem] = useState<InventoryItem | null>(stateData);
  const [loading, setLoading] = useState(!stateData);
  const [error, setError] = useState('');

  useEffect(() => {
    if (stateData || !id) return;
    factoryApi.getInventoryItem(id)
      .then(({ data }) => setItem(data))
      .catch(() => setError('Could not load inventory item.'))
      .finally(() => setLoading(false));
  }, [id, stateData]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading item…</span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <XCircle className="h-10 w-10 text-red-300" />
        <p className="text-sm text-gray-500">{error || 'Item not found.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
          Back to Inventory
        </Button>
      </div>
    );
  }

  const lvl = LEVEL_CONFIG[item.stockLevel];
  const pct = item.maxThreshold > 0
    ? Math.min((item.currentStock / item.maxThreshold) * 100, 100)
    : 0;
  const minPct = item.maxThreshold > 0
    ? Math.min((item.minThreshold / item.maxThreshold) * 100, 100)
    : 0;

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-400">Inventory</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700 font-mono">{item.itemCode}</span>
      </div>

      {/* Header card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{item.itemName}</h1>
            <p className="text-sm text-gray-400 mt-0.5 font-mono">{item.itemCode} · {item.category}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={lvl.variant}>{lvl.label}</Badge>
              <Badge variant="secondary">{item.inventoryType.replace('_', ' ')}</Badge>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-gray-900 leading-none">{item.currentStock}</p>
            <p className="text-sm text-gray-400 mt-1">{item.unit} in stock</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Item details */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <Layers className="h-4 w-4 text-gray-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Item Details</h3>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Item Name" value={item.itemName} />
            <InfoRow label="Item Code" value={<span className="font-mono text-xs">{item.itemCode}</span>} />
            <InfoRow label="Category" value={item.category} />
            <InfoRow label="Type" value={item.inventoryType.replace('_', ' ')} />
            <InfoRow label="Unit" value={item.unit} />
            <InfoRow
              label="Last Updated"
              value={new Date(item.lastUpdated).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            />
          </div>
        </div>

        {/* Stock levels */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className={`flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 ${lvl.bgColor}`}>
            <BarChart3 className={`h-4 w-4 ${lvl.textColor}`} />
            <h3 className={`text-xs font-semibold uppercase tracking-wide ${lvl.textColor}`}>Stock Levels</h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            {/* Big numbers */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-[10px] text-gray-400 font-medium uppercase mb-1">Min</p>
                <p className="text-xl font-bold text-gray-600">{item.minThreshold}</p>
                <p className="text-[10px] text-gray-400">{item.unit}</p>
              </div>
              <div className={`rounded-xl px-3 py-3 ${pct < minPct ? 'bg-red-50' : 'bg-emerald-50'}`}>
                <p className="text-[10px] text-gray-400 font-medium uppercase mb-1">Current</p>
                <p className={`text-xl font-bold ${pct < minPct ? 'text-red-600' : 'text-emerald-600'}`}>{item.currentStock}</p>
                <p className="text-[10px] text-gray-400">{item.unit}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-[10px] text-gray-400 font-medium uppercase mb-1">Max</p>
                <p className="text-xl font-bold text-gray-600">{item.maxThreshold}</p>
                <p className="text-[10px] text-gray-400">{item.unit}</p>
              </div>
            </div>

            {/* Stock bar */}
            <div className="space-y-1.5">
              <div className="relative h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${lvl.barColor}`}
                  style={{ width: `${pct}%` }}
                />
                {/* Min threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-400/60"
                  style={{ left: `${minPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0</span>
                <span className={`font-semibold ${lvl.textColor}`}>{Math.round(pct)}% of capacity</span>
                <span>{item.maxThreshold} {item.unit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
