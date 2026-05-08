import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  Search,
  AlertCircle,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  ChevronDown,
  PackageCheck,
  Upload,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  factoryApi,
  type Demand,
  type DemandStatus,
  type DemandPriority,
  type DemandType,
  type CreateDemandBody,
} from '@/api/factory.api';
import { useAuthStore } from '@/store/auth.store';

// ─── Config ────────────────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: DemandStatus | 'ALL' }[] = [
  { label: 'All',            value: 'ALL' },
  { label: 'Draft',          value: 'DRAFT' },
  { label: 'Pending Mgr',    value: 'PENDING_MANAGER' },
  { label: 'Pending Admin',  value: 'PENDING_ADMIN' },
  { label: 'Approved',       value: 'APPROVED' },
  { label: 'Completed',      value: 'COMPLETED' },
  { label: 'Rejected',       value: 'REJECTED' },
];

const STATUS_BADGE: Record<DemandStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'secondary' | 'destructive' | 'default' }> = {
  DRAFT:           { label: 'Draft',          variant: 'secondary' },
  PENDING_MANAGER: { label: 'Pending Mgr',    variant: 'warning' },
  PENDING_ADMIN:   { label: 'Pending Admin',  variant: 'info' },
  APPROVED:        { label: 'Approved',       variant: 'success' },
  COMPLETED:       { label: 'Completed',      variant: 'secondary' },
  REJECTED:        { label: 'Rejected',       variant: 'destructive' },
  CANCELLED:       { label: 'Cancelled',      variant: 'secondary' },
};

const PRIORITY_COLOR: Record<DemandPriority, string> = {
  LOW:    'bg-slate-400',
  MEDIUM: 'bg-blue-500',
  HIGH:   'bg-amber-500',
  URGENT: 'bg-red-500',
};

const UNITS = ['kg', 'g', 'pcs', 'litres', 'rolls', 'reams', 'boxes', 'bottles'] as const;
const DEMAND_TYPES: { value: DemandType; label: string }[] = [
  { value: 'RAW_MATERIAL', label: 'Raw Material' },
  { value: 'PACKAGING',    label: 'Packaging' },
  { value: 'STATIONARY',   label: 'Stationary' },
];

// ─── Create Demand Modal ───────────────────────────────────────────────────

interface CreateDemandModalProps {
  onClose: () => void;
  onCreated: (d: Demand) => void;
}

function CreateDemandModal({ onClose, onCreated }: CreateDemandModalProps) {
  const [form, setForm] = useState<CreateDemandBody>({
    demandType: 'RAW_MATERIAL',
    itemName: '',
    quantity: 0,
    unit: 'kg',
    priority: 'MEDIUM',
    dueDate: '',
    notes: '',
    saveAsDraft: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof CreateDemandBody>(key: K, val: CreateDemandBody[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(asDraft: boolean) {
    if (!form.itemName.trim()) { setError('Item name is required.'); return; }
    if (!form.quantity || form.quantity <= 0) { setError('Quantity must be > 0.'); return; }
    if (!form.dueDate) { setError('Due date is required.'); return; }

    setError('');
    setSaving(true);
    try {
      const { data } = await factoryApi.createDemand({ ...form, saveAsDraft: asDraft });
      onCreated(data);
      onClose();
    } catch {
      setError('Failed to create demand. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-base">New Demand</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {/* Demand Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Demand Type
            </label>
            <div className="relative">
              <select
                value={form.demandType}
                onChange={(e) => set('demandType', e.target.value as DemandType)}
                className="w-full appearance-none rounded-xl border bg-background px-3 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {DEMAND_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Item Name
            </label>
            <Input
              placeholder="e.g. Chicken Breast"
              value={form.itemName}
              onChange={(e) => set('itemName', e.target.value)}
            />
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quantity
              </label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.quantity || ''}
                onChange={(e) => set('quantity', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Unit
              </label>
              <div className="relative">
                <select
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                  className="w-full appearance-none rounded-xl border bg-background px-3 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Priority
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as DemandPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.priority === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Due Date
            </label>
            <Input
              type="date"
              inputMode="numeric"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Any additional notes…"
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            disabled={saving}
            onClick={() => handleSubmit(true)}
          >
            Save Draft
          </Button>
          <Button
            className="flex-1"
            disabled={saving}
            onClick={() => handleSubmit(false)}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Reject Modal ──────────────────────────────────────────────────────────

interface RejectModalProps {
  demandId: string;
  onClose: () => void;
  onRejected: (id: string) => void;
}

function RejectModal({ demandId, onClose, onRejected }: RejectModalProps) {
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleReject() {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await factoryApi.rejectDemand(demandId, comment);
      onRejected(demandId);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-sm bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-base text-red-600">Reject Demand</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-muted-foreground">Please provide a reason for rejection.</p>
          <textarea
            rows={4}
            autoFocus
            placeholder="Reason for rejection…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={saving || !comment.trim()}
            onClick={handleReject}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Bill Upload Modal ─────────────────────────────────────────────────────

interface BillUploadModalProps {
  demand: Demand;
  onClose: () => void;
  onConfirm: (id: string, billData?: string, billFileName?: string, receivedQuantity?: number) => Promise<void>;
}

function BillUploadModal({ demand, onClose, onConfirm }: BillUploadModalProps) {
  const [billData, setBillData] = useState<string | undefined>();
  const [billFileName, setBillFileName] = useState<string | undefined>();
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const [receivedQty, setReceivedQty] = useState<string>(String(demand.quantity));
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const parsedQty = parseFloat(receivedQty);
  const isValidQty = !isNaN(parsedQty) && parsedQty > 0 && parsedQty <= demand.quantity;
  const remainderQty = isValidQty ? +(demand.quantity - parsedQty).toFixed(3) : 0;
  const isPartial = isValidQty && parsedQty < demand.quantity;

  function handleFile(file: File) {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) return;
    setPreviewType(isImage ? 'image' : 'pdf');
    setBillFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setBillData(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!isValidQty) return;
    setSaving(true);
    setSubmitError('');
    try {
      await onConfirm(demand.id, billData, billFileName, parsedQty);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setSubmitError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to update. Please restart the backend and try again.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-semibold text-base flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-blue-500" /> Mark as Received
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{demand.itemName} · Ordered: {demand.quantity} {demand.unit}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Quantity received */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Quantity Received ({demand.unit})
            </label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder={String(demand.quantity)}
              value={receivedQty}
              min={0.01}
              max={demand.quantity}
              step="any"
              onChange={(e) => setReceivedQty(e.target.value)}
            />
            {isPartial && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Remaining {remainderQty} {demand.unit} will be sent back for admin approval
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">Attach the supplier bill or invoice (optional) before updating inventory.</p>

          {!billData ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center w-full gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 py-8 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm font-medium">Tap to upload bill</span>
              <span className="text-xs">PNG, JPG or PDF</span>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden border bg-muted/30">
              {previewType === 'image' ? (
                <img src={billData} alt="bill" className="w-full max-h-48 object-contain" />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <FileText className="h-8 w-8 text-red-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{billFileName}</span>
                </div>
              )}
              <button
                onClick={() => { setBillData(undefined); setBillFileName(undefined); setPreviewType(null); }}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {submitError && (
          <div className="flex items-center gap-2 mx-5 mb-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
          </div>
        )}

        <div className="flex gap-3 px-5 py-4 border-t">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !isValidQty}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PackageCheck className="h-4 w-4" /> Confirm Receipt</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function Demands() {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === 'MANAGER';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<DemandStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | DemandType>('ALL');
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<Demand | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  function loadDemands(tab: DemandStatus | 'ALL') {
    setLoading(true);
    setError('');
    factoryApi
      .getDemands(tab)
      .then(({ data }) => setDemands(data))
      .catch(() => setError('Could not load demands. Check your connection.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadDemands(activeTab); }, [activeTab]);

  // Manager sees all; Staff sees only own demands
  const visibleDemands = isManager
    ? demands
    : demands.filter((d) => d.requestedBy === user?.email);

  const filtered = visibleDemands.filter((d): d is Demand => {
    if (!d) return false;
    const matchesSearch =
      d.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      d.itemCode?.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeTab !== 'ALL' || typeFilter === 'ALL' || d.demandType === typeFilter;
    return !!(matchesSearch && matchesType);
  });

  async function handleApprove(id: string) {
    setActionId(id);
    try {
      const { data } = await factoryApi.approveDemand(id);
      setDemands((prev) => prev.map((d) => d.id === id ? data : d));
    } finally {
      setActionId(null);
    }
  }

  async function handleMarkReceived(id: string, billData?: string, billFileName?: string, receivedQuantity?: number) {
    const demand = demands.find((d) => d.id === id);
    setActionId(id);
    try {
      const { data } = await factoryApi.completeDemand(id, billData, billFileName, receivedQuantity);

      // If the backend didn't auto-create a remainder, create it from the frontend.
      // Manager role → new demand starts at PENDING_ADMIN automatically.
      if (
        demand &&
        receivedQuantity != null &&
        receivedQuantity < demand.quantity &&
        !data.remainder
      ) {
        const remainderQty = +(demand.quantity - receivedQuantity).toFixed(3);
        await factoryApi.createDemand({
          demandType: demand.demandType,
          itemName: demand.itemName,
          quantity: remainderQty,
          unit: demand.unit,
          priority: demand.priority,
          dueDate: demand.dueDate,
          notes: `Partial remainder: ${receivedQuantity} ${demand.unit} received of ${demand.quantity} ${demand.unit} ordered (demand ${id})`,
        });
      }

      loadDemands('ALL');
      setActiveTab('ALL');
    } finally {
      setActionId(null);
    }
  }

  function handleCreated(newDemand: Demand) {
    setDemands((prev) => [newDemand, ...prev]);
  }

  function handleRejected(id: string) {
    setDemands((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: 'REJECTED' as DemandStatus } : d),
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Search + filter */}
      <div className="px-4 pt-4 pb-2 space-y-3 bg-background border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search demands…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {STATUS_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => { setActiveTab(value); setTypeFilter('ALL'); }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === value
                  ? 'bg-[#d94040] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Type sub-filters — only shown under ALL tab */}
        {activeTab === 'ALL' && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {([
              { value: 'ALL',          label: 'All Types' },
              { value: 'RAW_MATERIAL', label: 'Raw Material' },
              { value: 'STATIONARY',   label: 'Stationary' },
              { value: 'PACKAGING',    label: 'Packaging' },
            ] as { value: 'ALL' | DemandType; label: string }[]).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                  typeFilter === value
                    ? 'bg-[#d94040]/10 text-[#d94040] border-[#d94040]/30'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-3 space-y-3 pb-24">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No demands found</p>
          </div>
        )}

        {filtered.map((demand) => {
          const statusCfg = STATUS_BADGE[demand.status] ?? { label: demand.status, variant: 'secondary' as const };
          const canApprove = isManager && demand.status === 'PENDING_MANAGER';
          const canReceive = isManager && demand.status === 'APPROVED';

          return (
            <Card
              key={demand.id}
              className="active:scale-[0.98] transition-transform cursor-pointer"
              onClick={() => navigate(`/demands/${demand.id}`)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{demand.itemName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {demand.itemCode} · {demand.demandType?.replace('_', ' ')}
                    </p>
                  </div>
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {demand.status === 'COMPLETED' && demand.receivedQuantity != null && demand.receivedQuantity < demand.quantity ? (
                    <span className="font-medium">
                      <span className="text-amber-600">{demand.receivedQuantity}</span>
                      <span className="text-muted-foreground"> / {demand.quantity} {demand.unit}</span>
                    </span>
                  ) : (
                    <span className="font-medium text-foreground">
                      {demand.quantity} {demand.unit}
                    </span>
                  )}
                  <span>
                    Due {new Date(demand.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span>by {demand.requestedBy?.split('@')[0]}</span>
                </div>
                {demand.originalDemandId && (
                  <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
                    Remainder from demand {demand.originalDemandId}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${PRIORITY_COLOR[demand.priority]}`} />
                  <span className="text-xs text-muted-foreground">{demand.priority} priority</span>
                  {demand.notes && (
                    <span className="text-xs text-muted-foreground truncate">· {demand.notes}</span>
                  )}
                </div>

                {demand.rejectionComment && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
                    Rejected: {demand.rejectionComment}
                  </div>
                )}

                {/* Manager approval — direct, no bill */}
                {canApprove && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApprove(demand.id); }}
                      disabled={actionId === demand.id}
                      className="flex flex-1 items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-emerald-600 text-white text-xs font-medium transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {actionId === demand.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <><CheckCircle2 className="h-4 w-4" /> Approve</>
                      }
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setRejectTarget(demand.id); }}
                      disabled={actionId === demand.id}
                      className="flex flex-1 items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-medium transition-colors hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}

                {/* Mark as received — asks for bill then updates inventory */}
                {canReceive && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setReceiveTarget(demand); }}
                    disabled={actionId === demand.id}
                    className="flex w-full items-center justify-center gap-2 min-h-[44px] rounded-xl bg-blue-600 text-white text-xs font-medium transition-colors hover:bg-blue-700 disabled:opacity-50 mt-1"
                  >
                    {actionId === demand.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <><PackageCheck className="h-4 w-4" /> Mark as Received — Update Inventory</>
                    }
                  </button>
                )}
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
        aria-label="Create demand"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">New Demand</span>
      </button>

      {/* Modals */}
      {showCreate && (
        <CreateDemandModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {rejectTarget && (
        <RejectModal
          demandId={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onRejected={handleRejected}
        />
      )}

      {receiveTarget && (
        <BillUploadModal
          demand={receiveTarget}
          onClose={() => setReceiveTarget(null)}
          onConfirm={handleMarkReceived}
        />
      )}
    </div>
  );
}
