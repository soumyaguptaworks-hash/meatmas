import { Users, Package, ClipboardList, TrendingUp, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, AlertCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const KPI_CARDS = [
  {
    label: 'Total Users',
    value: '3',
    change: '+1 this month',
    up: true,
    icon: Users,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Active Items',
    value: '14',
    change: '+3 this week',
    up: true,
    icon: Package,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    label: 'Pending Demands',
    value: '2',
    change: '4 total demands',
    up: false,
    icon: ClipboardList,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    label: "Today's Orders",
    value: '0',
    change: 'POS active',
    up: true,
    icon: ShoppingBag,
    iconBg: 'bg-primary/10',
    iconColor: 'text-[#d94040]',
  },
  {
    label: 'Total Wastage',
    value: '19 kg',
    change: '2 waste types tracked',
    up: false,
    icon: Trash2,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
  },
];

const RECENT_DEMANDS = [
  { id: 'D-004', item: 'Beef Mince',    qty: '100 kg', priority: 'URGENT',  status: 'PENDING',      by: 'Store Manager' },
  { id: 'D-001', item: 'Chicken Breast',qty: '50 kg',  priority: 'HIGH',    status: 'PENDING',      by: 'Store Manager' },
  { id: 'D-002', item: 'Mutton Leg',    qty: '30 kg',  priority: 'MEDIUM',  status: 'IN_PROGRESS',  by: 'POS Operator' },
  { id: 'D-003', item: 'Pork Ribs',     qty: '20 kg',  priority: 'LOW',     status: 'COMPLETED',    by: 'Warehouse' },
];

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
  URGENT: 'destructive',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'secondary',
};

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'secondary'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'secondary',
};

const SYSTEM_STATUS = [
  { label: 'Backend API',   status: 'online',  icon: CheckCircle2 },
  { label: 'SQLite DB',     status: 'online',  icon: CheckCircle2 },
  { label: 'POS Service',   status: 'online',  icon: CheckCircle2 },
  { label: 'Mail Service',  status: 'warning', icon: AlertCircle },
  { label: 'Factory API',   status: 'online',  icon: CheckCircle2 },
];

export function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Welcome banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{greeting}, Admin 👋</h2>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening across MeatMaster today.</p>
        </div>
        <div className="text-xs text-gray-400 font-medium">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {KPI_CARDS.map(({ label, value, change, up, icon: Icon, iconBg, iconColor }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
                <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
                <p className="text-xs text-gray-400 mt-1">{change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-3 gap-5">
        {/* Recent Demands */}
        <Card className="col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Demands</CardTitle>
              <a href="/demand-approvals" className="text-xs text-primary font-medium hover:underline">
                View all →
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">ID</th>
                  <th className="text-left py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Item</th>
                  <th className="text-left py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Qty</th>
                  <th className="text-left py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Priority</th>
                  <th className="text-left py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_DEMANDS.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-mono text-xs text-gray-400">{d.id}</td>
                    <td className="py-3 font-medium text-gray-800">{d.item}</td>
                    <td className="py-3 text-gray-500">{d.qty}</td>
                    <td className="py-3">
                      <Badge variant={PRIORITY_VARIANT[d.priority]}>{d.priority}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={STATUS_VARIANT[d.status]}>
                        {d.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {SYSTEM_STATUS.map(({ label, status, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-600">{label}</span>
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                  status === 'online' ? 'text-emerald-600' : status === 'warning' ? 'text-amber-600' : 'text-red-500'
                }`}>
                  {status === 'online'
                    ? <><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> Online</>
                    : status === 'warning'
                    ? <><AlertCircle className="h-3.5 w-3.5" /> Config needed</>
                    : <><XCircle className="h-3.5 w-3.5" /> Offline</>
                  }
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-xl bg-primary/8 border border-primary/20 p-3.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#d94040]" />
                <p className="text-xs font-semibold text-[#d94040]">All core services running</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Backend API and database are healthy. Configure mail service to enable OTP emails.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Add New User',    icon: Users,         href: '/users',            color: 'text-blue-500',    bg: 'bg-blue-50'  },
          { label: 'Add Item',        icon: Package,       href: '/item-master',      color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Review Demands',  icon: ClipboardList, href: '/demand-approvals', color: 'text-amber-500',   bg: 'bg-amber-50' },
          { label: 'View Orders',     icon: ShoppingBag,   href: '#',                 color: 'text-[#d94040]',   bg: 'bg-primary/10' },
        ].map(({ label, icon: Icon, href, color, bg }) => (
          <a
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-4.5 w-4.5 ${color} h-[18px] w-[18px]`} />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}
