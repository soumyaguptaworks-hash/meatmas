import { useEffect, useState } from 'react';
import api from '@/api/axios';
import {
  Plus, Pencil, Trash2, GitBranch, Search, AlertTriangle, X, ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type OutputType = 'PROCESSED' | 'WASTAGE';
type Category = 'POULTRY' | 'RED_MEAT' | 'PORK' | 'SEAFOOD' | 'OTHER';

interface PipelineOutput {
  id: string;
  name: string;
  type: OutputType;
  yieldPct: number;
  unit: string;
}

interface Pipeline {
  id: string;
  inputMaterial: string;
  inputUnit: string;
  category: Category;
  outputs: PipelineOutput[];
  notes?: string;
}


// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<Category, string> = {
  POULTRY:  'Poultry',
  RED_MEAT: 'Red Meat',
  PORK:     'Pork',
  SEAFOOD:  'Seafood',
  OTHER:    'Other',
};

const CATEGORY_COLORS: Record<Category, string> = {
  POULTRY:  'bg-amber-100 text-amber-700',
  RED_MEAT: 'bg-red-100 text-red-700',
  PORK:     'bg-pink-100 text-pink-700',
  SEAFOOD:  'bg-blue-100 text-blue-700',
  OTHER:    'bg-gray-100 text-gray-600',
};

const OUTPUT_TYPE_COLORS: Record<OutputType, string> = {
  PROCESSED: '#22c55e',
  WASTAGE:   '#f97316',
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function YieldBar({ outputs }: { outputs: PipelineOutput[] }) {
  const total = outputs.reduce((s, o) => s + o.yieldPct, 0);
  if (outputs.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex h-5 w-full overflow-hidden rounded-full">
        {outputs.map((o) => (
          <div
            key={o.id}
            title={`${o.name}: ${o.yieldPct}%`}
            style={{
              width: `${(o.yieldPct / Math.max(total, 100)) * 100}%`,
              backgroundColor: OUTPUT_TYPE_COLORS[o.type],
              opacity: o.type === 'WASTAGE' ? 0.7 : 1,
            }}
          />
        ))}
        {total < 100 && (
          <div
            style={{ width: `${100 - total}%`, backgroundColor: '#e5e7eb' }}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
        {outputs.map((o) => (
          <span key={o.id} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: OUTPUT_TYPE_COLORS[o.type], opacity: o.type === 'WASTAGE' ? 0.7 : 1 }}
            />
            {o.name} ({o.yieldPct}%)
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Pipeline Modal ────────────────────────────────────────────────────────────

interface PipelineModalProps {
  initial?: Pipeline;
  onSave: (data: Omit<Pipeline, 'id' | 'outputs'>) => void;
  onClose: () => void;
}

function PipelineModal({ initial, onSave, onClose }: PipelineModalProps) {
  const [form, setForm] = useState({
    inputMaterial: initial?.inputMaterial ?? '',
    inputUnit:     initial?.inputUnit ?? 'kg',
    category:      initial?.category ?? 'RED_MEAT' as Category,
    notes:         initial?.notes ?? '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.inputMaterial.trim()) return;
    onSave(form as Omit<Pipeline, 'id' | 'outputs'>);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {initial ? 'Edit Pipeline' : 'New Pipeline'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Input Material <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.inputMaterial}
              onChange={e => setForm(f => ({ ...f, inputMaterial: e.target.value }))}
              placeholder="e.g. Whole Chicken"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={form.inputUnit}
                onChange={e => setForm(f => ({ ...f, inputUnit: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {['kg', 'g', 'lbs', 'pcs', 'litre'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <Input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes…"
              className="h-9 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-[#d94040] hover:bg-[#c03535] text-white">
              {initial ? 'Save Changes' : 'Create Pipeline'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Output Modal ─────────────────────────────────────────────────────────────

interface OutputModalProps {
  pipelineUnit: string;
  initial?: PipelineOutput;
  onSave: (data: Omit<PipelineOutput, 'id'>) => void;
  onClose: () => void;
}

function OutputModal({ pipelineUnit, initial, onSave, onClose }: OutputModalProps) {
  const [form, setForm] = useState({
    name:     initial?.name ?? '',
    type:     initial?.type ?? 'PROCESSED' as OutputType,
    yieldPct: initial?.yieldPct ?? 0,
    unit:     initial?.unit ?? pipelineUnit,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.yieldPct <= 0) return;
    onSave(form as Omit<PipelineOutput, 'id'>);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {initial ? 'Edit Output' : 'Add Output'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Output Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Chicken Breast"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as OutputType }))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="PROCESSED">Processed</option>
                <option value="WASTAGE">Wastage</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {['kg', 'g', 'lbs', 'pcs', 'litre'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Typical Yield % <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                min={1}
                max={100}
                value={form.yieldPct || ''}
                onChange={e => setForm(f => ({ ...f, yieldPct: Number(e.target.value) }))}
                placeholder="0"
                className="h-9 text-sm pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-[#d94040] hover:bg-[#c03535] text-white">
              {initial ? 'Save Changes' : 'Add Output'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ProcessingPipeline() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Pipeline modal
  const [pipelineModal, setPipelineModal] = useState<'create' | Pipeline | null>(null);
  // Output modal
  const [outputModal, setOutputModal] = useState<'create' | PipelineOutput | null>(null);

  useEffect(() => {
    api.get<Pipeline[]>('/factory/pipelines')
      .then(({ data }) => {
        setPipelines(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = pipelines.find(p => p.id === selectedId) ?? null;
  const filtered = pipelines.filter(p =>
    p.inputMaterial.toLowerCase().includes(search.toLowerCase()) ||
    CATEGORY_LABELS[p.category as Category].toLowerCase().includes(search.toLowerCase())
  );

  // ── Pipeline CRUD ──────────────────────────────────────────────────────────

  async function savePipeline(data: Omit<Pipeline, 'id' | 'outputs'>) {
    if (pipelineModal === 'create') {
      const { data: newP } = await api.post<Pipeline>('/factory/pipelines', { ...data, outputs: [] });
      setPipelines(ps => [...ps, newP]);
      setSelectedId(newP.id);
    } else if (pipelineModal) {
      const { data: updated } = await api.patch<Pipeline>(`/factory/pipelines/${pipelineModal.id}`, data);
      setPipelines(ps => ps.map(p => p.id === updated.id ? updated : p));
    }
    setPipelineModal(null);
  }

  async function deletePipeline(id: string) {
    if (!confirm('Delete this pipeline?')) return;
    await api.delete(`/factory/pipelines/${id}`);
    setPipelines(ps => ps.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(pipelines.find(p => p.id !== id)?.id ?? null);
  }

  // ── Output CRUD ────────────────────────────────────────────────────────────

  async function saveOutput(data: Omit<PipelineOutput, 'id'>) {
    if (!selected) return;
    let newOutputs: PipelineOutput[];
    if (outputModal === 'create') {
      newOutputs = [...selected.outputs, { id: uid(), ...data }];
    } else if (outputModal) {
      newOutputs = selected.outputs.map(o => o.id === outputModal.id ? { ...o, ...data } : o);
    } else {
      return;
    }
    const { data: updated } = await api.patch<Pipeline>(`/factory/pipelines/${selected.id}/outputs`, { outputs: newOutputs });
    setPipelines(ps => ps.map(p => p.id === updated.id ? updated : p));
    setOutputModal(null);
  }

  async function deleteOutput(outputId: string) {
    if (!selected) return;
    const newOutputs = selected.outputs.filter(o => o.id !== outputId);
    const { data: updated } = await api.patch<Pipeline>(`/factory/pipelines/${selected.id}/outputs`, { outputs: newOutputs });
    setPipelines(ps => ps.map(p => p.id === updated.id ? updated : p));
  }

  const totalYield = selected?.outputs.reduce((s, o) => s + o.yieldPct, 0) ?? 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#d94040]" />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-0 overflow-hidden">

      {/* ── Left panel ── */}
      <div className="flex w-72 shrink-0 flex-col border-r border-gray-100 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Pipelines</p>
          <button
            onClick={() => setPipelineModal('create')}
            className="flex items-center gap-1 text-xs font-medium text-[#d94040] hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
          {filtered.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-8">No pipelines found</p>
          )}
          {filtered.map(p => {
            const total = p.outputs.reduce((s, o) => s + o.yieldPct, 0);
            const isActive = p.id === selectedId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-100',
                  isActive ? 'bg-primary/10' : 'hover:bg-gray-50',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium truncate', isActive ? 'text-[#d94040]' : 'text-gray-800')}>
                      {p.inputMaterial}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', CATEGORY_COLORS[p.category])}>
                        {CATEGORY_LABELS[p.category]}
                      </span>
                      <span className="text-[10px] text-gray-400">{p.outputs.length} outputs · {total}%</span>
                    </div>
                  </div>
                  <ChevronRight className={cn('h-3.5 w-3.5 mt-1 shrink-0', isActive ? 'text-[#d94040]' : 'text-gray-300')} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 overflow-y-auto bg-[#f7f7f8] p-6">
        {!selected ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <GitBranch className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Select a pipeline to view details</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl space-y-5">

            {/* Pipeline header card */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.inputMaterial}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', CATEGORY_COLORS[selected.category])}>
                      {CATEGORY_LABELS[selected.category]}
                    </span>
                    <span className="text-xs text-gray-400">Input unit: <strong className="text-gray-600">{selected.inputUnit}</strong></span>
                  </div>
                  {selected.notes && (
                    <p className="text-xs text-gray-400 mt-1.5">{selected.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setPipelineModal(selected)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => deletePipeline(selected.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>

              {/* Yield bar */}
              {selected.outputs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-500">Yield Breakdown</p>
                    {totalYield !== 100 && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="h-3 w-3" />
                        Total {totalYield}% — should sum to 100%
                      </span>
                    )}
                    {totalYield === 100 && (
                      <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                        ✓ 100% accounted
                      </span>
                    )}
                  </div>
                  <YieldBar outputs={selected.outputs} />
                </div>
              )}
            </div>

            {/* Outputs table card */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Output Products</p>
                <button
                  onClick={() => setOutputModal('create')}
                  className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#d94040] hover:bg-[#c03535] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Output
                </button>
              </div>

              {selected.outputs.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400">No outputs defined yet</p>
                  <p className="text-xs text-gray-300 mt-1">Click "Add Output" to define what this material produces</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Output Name</th>
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Yield %</th>
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                      <th className="px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selected.outputs.map((o, idx) => (
                      <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3 text-xs text-gray-400">{idx + 1}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: OUTPUT_TYPE_COLORS[o.type], opacity: o.type === 'WASTAGE' ? 0.7 : 1 }}
                            />
                            <span className="font-medium text-gray-800">{o.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded-full',
                            o.type === 'PROCESSED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                          )}>
                            {o.type === 'PROCESSED' ? 'Processed' : 'Wastage'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="font-semibold text-gray-800">{o.yieldPct}</span>
                          <span className="text-gray-400 text-xs ml-0.5">%</span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{o.unit}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setOutputModal(o)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteOutput(o.id)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-100">
                    <tr>
                      <td colSpan={3} className="px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</td>
                      <td className="px-5 py-2.5 text-right">
                        <span className={cn('font-bold text-sm', totalYield === 100 ? 'text-green-600' : 'text-amber-600')}>
                          {totalYield}%
                        </span>
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {pipelineModal && (
        <PipelineModal
          initial={pipelineModal === 'create' ? undefined : pipelineModal}
          onSave={savePipeline}
          onClose={() => setPipelineModal(null)}
        />
      )}
      {outputModal && selected && (
        <OutputModal
          pipelineUnit={selected.inputUnit}
          initial={outputModal === 'create' ? undefined : outputModal}
          onSave={saveOutput}
          onClose={() => setOutputModal(null)}
        />
      )}
    </div>
  );
}
