import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Plus, X, Trash2, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  factoryApi,
  type Batch,
  type BatchStatus,
  type BatchOutput,
  type CreateBatchBody,
} from '@/api/factory.api';

const STATUS_TABS: { label: string; value: BatchStatus | 'ALL' }[] = [
  { label: 'All',       value: 'ALL' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const STATUS_CONFIG: Record<BatchStatus, { label: string; variant: 'secondary' | 'info' | 'success' | 'destructive'; dot: string }> = {
  PREPARING:  { label: 'Preparing',  variant: 'secondary',   dot: 'bg-slate-400' },
  PROCESSING: { label: 'Processing', variant: 'info',        dot: 'bg-blue-500' },
  COMPLETED:  { label: 'Completed',  variant: 'success',     dot: 'bg-emerald-500' },
  CANCELLED:  { label: 'Cancelled',  variant: 'destructive', dot: 'bg-red-400' },
};

const UNITS = ['kg', 'g', 'pcs', 'litres'] as const;

// ─── Create Batch Modal ────────────────────────────────────────────────────

interface CreateBatchModalProps {
  onClose: () => void;
  onCreated: (b: Batch) => void;
}

function CreateBatchModal({ onClose, onCreated }: CreateBatchModalProps) {
  const [form, setForm] = useState<CreateBatchBody>({
    processingDate: new Date().toISOString().split('T')[0],
    inputItem: '',
    inputQuantity: 0,
    inputUnit: 'kg',
    outputs: [{ itemName: '', quantity: 0, unit: 'kg' }],
    wastage: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField<K extends keyof CreateBatchBody>(key: K, val: CreateBatchBody[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function updateLine(
    type: 'outputs' | 'wastage',
    index: number,
    field: keyof BatchOutput,
    value: string | number,
  ) {
    setForm((f) => {
      const arr = [...f[type]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...f, [type]: arr };
    });
  }

  function addLine(type: 'outputs' | 'wastage') {
    setForm((f) => ({
      ...f,
      [type]: [...f[type], { itemName: '', quantity: 0, unit: 'kg' }],
    }));
  }

  function removeLine(type: 'outputs' | 'wastage', index: number) {
    setForm((f) => ({
      ...f,
      [type]: f[type].filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit() {
    if (!form.inputItem.trim()) { setError('Input item is required.'); return; }
    if (!form.inputQuantity || form.inputQuantity <= 0) { setError('Input quantity must be > 0.'); return; }
    if (!form.processingDate) { setError('Processing date is required.'); return; }

    setError('');
    setSaving(true);
    try {
      const { data } = await factoryApi.createBatch(form);
      onCreated(data);
      onClose();
    } catch {
      setError('Failed to create batch. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-lg bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-base">New Processing Batch</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[72vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {/* Processing Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Processing Date
            </label>
            <Input
              type="date"
              inputMode="numeric"
              value={form.processingDate}
              onChange={(e) => setField('processingDate', e.target.value)}
            />
          </div>

          {/* Input Item */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Input Item
            </label>
            <Input
              placeholder="e.g. Chicken Breast (Raw)"
              value={form.inputItem}
              onChange={(e) => setField('inputItem', e.target.value)}
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
                onChange={(e) => setField('inputQuantity', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Unit
              </label>
              <div className="relative">
                <select
                  value={form.inputUnit}
                  onChange={(e) => setField('inputUnit', e.target.value)}
                  className="w-full appearance-none rounded-xl border bg-background px-3 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Output Lines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Output Items
              </label>
              <button
                type="button"
                onClick={() => addLine('outputs')}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                <Plus className="h-3.5 w-3.5" /> Add Output
              </button>
            </div>
            {form.outputs.map((out, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder="Item name"
                  value={out.itemName}
                  onChange={(e) => updateLine('outputs', idx, 'itemName', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Qty"
                  value={out.quantity || ''}
                  onChange={(e) => updateLine('outputs', idx, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-20"
                />
                <div className="relative w-20 shrink-0">
                  <select
                    value={out.unit}
                    onChange={(e) => updateLine('outputs', idx, 'unit', e.target.value)}
                    className="w-full appearance-none rounded-xl border bg-background px-2 py-2.5 text-sm focus:outline-none"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {form.outputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine('outputs', idx)}
                    className="p-1.5 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Wastage Lines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Wastage
              </label>
              <button
                type="button"
                onClick={() => addLine('wastage')}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                <Plus className="h-3.5 w-3.5" /> Add Wastage
              </button>
            </div>
            {form.wastage.map((w, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder="Waste item"
                  value={w.itemName}
                  onChange={(e) => updateLine('wastage', idx, 'itemName', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Qty"
                  value={w.quantity || ''}
                  onChange={(e) => updateLine('wastage', idx, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-20"
                />
                <div className="relative w-20 shrink-0">
                  <select
                    value={w.unit}
                    onChange={(e) => updateLine('wastage', idx, 'unit', e.target.value)}
                    className="w-full appearance-none rounded-xl border bg-background px-2 py-2.5 text-sm focus:outline-none"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeLine('wastage', idx)}
                  className="p-1.5 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {form.wastage.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No wastage lines added.</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={saving} onClick={handleSubmit}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Batch'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function Batches() {
  const [activeTab, setActiveTab] = useState<BatchStatus | 'ALL'>('ALL');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    factoryApi
      .getBatches(activeTab)
      .then(({ data }) => setBatches(data))
      .catch(() => setError('Could not load batches.'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  function handleCreated(newBatch: Batch) {
    setBatches((prev) => [newBatch, ...prev]);
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

        {!loading && !error && batches.length === 0 && (
          <div className="flex justify-center py-16">
            <p className="text-sm text-muted-foreground">No batches found</p>
          </div>
        )}

        {batches.map((batch) => {
          const cfg = STATUS_CONFIG[batch.status] ?? { label: batch.status, variant: 'secondary' as const, dot: 'bg-slate-400' };

          return (
            <Card key={batch.id}>
              <CardContent className="p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot} shrink-0`} />
                      <p className="font-semibold text-sm truncate">{batch.inputItem}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 pl-4">
                      #{batch.batchNumber} · {batch.processingDate}
                    </p>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>

                {/* Input */}
                <div className="text-xs text-muted-foreground">
                  Input:{' '}
                  <span className="font-medium text-foreground">
                    {batch.inputQuantity} {batch.inputUnit}
                  </span>
                </div>

                {/* Outputs */}
                {batch.outputs.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Outputs:</p>
                    {batch.outputs.map((o, i) => (
                      <p key={i} className="text-xs text-foreground pl-2">
                        {o.itemName} — {o.quantity} {o.unit}
                      </p>
                    ))}
                  </div>
                )}

                {/* Wastage */}
                {batch.wastage.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-600">Wastage:</p>
                    {batch.wastage.map((w, i) => (
                      <p key={i} className="text-xs text-amber-700 pl-2">
                        {w.itemName} — {w.quantity} {w.unit}
                      </p>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <p className="text-xs text-muted-foreground">
                  By {batch.performedBy} ·{' '}
                  {new Date(batch.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
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
        aria-label="Create batch"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">New Batch</span>
      </button>

      {showCreate && (
        <CreateBatchModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
