import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, ClipboardList, Package, Trash2,
  ChevronRight, Loader2, Clock, TrendingUp, ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { factoryApi, type HomeStats, type InventoryItem } from '@/api/factory.api';
import { useAuthStore } from '@/store/auth.store';

// ─── Stat cards ───────────────────────────────────────────────────────────────

const STAT_CONFIG = [
  { key: 'activeBatches'  as const, label: 'Active Batches',  icon: FlaskConical,  iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   path: '/batches',   suffix: '',    trendUp: true,  trend: 'In production' },
  { key: 'pendingDemands' as const, label: 'Pending Demands', icon: ClipboardList, iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  path: '/demands',   suffix: '',    trendUp: false, trend: 'Needs attention' },
  { key: 'lowStockItems'  as const, label: 'Low Stock Items', icon: Package,       iconBg: 'bg-red-50',    iconColor: 'text-red-500',    path: '/inventory', suffix: '',    trendUp: false, trend: 'Below threshold' },
  { key: 'totalWastageKg' as const, label: 'Total Wastage',   icon: Trash2,        iconBg: 'bg-slate-100', iconColor: 'text-slate-500',  path: '/inventory', suffix: ' kg', trendUp: false, trend: 'Tracked & logged' },
];

const QUICK_ACTIONS = [
  { label: 'View Demands',    sub: 'See all production demands', path: '/demands',   iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  icon: ClipboardList },
  { label: 'Check Inventory', sub: 'Review stock levels',        path: '/inventory', iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   icon: Package },
  { label: 'Active Batches',  sub: 'Monitor production batches', path: '/batches',   iconBg: 'bg-violet-50', iconColor: 'text-violet-500', icon: FlaskConical },
  { label: 'Wastage Log',     sub: 'View waste from batches',    path: '/inventory', iconBg: 'bg-slate-100', iconColor: 'text-slate-500',  icon: Trash2 },
];

// ─── Weekly activity chart ────────────────────────────────────────────────────

const SVG_W = 700;
const SVG_H = 180;
const PAD_X = 40;
const PAD_Y = 20;
const CHART_H = SVG_H - PAD_Y * 2;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKLY = [
  { batches: 2, demands: 3 },
  { batches: 1, demands: 2 },
  { batches: 3, demands: 5 },
  { batches: 2, demands: 1 },
  { batches: 4, demands: 4 },
  { batches: 1, demands: 2 },
  { batches: 0, demands: 1 },
];
const MAX_V = 6;
const X_STEP = (SVG_W - 2 * PAD_X) / (DAYS.length - 1);
const BOTTOM = PAD_Y + CHART_H;

const cx = (i: number) => PAD_X + i * X_STEP;
const cy = (v: number) => PAD_Y + (1 - v / MAX_V) * CHART_H;

function smoothPath(pts: [number, number][]): string {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const c1x = ax + (bx - ax) / 3;
    const c2x = bx - (bx - ax) / 3;
    d += ` C${c1x.toFixed(1)},${ay.toFixed(1)} ${c2x.toFixed(1)},${by.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
  }
  return d;
}

function areaPath(pts: [number, number][], bottom: number): string {
  return `${smoothPath(pts)} L${pts.at(-1)![0].toFixed(1)},${bottom} L${pts[0][0].toFixed(1)},${bottom}Z`;
}

function WeeklyChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const bPts = WEEKLY.map((d, i) => [cx(i), cy(d.batches)] as [number, number]);
  const dPts = WEEKLY.map((d, i) => [cx(i), cy(d.demands)] as [number, number]);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Weekly Activity</h3>
          <p className="text-xs text-gray-400 mt-0.5">Batches processed & demands raised — last 7 days</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-[#d94040] font-medium">
            <span className="h-2 w-2 rounded-full bg-[#d94040] inline-block" />
            Batches
          </span>
          <span className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
            Demands
          </span>
        </div>
      </div>

      <div className="relative select-none">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H + 24}`}
          className="w-full"
          style={{ height: '220px' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hg-batch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d94040" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#d94040" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hg-demand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 2, 4, 6].map((v) => (
            <g key={v}>
              <line x1={PAD_X} y1={cy(v)} x2={SVG_W - PAD_X} y2={cy(v)} stroke="#f1f5f9" strokeWidth="1" />
              <text x={PAD_X - 6} y={cy(v) + 4} textAnchor="end" fontSize="9" fill="#cbd5e1">{v}</text>
            </g>
          ))}

          {/* Area fills */}
          <path d={areaPath(bPts, BOTTOM)} fill="url(#hg-batch)" />
          <path d={areaPath(dPts, BOTTOM)} fill="url(#hg-demand)" />

          {/* Lines */}
          <path d={smoothPath(bPts)} fill="none" stroke="#d94040" strokeWidth="2.5" strokeLinecap="round" />
          <path d={smoothPath(dPts)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />

          {/* Day labels */}
          {DAYS.map((day, i) => (
            <text key={day} x={cx(i)} y={SVG_H + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">{day}</text>
          ))}

          {/* Interactive zones + dots */}
          {WEEKLY.map((d, i) => (
            <g key={i}>
              <rect
                x={cx(i) - X_STEP / 2} y={PAD_Y}
                width={X_STEP} height={CHART_H}
                fill="transparent" style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {hovered === i && (
                <line
                  x1={cx(i)} y1={PAD_Y} x2={cx(i)} y2={BOTTOM}
                  stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3,2"
                />
              )}
              <circle
                cx={cx(i)} cy={cy(d.batches)}
                r={hovered === i ? 5 : 3.5}
                fill={hovered === i ? '#d94040' : 'white'}
                stroke="#d94040" strokeWidth="2.5"
                style={{ transition: 'r 0.15s, fill 0.15s', cursor: 'crosshair' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              <circle
                cx={cx(i)} cy={cy(d.demands)}
                r={hovered === i ? 5 : 3.5}
                fill={hovered === i ? '#3b82f6' : 'white'}
                stroke="#3b82f6" strokeWidth="2.5"
                style={{ transition: 'r 0.15s, fill 0.15s', cursor: 'crosshair' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hovered !== null && (
          <div
            className="absolute top-1 pointer-events-none z-10"
            style={{
              left: `calc(${(cx(hovered) / SVG_W) * 100}%)`,
              transform: hovered < 3 ? 'translateX(10px)' : 'translateX(calc(-100% - 10px))',
            }}
          >
            <div className="bg-gray-900 text-white rounded-xl px-3 py-2.5 shadow-xl text-xs whitespace-nowrap">
              <p className="font-semibold text-gray-300 mb-1.5 text-[11px]">{DAYS[hovered]}</p>
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d94040] shrink-0" />
                  Batches: <span className="font-bold">{WEEKLY[hovered].batches}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                  Demands: <span className="font-bold">{WEEKLY[hovered].demands}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stock health bars ─────────────────────────────────────────────────────────

const STOCK_CFG: Record<string, { bar: string; text: string; bg: string }> = {
  CRITICAL: { bar: 'bg-red-500',     text: 'text-red-600',     bg: 'bg-red-50'     },
  LOW:      { bar: 'bg-amber-500',   text: 'text-amber-600',   bg: 'bg-amber-50'   },
  ADEQUATE: { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  EXCESS:   { bar: 'bg-blue-500',    text: 'text-blue-600',    bg: 'bg-blue-50'    },
};
const STOCK_ORDER: Record<string, number> = { CRITICAL: 0, LOW: 1, ADEQUATE: 2, EXCESS: 3 };

interface StockHealthProps { items: InventoryItem[]; loading: boolean; }

function StockHealth({ items, loading }: StockHealthProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sorted = [...items]
    .sort((a, b) => (STOCK_ORDER[a.stockLevel] ?? 4) - (STOCK_ORDER[b.stockLevel] ?? 4))
    .slice(0, 7);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Stock Health</h3>
        <p className="text-xs text-gray-400 mt-0.5">Raw material levels vs. max threshold</p>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">No inventory data</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => {
            const pct = item.maxThreshold > 0
              ? Math.min((item.currentStock / item.maxThreshold) * 100, 100)
              : 0;
            const cfg = STOCK_CFG[item.stockLevel] ?? STOCK_CFG.ADEQUATE;
            const isHov = hoveredId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl px-2.5 py-2 transition-colors ${isHov ? 'bg-gray-50' : ''}`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-700 truncate max-w-[130px]">{item.itemName}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isHov && (
                      <span className="text-[10px] text-gray-400">
                        {item.currentStock}/{item.maxThreshold} {item.unit}
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {item.stockLevel}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cfg.bar}`}
                    style={{ width: `${pct}%`, transition: 'width 0.7s ease' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invLoading, setInvLoading] = useState(true);

  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    factoryApi.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ activeBatches: 0, pendingDemands: 0, lowStockItems: 0, completedToday: 0, pendingManagerCount: 0, pendingAdminCount: 0, totalWastageKg: 0, totalWastageItems: 0 }))
      .finally(() => setStatsLoading(false));

    factoryApi.getInventory('RAW_MATERIAL')
      .then(({ data }) => setInventory(data))
      .catch(() => setInventory([]))
      .finally(() => setInvLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1400px] pb-24 md:pb-6">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {greeting}, <span className="capitalize">{firstName}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Here's what's happening on the factory floor today.
          </p>
        </div>
        <span className="text-xs text-gray-400 font-medium hidden sm:block">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Alert banners */}
      {isManager && stats && (stats.pendingManagerCount ?? 0) > 0 && (
        <button
          onClick={() => navigate('/demands')}
          className="w-full text-left rounded-2xl border-l-4 border-[#d94040] bg-[#d94040]/5 p-4 flex items-center justify-between hover:bg-[#d94040]/8 transition-colors"
        >
          <p className="text-sm font-semibold text-[#d94040] flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {stats.pendingManagerCount} demand{stats.pendingManagerCount > 1 ? 's' : ''} awaiting your approval
          </p>
          <ChevronRight className="h-5 w-5 text-[#d94040] shrink-0" />
        </button>
      )}

      {stats && stats.lowStockItems > 0 && (
        <button
          onClick={() => navigate('/inventory')}
          className="w-full text-left rounded-2xl border-l-4 border-red-400 bg-red-50 p-4 flex items-center justify-between hover:bg-red-100/70 transition-colors"
        >
          <p className="text-sm font-semibold text-red-700">
            {stats.lowStockItems} item{stats.lowStockItems > 1 ? 's' : ''} running low — click to review inventory
          </p>
          <ChevronRight className="h-5 w-5 text-red-400 shrink-0" />
        </button>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon, iconBg, iconColor, path, suffix, trendUp, trend }) => (
          <button
            key={key}
            onClick={() => navigate(path)}
            className="text-left rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {statsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-300 my-1" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 tracking-tight leading-none">
                    {stats?.[key] ?? '—'}
                    <span className="text-sm font-normal text-gray-400">{suffix}</span>
                  </p>
                )}
                <p className="text-sm font-medium text-gray-600 mt-1.5">{label}</p>
              </div>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
            </div>
            <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-gray-400'}`}>
              <TrendingUp className={`h-3 w-3 ${!trendUp ? 'rotate-180' : ''}`} />
              {trend}
            </div>
          </button>
        ))}
      </div>

      {/* Weekly activity chart — full width */}
      <WeeklyChart />

      {/* Bottom row: Stock Health + Quick Actions + Demand Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        <StockHealth items={inventory} loading={invLoading} />

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Quick Actions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Jump to key sections</p>
          </div>
          <div className="space-y-1">
            {QUICK_ACTIONS.map(({ label, sub, path, iconBg, iconColor, icon: Icon }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors group"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{sub}</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Demand Status</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Pending Manager', value: stats?.pendingManagerCount ?? 0, dot: 'bg-amber-500',   text: 'text-amber-600' },
              { label: 'Pending Admin',   value: stats?.pendingAdminCount ?? 0,   dot: 'bg-blue-500',    text: 'text-blue-600' },
              { label: 'Low Stock Items', value: stats?.lowStockItems ?? 0,       dot: 'bg-red-500',     text: 'text-red-600' },
              { label: 'Completed Today', value: stats?.completedToday ?? 0,      dot: 'bg-emerald-500', text: 'text-emerald-600' },
            ].map(({ label, value, dot, text }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dot} shrink-0`} />
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <span className={`text-sm font-bold ${text}`}>
                  {statsLoading ? '—' : value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-[#d94040]/8 border border-[#d94040]/15 p-3.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#d94040] shrink-0" />
              <p className="text-xs font-semibold text-[#d94040]">Factory floor active</p>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {isManager
                ? 'Manager access enabled. Review pending approvals above.'
                : 'Contact your manager to raise or escalate demands.'}
            </p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="flex justify-start">
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d94040]" />
          {user?.role?.replace('_', ' ')} · FACTORY
        </Badge>
      </div>
    </div>
  );
}
