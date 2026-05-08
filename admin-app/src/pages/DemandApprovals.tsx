import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('ALL');
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Demand | null>(null);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RAW_MATERIAL' | 'STATIONARY' | 'PACKAGING'>('ALL');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDemands = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Demand[]>('/factory/demands');
      setDemands(data);
      setLastUpdated(new Date());
    } catch {
      if (!silent) setError('Failed to load demands. Please try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDemands();
    // poll every 20 seconds so new remainder demands appear automatically
    intervalRef.current = setInterval(() => fetchDemands(true), 20_000);
    // also refresh when the browser tab regains focus
    const onVisible = () => { if (document.visibilityState === 'visible') fetchDemands(true); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchDemands]);

  async function handleApprove(id: string) {
    setActionId(id);
    setActionError(null);
    try {
      const { data } = await api.patch<Demand>(`/factory/demands/${id}/approve`, {});
      if (data.status === 'APPROVED') {
        setDemands((prev) => prev.map((d) => d.id === id ? data : d));
        setSuccessMsg('Demand approved successfully. Check the Approved tab.');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setActionError('Could not approve — make sure you are logged in as Admin (admin@meatmas.com).');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setActionError(Array.isArray(msg) ? msg.join(', ') : String(msg ?? 'Approve failed. Try refreshing.'));
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string, comment: string) {
    setActionId(id);
    setActionError(null);
    try {
      const { data } = await api.patch<Demand>(`/factory/demands/${id}/reject`, { comment });
      setDemands((prev) => prev.map((d) => d.id === id ? data : d));
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setActionError(Array.isArray(msg) ? msg.join(', ') : String(msg ?? 'Reject failed'));
    } finally {
      setActionId(null);
    }
  }

  const filtered = (() => {
    let list = tab === 'ALL' ? demands : demands.filter((d) => d.status === tab);
    if (tab === 'PENDING_ADMIN' && typeFilter !== 'ALL') {
      list = list.filter((d) => d.demandType === typeFilter);
    }
    return list;
  })();

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
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_TABS.map(({ key, label }) => {
              const count = key === 'ALL' ? demands.length : (counts[key] ?? 0);
              return (
                <button
                  key={key}
                  onClick={() => { setTab(key); setTypeFilter('ALL'); }}
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
          <div className="flex items-center gap-2 shrink-0">
            {lastUpdated && (
              <span className="text-[10px] text-gray-400">
                Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDemands()}
              disabled={loading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Sub-filters — only visible on Needs Approval tab */}
        {tab === 'PENDING_ADMIN' && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mr-1">Filter by type:</span>
            {([
              { key: 'ALL',          label: 'All' },
              { key: 'RAW_MATERIAL', label: 'Raw Material' },
              { key: 'STATIONARY',   label: 'Stationary' },
              { key: 'PACKAGING',    label: 'Packaging' },
            ] as const).map(({ key, label }) => {
              const cnt = key === 'ALL'
                ? demands.filter(d => d.status === 'PENDING_ADMIN').length
                : demands.filter(d => d.status === 'PENDING_ADMIN' && d.demandType === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all flex items-center gap-1 ${
                    typeFilter === key
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  {label}
                  <span className={`text-[10px] font-bold ${typeFilter === key ? 'text-amber-600' : 'text-gray-400'}`}>
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Success / error banners */}
      {successMsg && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-3 text-emerald-400 hover:text-emerald-600">✕</button>
        </div>
      )}
      {actionError && (
        <div className="flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-3 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

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
                {filtered.map((d) => {
                  return (
                  <tr
                    key={d.id}
                    onClick={() => navigate(`/demand-approvals/${d.id}`)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
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
                      {d.status === 'COMPLETED' && d.receivedQuantity != null && d.receivedQuantity < d.quantity ? (
                        <span className="flex flex-col gap-0.5">
                          <span>
                            <span className="text-amber-600">{d.receivedQuantity}</span>
                            <span className="text-gray-400 font-normal text-xs"> / {d.quantity} {d.unit}</span>
                          </span>
                          <span className="text-[10px] text-amber-500 font-medium">partial receipt</span>
                        </span>
                      ) : (
                        <>
                          {d.quantity}{' '}
                          <span className="text-gray-400 font-normal">{d.unit}</span>
                        </>
                      )}
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={STATUS_VARIANT[d.status]}>
                          {d.status.replace('_', ' ')}
                        </Badge>
                        {d.status === 'COMPLETED' && d.receivedQuantity != null && d.receivedQuantity < d.quantity && (
                          <Badge variant="warning">Partial</Badge>
                        )}
                        {d.originalDemandId && (
                          <Badge variant="info">Remainder</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {d.status === 'PENDING_ADMIN' && (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                        <span className="text-xs text-blue-500 font-medium flex items-center gap-1 underline underline-offset-2 decoration-dotted">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed · View details
                        </span>
                      )}
                      {(d.status === 'DRAFT' || d.status === 'PENDING_MANAGER' || d.status === 'CANCELLED') && (
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                          View details →
                        </span>
                      )}
                    </td>
                  </tr>
                  );
                })}
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
