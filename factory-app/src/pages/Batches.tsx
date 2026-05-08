import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Plus, X, Trash2, ChevronDown, GitBranch } from 'lucide-react';
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
  type Pipeline,
} from '@/api/factory.api';

const STATUS_TABS: { label: string; value: BatchStatus | 'ALL' }[] = [
  { label: 'All',        value: 'ALL' },
  { label: 'Preparing',  value: 'PREPARING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed',  value: 'COMPLETED' },
  { label: 'Cancelled',  value: 'CANCELLED' },
];

const STATUS_CONFIG: Record<BatchStatus, { label: string; variant: 'secondary' | 'info' | 'success' | 'destructive'; dot: string }> = {
  PREPARING:  { label: 'Preparing',  variant: 'secondary',   dot: 'bg-slate-400' },
  PROCESSING: { label: 'Processing', variant: 'info',        dot: 'bg-blue-500' },
  COMPLETED:  { label: 'Completed',  variant: 'success',     dot: 'bg-emerald-500' },
  CANCELLED:  { label: 'Cancelled',  variant: 'destructive', dot: 'bg-red-400' },
};

const UNITS = ['kg', 'g', 'pcs', 'litres'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcOutputs(pipeline: Pipeline, qty: number): { outputs: BatchOutput[]; wastage: BatchOutput[] } {
  const round = (n: number) => Math.round(n * 100) / 100;
  const outputs = pipeline.outputs
    .filter((o) => o.type === 'PROCESSED')
    .map((o) => ({ itemName: o.name, quantity: qty > 0 ? round(qty * o.yieldPct / 100) : 0, unit: o.unit }));
  const wastage = pipeline.outputs
    .filter((o) => o.type === 'WASTAGE')
    .map((o) => ({ itemName: o.name, quantity: qty > 0 ? round(qty * o.yieldPct / 100) : 0, unit: o.unit }));
  return {
    outputs: outputs.length > 0 ? outputs : [{ itemName: '', quantity: 0, unit: 'kg' }],
    wastage,
  };
}

// ─── Create Batch Modal ────────────────────────────────────────────────────────

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

  // Pipeline state
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    factoryApi.getPipelines().then(({ data }) => setPipelines(data)).catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredPipelines = pipelines.filter((p) =>
    p.inputMaterial.toLowerCase().includes(inputValue.toLowerCase())
  );

  function selectPipeline(p: Pipeline) {
    const { outputs, wastage } = calcOutputs(p, form.inputQuantity);
    setActivePipeline(p);
    setForm((f) => ({ ...f, inputItem: p.inputMaterial, inputUnit: p.inputUnit, outputs, wastage }));
    setInputValue(p.inputMaterial);
    setShowDropdown(false);
  }

  function clearPipeline() {
    setActivePipeline(null);
    setInputValue('');
    setForm((f) => ({
      ...f,
      inputItem: '',
      outputs: [{ itemName: '', quantity: 0, unit: 'kg' }],
      wastage: [],
    }));
  }

  function handleQuantityChange(qty: number) {
    if (activePipeline) {
      const { outputs, wastage } = calcOutputs(activePipeline, qty);
      setForm((f) => ({ ...f, inputQuantity: qty, outputs, wastage }));
    } else {
      setForm((f) => ({ ...f, inputQuantity: qty }));
    }
  }

  function setField<K extends keyof CreateBatchBody>(key: K, val: CreateBatchBody[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function updateLine(type: 'outputs' | 'wastage', index: number, field: keyof BatchOutput, value: string | number) {
    setForm((f) => {
      const arr = [...f[type]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...f, [type]: arr };
    });
  }

  function addLine(type: 'outputs' | 'wastage') {
    setForm((f) => ({ ...f, [type]: [...f[type], { itemName: '', quantity: 0, unit: 'kg' }] }));
  }

  function removeLine(type: 'outputs' | 'wastage', index: number) {
    setForm((f) => ({ ...f, [type]: f[type].filter((_, i) => i !== index) }));
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
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
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
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Processing Date</label>
            <Input
              type="date"
              inputMode="numeric"
              value={form.processingDate}
              onChange={(e) => setField('processingDate', e.target.value)}
            />
          </div>

          {/* Input Item — combobox */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Input Item</label>
            <div className="relative" ref={dropdownRef}>
              <Input
                placeholder="Type to search pipeline…"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setField('inputItem', e.target.value);
                  setShowDropdown(true);
                  if (activePipeline && e.target.value !== activePipeline.inputMaterial) {
                    setActivePipeline(null);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                className={activePipeline ? 'pr-8 border-green-400 bg-green-50/40' : ''}
              />
              {activePipeline && (
                <button
                  type="button"
                  onClick={clearPipeline}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-600 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Dropdown */}
              {showDropdown && !activePipeline && filteredPipelines.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-background border rounded-xl shadow-lg overflow-hidden">
                  {filteredPipelines.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); selectPipeline(p); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors border-b last:border-0"
                    >
                      <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.inputMaterial}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {p.outputs.filter(o => o.type === 'PROCESSED').length} products · {p.outputs.filter(o => o.type === 'WASTAGE').length} wastage · {p.inputUnit}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active pipeline badge */}
            {activePipeline && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
                <GitBranch className="h-3.5 w-3.5 shrink-0" />
                <span>Pipeline applied: <strong>{activePipeline.inputMaterial}</strong> — outputs auto-calculated</span>
              </div>
            )}
          </div>

          {/* Input Qty + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Input Quantity</label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.inputQuantity || ''}
                onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unit</label>
              <div className="relative">
                <select
                  value={form.inputUnit}
                  onChange={(e) => setField('inputUnit', e.target.value)}
                  disabled={!!activePipeline}
                  className="w-full appearance-none rounded-xl border bg-background px-3 py-2.5 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
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
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Output Items</label>
              {!activePipeline && (
                <button type="button" onClick={() => addLine('outputs')} className="flex items-center gap-1 text-xs text-primary font-medium">
                  <Plus className="h-3.5 w-3.5" /> Add Output
                </button>
              )}
            </div>
            {form.outputs.map((out, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                {activePipeline ? (
                  <div className="flex-1 rounded-xl border bg-muted/30 px-3 py-2.5 text-sm text-foreground">
                    {out.itemName}
                  </div>
                ) : (
                  <Input
                    placeholder="Item name"
                    value={out.itemName}
                    onChange={(e) => updateLine('outputs', idx, 'itemName', e.target.value)}
                    className="flex-1"
                  />
                )}
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
                    disabled={!!activePipeline}
                    className="w-full appearance-none rounded-xl border bg-background px-2 py-2.5 text-sm focus:outline-none disabled:opacity-60"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {!activePipeline && form.outputs.length > 1 && (
                  <button type="button" onClick={() => removeLine('outputs', idx)} className="p-1.5 text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Wastage Lines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-amber-600 uppercase tracking-wide text-xs font-medium">Wastage</label>
              {!activePipeline && (
                <button type="button" onClick={() => addLine('wastage')} className="flex items-center gap-1 text-xs text-primary font-medium">
                  <Plus className="h-3.5 w-3.5" /> Add Wastage
                </button>
              )}
            </div>
            {form.wastage.map((w, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                {activePipeline ? (
                  <div className="flex-1 rounded-xl border border-amber-200 bg-amber-50/40 px-3 py-2.5 text-sm text-amber-800">
                    {w.itemName}
                  </div>
                ) : (
                  <Input
                    placeholder="Waste item"
                    value={w.itemName}
                    onChange={(e) => updateLine('wastage', idx, 'itemName', e.target.value)}
                    className="flex-1"
                  />
                )}
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
                    disabled={!!activePipeline}
                    className="w-full appearance-none rounded-xl border bg-background px-2 py-2.5 text-sm focus:outline-none disabled:opacity-60"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {!activePipeline && (
                  <button type="button" onClick={() => removeLine('wastage', idx)} className="p-1.5 text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {form.wastage.length === 0 && !activePipeline && (
              <p className="text-xs text-muted-foreground italic">No wastage lines added.</p>
            )}
            {form.wastage.length === 0 && activePipeline && (
              <p className="text-xs text-muted-foreground italic">No wastage defined in this pipeline.</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" disabled={saving} onClick={handleSubmit}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Batch'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function Batches() {
  const navigate = useNavigate();
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
                activeTab === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
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
            <Card key={batch.id} className="cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/batches/${batch.id}`)}>
              <CardContent className="p-4 space-y-3">
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

                <div className="text-xs text-muted-foreground">
                  Input: <span className="font-medium text-foreground">{batch.inputQuantity} {batch.inputUnit}</span>
                </div>

                {batch.outputs.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Outputs:</p>
                    {batch.outputs.map((o, i) => (
                      <p key={i} className="text-xs text-foreground pl-2">{o.itemName} — {o.quantity} {o.unit}</p>
                    ))}
                  </div>
                )}

                {batch.wastage.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-600">Wastage:</p>
                    {batch.wastage.map((w, i) => (
                      <p key={i} className="text-xs text-amber-700 pl-2">{w.itemName} — {w.quantity} {w.unit}</p>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  By {batch.performedBy} · {new Date(batch.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
        <CreateBatchModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
