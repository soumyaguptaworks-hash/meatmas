import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, XCircle, GitBranch, PackageCheck, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { factoryApi, type Batch, type BatchStatus } from '@/api/factory.api';

const STATUS_CONFIG: Record<BatchStatus, { label: string; variant: 'secondary' | 'info' | 'success' | 'destructive'; dot: string }> = {
  PREPARING:  { label: 'Preparing',  variant: 'secondary',   dot: 'bg-slate-400' },
  PROCESSING: { label: 'Processing', variant: 'info',        dot: 'bg-blue-500' },
  COMPLETED:  { label: 'Completed',  variant: 'success',     dot: 'bg-emerald-500' },
  CANCELLED:  { label: 'Cancelled',  variant: 'destructive', dot: 'bg-red-400' },
};

const STATUS_FLOW: Record<BatchStatus, BatchStatus | null> = {
  PREPARING:  'PROCESSING',
  PROCESSING: 'COMPLETED',
  COMPLETED:  null,
  CANCELLED:  null,
};

const NEXT_LABEL: Partial<Record<BatchStatus, string>> = {
  PREPARING:  'Start Processing',
  PROCESSING: 'Mark Completed',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    factoryApi.getBatch(id)
      .then(({ data }) => setBatch(data))
      .catch(() => setError('Could not load batch details.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(newStatus: BatchStatus) {
    if (!batch) return;
    setUpdating(true);
    try {
      const { data } = await factoryApi.updateBatchStatus(batch.id, newStatus);
      setBatch(data);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading batch…</span>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <XCircle className="h-10 w-10 text-red-300" />
        <p className="text-sm text-gray-500">{error || 'Batch not found.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/batches')}>
          Back to Batches
        </Button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[batch.status];
  const nextStatus = STATUS_FLOW[batch.status];
  const nextLabel = NEXT_LABEL[batch.status];

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/batches')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-400">Batches</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700 font-mono">{batch.batchNumber}</span>
      </div>

      {/* Header card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${cfg.dot} shrink-0`} />
              <h1 className="text-xl font-bold text-gray-900">{batch.inputItem}</h1>
            </div>
            <p className="text-sm text-gray-400 mt-0.5 font-mono pl-5">#{batch.batchNumber}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-gray-900 leading-none">{batch.inputQuantity}</p>
            <p className="text-sm text-gray-400 mt-1">{batch.inputUnit} input</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Batch Info */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <GitBranch className="h-4 w-4 text-gray-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Batch Info</h3>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Batch Number" value={<span className="font-mono text-xs">{batch.batchNumber}</span>} />
            <InfoRow label="Input Item" value={batch.inputItem} />
            <InfoRow label="Input Quantity" value={`${batch.inputQuantity} ${batch.inputUnit}`} />
            <InfoRow label="Processing Date" value={new Date(batch.processingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <InfoRow label="Performed By" value={batch.performedBy} />
            <InfoRow
              label="Created"
              value={new Date(batch.createdAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            />
          </div>
        </div>

        {/* Outputs */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-emerald-50/60">
            <PackageCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Output Items</h3>
          </div>
          <div className="px-5 py-3">
            {batch.outputs.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No outputs recorded.</p>
            ) : (
              <div className="space-y-2">
                {batch.outputs.map((o, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{o.itemName}</span>
                    <span className="text-sm font-semibold text-gray-900">{o.quantity} {o.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Wastage */}
        {batch.wastage.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden md:col-span-2">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-amber-50/60">
              <Trash2 className="h-4 w-4 text-amber-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-600">Wastage</h3>
            </div>
            <div className="px-5 py-3">
              <div className="space-y-2">
                {batch.wastage.map((w, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-amber-50 last:border-0">
                    <span className="text-sm text-amber-800">{w.itemName}</span>
                    <span className="text-sm font-semibold text-amber-700">{w.quantity} {w.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status actions */}
      {(nextStatus || batch.status === 'PREPARING' || batch.status === 'PROCESSING') && (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Update Status</p>
          <div className="flex gap-3 flex-wrap">
            {nextStatus && nextLabel && (
              <Button
                onClick={() => handleStatusChange(nextStatus)}
                disabled={updating}
                className="gap-2"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : nextLabel}
              </Button>
            )}
            {(batch.status === 'PREPARING' || batch.status === 'PROCESSING') && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={updating}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel Batch
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
