import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, ShieldCheck, PackageCheck, FileText,
  Download, Loader2, XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/api/axios';

type DemandStatus = 'DRAFT' | 'PENDING_MANAGER' | 'PENDING_ADMIN' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
type DemandType = 'RAW_MATERIAL' | 'PACKAGING' | 'STATIONARY';
type DemandPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Demand {
  id: string;
  demandType: DemandType;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  priority: DemandPriority;
  status: DemandStatus;
  requestedBy: string;
  requestedByRole: string;
  dueDate: string;
  notes?: string;
  rejectionComment?: string;
  approvedBy?: string;
  approvedByRole?: string;
  approvedById?: string;
  approvedAt?: string;
  receivedBy?: string;
  receivedByRole?: string;
  receivedAt?: string;
  receivedQuantity?: number;
  originalDemandId?: string;
  billData?: string;
  billFileName?: string;
  createdAt: string;
  updatedAt: string;
}

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
    api.get<Demand>(`/factory/demands/${id}`)
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
        <Button variant="outline" size="sm" onClick={() => navigate('/demand-approvals')}>
          Back to Demand Approvals
        </Button>
      </div>
    );
  }

  const isImage = demand.billData?.startsWith('data:image');
  const isPdf = demand.billData?.startsWith('data:application/pdf');

  return (
    <div className="max-w-4xl space-y-5">

      {/* Breadcrumb + back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/demand-approvals')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-400">Demand Approvals</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700 font-mono uppercase">{demand.id}</span>
      </div>

      {/* Page header card */}
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
              {demand.originalDemandId && (
                <Badge variant="info">Remainder</Badge>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-gray-900 leading-none">{demand.quantity}</p>
            <p className="text-sm text-gray-400 mt-1">{demand.unit}</p>
          </div>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Item Details */}
        <Section title="Item Details" icon={FileText}>
          <InfoRow label="Item Name"  value={demand.itemName} />
          <InfoRow label="Item Code"  value={<span className="font-mono text-xs">{demand.itemCode}</span>} />
          <InfoRow label="Type"       value={demand.demandType.replace(/_/g, ' ')} />
          <InfoRow label="Quantity"   value={`${demand.quantity} ${demand.unit}`} />
          <InfoRow
            label="Due Date"
            value={new Date(demand.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          />
          {demand.notes && <InfoRow label="Notes" value={demand.notes} />}
        </Section>

        {/* Requested By */}
        <Section title="Requested By" icon={User}>
          <InfoRow label="Email"    value={demand.requestedBy} />
          <InfoRow label="Role"     value={demand.requestedByRole} />
          <InfoRow
            label="Raised On"
            value={new Date(demand.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          />
        </Section>

        {/* Approved By */}
        {demand.approvedBy && (
          <Section
            title="Approved By"
            icon={ShieldCheck}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50/60"
          >
            <InfoRow label="Email"       value={demand.approvedBy} />
            <InfoRow label="Role"        value={demand.approvedByRole ?? '—'} />
            <InfoRow label="User ID"     value={<span className="font-mono text-xs">{demand.approvedById}</span>} />
            <InfoRow
              label="Approved At"
              value={new Date(demand.approvedAt!).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            />
          </Section>
        )}

        {/* Received By */}
        {demand.receivedBy && (
          <Section
            title="Received By"
            icon={PackageCheck}
            colorClass="text-blue-600"
            bgClass="bg-blue-50/60"
          >
            <InfoRow label="Email"       value={demand.receivedBy} />
            <InfoRow label="Role"        value={demand.receivedByRole ?? '—'} />
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
            {demand.originalDemandId && (
              <InfoRow label="Original Demand" value={<span className="font-mono text-xs">{demand.originalDemandId}</span>} />
            )}
          </Section>
        )}
      </div>

      {/* Partial remainder notice */}
      {demand.originalDemandId && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4 text-sm text-amber-700">
          <span className="font-semibold">Partial remainder: </span>
          This demand was auto-created from a partial receipt of demand{' '}
          <span className="font-mono">{demand.originalDemandId}</span>.
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
                  <img
                    src={demand.billData}
                    alt="supplier bill"
                    className="w-full max-h-96 object-contain rounded-xl border border-gray-100"
                  />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadBill}
                  className="gap-2 text-xs"
                >
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
