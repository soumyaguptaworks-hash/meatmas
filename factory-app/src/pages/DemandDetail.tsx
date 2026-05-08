import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, ShieldCheck, PackageCheck, FileText,
  Download, Loader2, XCircle, AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { factoryApi, type Demand, type DemandStatus, type DemandPriority } from '@/api/factory.api';

const PRIORITY_VARIANT: Record<DemandPriority, 'destructive' | 'warning' | 'info' | 'secondary'> = {
  URGENT: 'destructive', HIGH: 'warning', MEDIUM: 'info', LOW: 'secondary',
};

const STATUS_VARIANT: Record<DemandStatus, 'secondary' | 'warning' | 'info' | 'success' | 'destructive' | 'default'> = {
  DRAFT: 'secondary', PENDING_MANAGER: 'warning', PENDING_ADMIN: 'info',
  APPROVED: 'success', COMPLETED: 'default', REJECTED: 'destructive', CANCELLED: 'secondary',
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

export function DemandDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [demand, setDemand] = useState<Demand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    factoryApi.getDemand(id)
      .then(({ data }) => setDemand(data))
      .catch(() => setError('Could not load demand details.'))
      .finally(() => setLoading(false));
  }, [id]);

  function downloadBill() {
    if (!demand?.billData) return;
    const a = document.createElement('a');
    a.href = demand.billData;
    a.download = demand.billFileName ?? 'bill';
    a.click();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading demand…</span>
      </div>
    );
  }

  if (error || !demand) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <XCircle className="h-10 w-10 text-red-300" />
        <p className="text-sm text-gray-500">{error || 'Demand not found.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/demands')}>
          Back to Demands
        </Button>
      </div>
    );
  }

  const isImage = demand.billData?.startsWith('data:image');
  const isPdf = demand.billData?.startsWith('data:application/pdf');

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/demands')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-400">Demands</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700 font-mono">{demand.id}</span>
      </div>

      {/* Header card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{demand.itemName}</h1>
            <p className="text-sm text-gray-400 mt-0.5 font-mono">{demand.itemCode} · {demand.demandType.replace(/_/g, ' ')}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant={STATUS_VARIANT[demand.status]}>{demand.status.replace(/_/g, ' ')}</Badge>
              <Badge variant={PRIORITY_VARIANT[demand.priority]}>{demand.priority}</Badge>
              {demand.status === 'COMPLETED' && demand.receivedQuantity != null && demand.receivedQuantity < demand.quantity && (
                <Badge variant="warning">Partial Receipt</Badge>
              )}
              {demand.originalDemandId && <Badge variant="info">Remainder</Badge>}
            </div>
          </div>
          {demand.status === 'COMPLETED' && demand.receivedQuantity != null && demand.receivedQuantity < demand.quantity ? (
            <div className="text-right shrink-0">
              <div className="flex items-end gap-3 justify-end">
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide mb-0.5">Received</p>
                  <p className="text-3xl font-bold text-amber-600 leading-none">{demand.receivedQuantity}</p>
                </div>
                <p className="text-gray-300 text-2xl font-light pb-0.5">/</p>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Ordered</p>
                  <p className="text-3xl font-bold text-gray-300 leading-none">{demand.quantity}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-1.5">{demand.unit}</p>
            </div>
          ) : (
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-gray-900 leading-none">{demand.quantity}</p>
              <p className="text-sm text-gray-400 mt-1">{demand.unit}</p>
            </div>
          )}
        </div>
      </div>

      {/* Partial fulfillment summary */}
      {demand.status === 'COMPLETED' && demand.receivedQuantity != null && demand.receivedQuantity < demand.quantity && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-700">Partial Fulfillment</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-amber-600 font-medium mb-1">Ordered</p>
              <p className="text-2xl font-bold text-gray-800">{demand.quantity}</p>
              <p className="text-xs text-gray-500">{demand.unit}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-medium mb-1">Received</p>
              <p className="text-2xl font-bold text-emerald-600">{demand.receivedQuantity}</p>
              <p className="text-xs text-gray-500">{demand.unit}</p>
            </div>
            <div>
              <p className="text-xs text-red-500 font-medium mb-1">Pending</p>
              <p className="text-2xl font-bold text-red-500">{+(demand.quantity - demand.receivedQuantity).toFixed(3)}</p>
              <p className="text-xs text-gray-500">{demand.unit} — new demand raised</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-amber-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${(demand.receivedQuantity / demand.quantity) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-600 mt-1 text-right font-medium">
              {Math.round((demand.receivedQuantity / demand.quantity) * 100)}% fulfilled
            </p>
          </div>
        </div>
      )}

      {/* Detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Section title="Item Details" icon={FileText}>
          <InfoRow label="Item Name" value={demand.itemName} />
          <InfoRow label="Item Code" value={<span className="font-mono text-xs">{demand.itemCode}</span>} />
          <InfoRow label="Type" value={demand.demandType.replace(/_/g, ' ')} />
          <InfoRow
            label="Quantity"
            value={
              demand.status === 'COMPLETED' && demand.receivedQuantity != null
                ? (
                  <span>
                    <span className={demand.receivedQuantity < demand.quantity ? 'text-amber-600 font-semibold' : undefined}>
                      {demand.receivedQuantity} received
                    </span>
                    <span className="text-gray-400"> / {demand.quantity} {demand.unit} ordered</span>
                  </span>
                )
                : `${demand.quantity} ${demand.unit}`
            }
          />
          <InfoRow
            label="Due Date"
            value={new Date(demand.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          />
          {demand.notes && <InfoRow label="Notes" value={demand.notes} />}
        </Section>

        <Section title="Requested By" icon={User}>
          <InfoRow label="Email" value={demand.requestedBy} />
          <InfoRow label="Role" value={demand.requestedByRole} />
          <InfoRow
            label="Raised On"
            value={new Date(demand.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          />
        </Section>

        {demand.approvedBy && (
          <Section title="Approved By" icon={ShieldCheck} colorClass="text-emerald-600" bgClass="bg-emerald-50/60">
            <InfoRow label="Email" value={demand.approvedBy} />
            <InfoRow label="Role" value={demand.approvedByRole ?? '—'} />
            <InfoRow
              label="Approved At"
              value={new Date(demand.approvedAt!).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            />
          </Section>
        )}

        {demand.receivedBy && (
          <Section title="Received By" icon={PackageCheck} colorClass="text-blue-600" bgClass="bg-blue-50/60">
            <InfoRow label="Email" value={demand.receivedBy} />
            <InfoRow label="Role" value={demand.receivedByRole ?? '—'} />
            <InfoRow
              label="Received At"
              value={new Date(demand.receivedAt!).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            />
            {demand.receivedQuantity != null && (
              <InfoRow
                label="Qty Received"
                value={
                  <span className={demand.receivedQuantity < demand.quantity ? 'text-amber-600 font-semibold' : undefined}>
                    {demand.receivedQuantity} {demand.unit}
                    {demand.receivedQuantity < demand.quantity && ` of ${demand.quantity} ${demand.unit}`}
                  </span>
                }
              />
            )}
          </Section>
        )}
      </div>

      {/* Remainder notice */}
      {demand.originalDemandId && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4 text-sm text-amber-700">
          <span className="font-semibold">Partial remainder: </span>
          Auto-created from a partial receipt of demand{' '}
          <button
            onClick={() => navigate(`/demands/${demand.originalDemandId}`)}
            className="font-mono underline hover:text-amber-900"
          >
            {demand.originalDemandId}
          </button>.
        </div>
      )}

      {/* Rejection comment */}
      {demand.rejectionComment && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-700">
          <span className="font-semibold">Rejection reason: </span>{demand.rejectionComment}
        </div>
      )}

      {/* Bill */}
      {demand.status === 'COMPLETED' && (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <FileText className="h-4 w-4 text-gray-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Supplier Bill</h3>
          </div>
          {demand.billData ? (
            <>
              {isImage && (
                <div className="p-4">
                  <img src={demand.billData} alt="supplier bill" className="w-full max-h-96 object-contain rounded-xl border border-gray-100" />
                </div>
              )}
              {isPdf && (
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{demand.billFileName ?? 'bill.pdf'}</p>
                    <p className="text-xs text-gray-400">PDF Document</p>
                  </div>
                </div>
              )}
              <div className="border-t border-gray-100 px-5 py-3">
                <Button variant="outline" size="sm" onClick={downloadBill} className="gap-2 text-xs">
                  <Download className="h-3.5 w-3.5" /> Download Bill
                </Button>
              </div>
            </>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No bill was uploaded for this demand.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
