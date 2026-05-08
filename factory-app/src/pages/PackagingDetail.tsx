import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, XCircle, Package, BoxSelect } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { factoryApi, type PackagingOrder, type PackagingStatus } from '@/api/factory.api';

const STATUS_CONFIG: Record<PackagingStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'secondary'; dot: string }> = {
  PENDING:     { label: 'Pending',     variant: 'warning',   dot: 'bg-amber-500' },
  IN_PROGRESS: { label: 'In Progress', variant: 'info',      dot: 'bg-blue-500' },
  COMPLETED:   { label: 'Completed',   variant: 'success',   dot: 'bg-emerald-500' },
  CANCELLED:   { label: 'Cancelled',   variant: 'secondary', dot: 'bg-slate-400' },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children, colorClass = 'text-gray-400', bgClass = 'bg-gray-50' }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  colorClass?: string;
  bgClass?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className={`flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 ${bgClass}`}>
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${colorClass}`}>{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

export function PackagingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PackagingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    factoryApi.getPackagingOrder(id)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Could not load packaging order.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading order…</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <XCircle className="h-10 w-10 text-red-300" />
        <p className="text-sm text-gray-500">{error || 'Packaging order not found.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/packaging')}>
          Back to Packaging
        </Button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status];
  const totalOutput = order.packsProduced * order.packSize;

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/packaging')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-400">Packaging</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700 font-mono">{order.orderNumber}</span>
      </div>

      {/* Header card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${cfg.dot} shrink-0`} />
              <h1 className="text-xl font-bold text-gray-900">{order.outputSku}</h1>
            </div>
            <p className="text-sm text-gray-400 mt-0.5 pl-5">Order #{order.orderNumber}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-gray-900 leading-none">{order.packsProduced}</p>
            <p className="text-sm text-gray-400 mt-1">packs produced</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase mb-1">Pack Size</p>
          <p className="text-2xl font-bold text-gray-900">{order.packSize}</p>
          <p className="text-xs text-gray-400">grams</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase mb-1">Total Output</p>
          <p className="text-2xl font-bold text-emerald-600">{(totalOutput / 1000).toFixed(2)}</p>
          <p className="text-xs text-gray-400">kg packaged</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase mb-1">Wastage</p>
          <p className={`text-2xl font-bold ${order.wastageCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
            {order.wastageCount}
          </p>
          <p className="text-xs text-gray-400">damaged packs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input details */}
        <Section title="Input Material" icon={Package}>
          <InfoRow label="Input Item" value={order.inputItem} />
          <InfoRow label="Input Quantity" value={`${order.inputQuantity} ${order.inputUnit}`} />
          <InfoRow label="Packaging Material" value={order.packagingMaterial} />
        </Section>

        {/* Output details */}
        <Section title="Output Details" icon={BoxSelect} colorClass="text-emerald-600" bgClass="bg-emerald-50/60">
          <InfoRow label="SKU" value={<span className="font-mono text-xs">{order.outputSku}</span>} />
          <InfoRow label="Pack Size" value={`${order.packSize}g per pack`} />
          <InfoRow label="Packs Produced" value={`${order.packsProduced} packs`} />
          <InfoRow label="Total Output" value={`${(totalOutput / 1000).toFixed(2)} kg`} />
          <InfoRow
            label="Wastage"
            value={
              <span className={order.wastageCount > 0 ? 'text-amber-600 font-semibold' : undefined}>
                {order.wastageCount} packs
              </span>
            }
          />
        </Section>

        {/* Order metadata */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden md:col-span-2">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <BoxSelect className="h-4 w-4 text-gray-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Order Info</h3>
          </div>
          <div className="px-5 py-1 grid grid-cols-2 divide-x divide-gray-50">
            <div className="pr-5">
              <InfoRow label="Order Number" value={<span className="font-mono text-xs">{order.orderNumber}</span>} />
              <InfoRow label="Performed By" value={order.performedBy} />
            </div>
            <div className="pl-5">
              <InfoRow label="Status" value={<Badge variant={cfg.variant}>{cfg.label}</Badge>} />
              <InfoRow
                label="Created"
                value={new Date(order.createdAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
