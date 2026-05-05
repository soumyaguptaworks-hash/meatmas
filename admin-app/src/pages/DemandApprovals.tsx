import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ClipboardList, Clock, Loader2, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import api from '@/api/axios';

type DemandStatus =
  | 'DRAFT'
  | 'PENDING_MANAGER'
  | 'PENDING_ADMIN'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

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
  createdAt: string;
  updatedAt: string;
}

const PRIORITY_VARIANT: Record<DemandPriority, 'destructive' | 'warning' | 'info' | 'secondary'> = {
  URGENT: 'destructive',
  HIGH:   'warning',
  MEDIUM: 'info',
  LOW:    'secondary',
};

const STATUS_VARIANT: Record<DemandStatus, 'secondary' | 'warning' | 'info' | 'success' | 'destructive' | 'default'> = {
  DRAFT:           'secondary',
  PENDING_MANAGER: 'warning',
  PENDING_ADMIN:   'info',
  APPROVED:        'success',
  COMPLETED:       'default',
  REJECTED:        'destructive',
  CANCELLED:       'secondary',
};

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'ALL',            label: 'All Demands' },
  { key: 'PENDING_ADMIN',  label: 'Needs Approval' },
  { key: 'APPROVED',       label: 'Approved' },
  { key: 'COMPLETED',      label: 'Completed' },
  { key: 'REJECTED',       label: 'Rejected' },
];

// ─── Reject Modal ──────────────────────────────────────────────────────────

interface RejectModalProps {
  demand: Demand;
  onClose: () => void;
  onConfirm: (id: string, comment: string) => void;
}

function RejectModal({ demand, onClose, onConfirm }: RejectModalProps) {
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">Reject Demand</h3>
          <p className="text-xs text-gray-500 mt-0.5">{demand.itemName} — {demand.quantity} {demand.unit}</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-gray-600">Provide a reason for rejection (required).</p>
          <textarea
            autoFocus
            rows={4}
            placeholder="Rejection reason…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={!comment.trim()}
            onClick={() => { onConfirm(demand.id, comment); onClose(); }}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function DemandApprovals() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('ALL');
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Demand | null>(null);

  async function fetchDemands() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Demand[]>('/factory/demands');
      setDemands(data);
    } catch {
      setError('Failed to load demands. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDemands(); }, []);

  async function handleApprove(id: string) {
    setActionId(id);
    try {
      const { data } = await api.patch<Demand>(`/factory/demands/${id}/approve`);
      setDemands((prev) => prev.map((d) => d.id === id ? data : d));
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string, comment: string) {
    setActionId(id);
    try {
      const { data } = await api.patch<Demand>(`/factory/demands/${id}/reject`, { comment });
      setDemands((prev) => prev.map((d) => d.id === id ? data : d));
    } finally {
      setActionId(null);
    }
  }

  const filtered = tab === 'ALL'
    ? demands
    : demands.filter((d) => d.status === tab);

  const counts: Record<string, number> = {
    PENDING_ADMIN: demands.filter((d) => d.status === 'PENDING_ADMIN').length,
    APPROVED:      demands.filter((d) => d.status === 'APPROVED').length,
    COMPLETED:     demands.filter((d) => d.status === 'COMPLETED').length,
    REJECTED:      demands.filter((d) => d.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          demand={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}

      {/* Stat pills */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Demands',     value: demands.length,           icon: ClipboardList, bg: 'bg-blue-50',    color: 'text-blue-500' },
          { label: 'Needs Admin Approval', value: counts.PENDING_ADMIN,  icon: Clock,         bg: 'bg-amber-50',   color: 'text-amber-500' },
          { label: 'Approved',          value: counts.APPROVED,          icon: CheckCircle2,  bg: 'bg-emerald-50', color: 'text-emerald-500' },
          { label: 'Rejected',          value: counts.REJECTED,          icon: XCircle,       bg: 'bg-red-50',     color: 'text-red-500' },
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

      {/* Tabs + refresh */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_TABS.map(({ key, label }) => {
              const count = key === 'ALL' ? demands.length : (counts[key] ?? 0);
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    tab === key
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    tab === key ? 'bg-white/20' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDemands}
            disabled={loading}
            className="gap-1.5 text-xs shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading demands…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <XCircle className="h-10 w-10 text-red-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">{error}</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={fetchDemands}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {[
                    'Demand ID',
                    'Type',
                    'Item',
                    'Quantity',
                    'Requested By',
                    'Due Date',
                    'Priority',
                    'Status',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-gray-400 uppercase">{d.id}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {d.demandType?.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{d.itemName}</p>
                        <p className="text-xs text-gray-400 font-mono">{d.itemCode}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-700">
                      {d.quantity}{' '}
                      <span className="text-gray-400 font-normal">{d.unit}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      <div>
                        <p>{d.requestedBy?.split('@')[0]}</p>
                        <p className="text-[10px] text-gray-400">{d.requestedByRole}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(d.dueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={PRIORITY_VARIANT[d.priority]}>{d.priority}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_VARIANT[d.status]}>
                        {d.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      {d.status === 'PENDING_ADMIN' && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                            disabled={actionId === d.id}
                            onClick={() => handleApprove(d.id)}
                          >
                            {actionId === d.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <><CheckCircle2 className="h-3.5 w-3.5" /> Approve</>
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-500 hover:bg-red-50 gap-1"
                            disabled={actionId === d.id}
                            onClick={() => setRejectTarget(d)}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                      {d.status === 'APPROVED' && (
                        <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                        </span>
                      )}
                      {d.status === 'REJECTED' && (
                        <span
                          className="text-xs text-red-400 font-medium flex items-center gap-1 cursor-help"
                          title={d.rejectionComment ?? ''}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Rejected
                          {d.rejectionComment && <MessageSquare className="h-3 w-3 ml-0.5" />}
                        </span>
                      )}
                      {d.status === 'COMPLETED' && (
                        <span className="text-xs text-blue-500 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <ClipboardList className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No demands found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {tab === 'ALL'
                    ? 'No demands have been raised yet.'
                    : `No ${tab.toLowerCase().replace(/_/g, ' ')} demands.`}
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
