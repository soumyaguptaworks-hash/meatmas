import { Users, Package, ClipboardList, ShoppingBag, Trash2, ArrowUpRight, TrendingUp, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const KPI_CARDS = [
  {
    label: 'Total Users',
    value: '3',
    sub: '1 admin · 2 staff',
    up: true,
    change: '+1 this month',
    icon: Users,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Active Items',
    value: '14',
    sub: 'in item master',
    up: true,
    change: '+3 this week',
    icon: Package,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    label: 'Pending Demands',
    value: '4',
    sub: 'needs attention',
    up: false,
    change: '8 total demands',
    icon: ClipboardList,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    label: "Today's Orders",
    value: '0',
    sub: 'POS active',
    up: true,
    change: 'System running',
    icon: ShoppingBag,
    iconBg: 'bg-[#d94040]/10',
    iconColor: 'text-[#d94040]',
  },
  {
    label: 'Total Wastage',
    value: '19 kg',
    sub: '2 types tracked',
    up: false,
    change: 'Under threshold',
    icon: Trash2,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
  },
];

const RECENT_DEMANDS = [
  { id: 'D-004', item: 'Beef Mince',     qty: '100 kg', priority: 'URGENT',  status: 'PENDING',     by: 'Staff' },
  { id: 'D-001', item: 'Chicken Breast', qty: '50 kg',  priority: 'HIGH',    status: 'PENDING',     by: 'Manager' },
  { id: 'D-002', item: 'Mutton Leg',     qty: '30 kg',  priority: 'MEDIUM',  status: 'IN_PROGRESS', by: 'Staff' },
  { id: 'D-003', item: 'Pork Ribs',      qty: '40 kg',  priority: 'MEDIUM',  status: 'COMPLETED',   by: 'Manager' },
];

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
  URGENT: 'destructive',
  HIGH:   'warning',
  MEDIUM: 'info',
  LOW:    'secondary',
};

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'secondary'> = {
  PENDING:     'warning',
  IN_PROGRESS: 'info',
  COMPLETED:   'success',
  CANCELLED:   'secondary',
};

const SYSTEM_STATUS = [
  { label: 'Backend API',  status: 'online'  },
  { label: 'In-Memory DB', status: 'online'  },
  { label: 'POS Service',  status: 'online'  },
  { label: 'Mail Service', status: 'warning' },
  { label: 'Factory API',  status: 'online'  },
];

// Simple bar chart using CSS
const DEMAND_TREND = [
  { month: 'Jan', value: 60 },
  { month: 'Feb', value: 75 },
  { month: 'Mar', value: 55 },
  { month: 'Apr', value: 90 },
  { month: 'May', value: 70 },
  { month: 'Jun', value: 85 },
];

export function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Page greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{greeting}, Admin</h2>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening across MeatMaster today.</p>
        </div>
        <span className="text-xs text-gray-400 font-medium hidden sm:block">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPI_CARDS.map(({ label, value, sub, up, change, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-3xl font-bold text-gray-900 tracking-tight leading-none">{value}</p>
                <p className="text-sm font-medium text-gray-600 mt-1.5">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
            </div>
            <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-600' : 'text-gray-400'}`}>
              <TrendingUp className={`h-3 w-3 ${up ? '' : 'rotate-180 text-gray-400'}`} />
              {change}
            </div>
          </div>
        ))}
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Demand trend chart */}
        <div className="xl:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Monthly Demand Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-[#d94040] font-medium">
              <span className="h-2 w-2 rounded-full bg-[#d94040] inline-block" />
              Demands raised
            </span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-3 h-32">
            {DEMAND_TREND.map(({ month, value }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full relative flex items-end justify-center" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-lg bg-[#d94040]/15 hover:bg-[#d94040]/25 transition-colors"
                    style={{ height: `${value}%` }}
                  >
                    <div
                      className="w-full rounded-t-lg bg-[#d94040]"
                      style={{ height: '4px', marginTop: '-4px' }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">System Health</h3>
          <div className="space-y-2.5">
            {SYSTEM_STATUS.map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600">{label}</span>
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                  status === 'online'  ? 'text-emerald-600' :
                  status === 'warning' ? 'text-amber-600'   : 'text-red-500'
                }`}>
                  {status === 'online' ? (
                    <><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> Online</>
                  ) : status === 'warning' ? (
                    <><AlertCircle className="h-3.5 w-3.5" /> Config needed</>
                  ) : (
                    <><XCircle className="h-3.5 w-3.5" /> Offline</>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-[#d94040]/8 border border-[#d94040]/15 p-3.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#d94040] shrink-0" />
              <p className="text-xs font-semibold text-[#d94040]">Core services running</p>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Backend API healthy. Configure mail for OTP emails.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent Demands table */}
        <div className="xl:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Recent Demands</h3>
            <a href="/demand-approvals" className="text-xs text-[#d94040] font-medium hover:underline underline-offset-2 flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                {['ID', 'Item', 'Qty', 'Priority', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_DEMANDS.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{d.id}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{d.item}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-sm">{d.qty}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={PRIORITY_VARIANT[d.priority]}>{d.priority}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_VARIANT[d.status]}>{d.status.replace('_', ' ')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Review Demands',       href: '/demand-approvals',    icon: ClipboardList, color: 'text-amber-500',    bg: 'bg-amber-50'         },
              { label: 'Manage Users',          href: '/users',               icon: Users,         color: 'text-blue-500',     bg: 'bg-blue-50'          },
              { label: 'Browse Item Master',    href: '/item-master',         icon: Package,       color: 'text-emerald-500',  bg: 'bg-emerald-50'       },
              { label: 'Processing Pipeline',   href: '/processing-pipeline', icon: TrendingUp,    color: 'text-[#d94040]',    bg: 'bg-[#d94040]/10'     },
            ].map(({ label, href, icon: Icon, color, bg }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors group"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
