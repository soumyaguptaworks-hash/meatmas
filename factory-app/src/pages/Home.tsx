import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  ClipboardList,
  Package,
  Trash2,
  ChevronRight,
  Loader2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { factoryApi, type HomeStats } from '@/api/factory.api';
import { useAuthStore } from '@/store/auth.store';

const STAT_CONFIG = [
  { key: 'activeBatches',  label: 'Active Batches',  icon: FlaskConical,  color: 'text-blue-600',    bg: 'bg-blue-50',    path: '/batches',   suffix: '' },
  { key: 'pendingDemands', label: 'Pending Demands',  icon: ClipboardList, color: 'text-amber-600',   bg: 'bg-amber-50',   path: '/demands',   suffix: '' },
  { key: 'lowStockItems',  label: 'Low Stock',        icon: Package,       color: 'text-red-600',     bg: 'bg-red-50',     path: '/inventory', suffix: '' },
  { key: 'totalWastageKg', label: 'Total Wastage',    icon: Trash2,        color: 'text-slate-600',   bg: 'bg-slate-100',  path: '/inventory', suffix: ' kg' },
] as const;

const QUICK_ACTIONS = [
  { label: 'View Demands',    sub: 'See all production demands',  path: '/demands',   color: 'bg-amber-500' },
  { label: 'Check Inventory', sub: 'Review stock levels',         path: '/inventory', color: 'bg-blue-500' },
  { label: 'Active Batches',  sub: 'Monitor production batches',  path: '/batches',   color: 'bg-violet-500' },
  { label: 'Packaging',       sub: 'Packaging orders & runs',     path: '/packaging', color: 'bg-emerald-500' },
  { label: 'Wastage Log',     sub: 'View all waste from batches', path: '/inventory', color: 'bg-slate-500' },
];

export function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    factoryApi.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {
        setStats({
          activeBatches: 0,
          pendingDemands: 0,
          lowStockItems: 0,
          completedToday: 0,
          pendingManagerCount: 0,
          pendingAdminCount: 0,
          totalWastageKg: 0,
          totalWastageItems: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="px-4 py-5 space-y-6 pb-4 max-w-2xl mx-auto">
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm">{greeting},</p>
        <h2 className="text-xl font-bold capitalize">{firstName}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Manager: Approval alerts */}
      {isManager && stats && (stats.pendingManagerCount ?? 0) > 0 && (
        <button
          onClick={() => navigate('/demands')}
          className="w-full text-left rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-amber-700 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {stats.pendingManagerCount} demand{(stats.pendingManagerCount ?? 0) > 1 ? 's' : ''} awaiting your approval
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Tap to review and approve</p>
          </div>
          <ChevronRight className="h-5 w-5 text-amber-500 shrink-0" />
        </button>
      )}

      {/* Stats grid */}
      <div>
        <p className="text-sm font-semibold mb-3">Today's Overview</p>
        <div className="grid grid-cols-2 gap-3">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg, path, suffix }) => (
            <button
              key={key}
              onClick={() => path && navigate(path)}
              className="text-left"
            >
              <Card className="active:scale-[0.97] transition-transform">
                <CardContent className="p-4 space-y-2">
                  <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {stats?.[key] ?? '—'}<span className="text-sm font-normal text-muted-foreground">{suffix}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {/* Manager extra stats */}
      {isManager && stats && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-2xl font-bold">{stats?.pendingManagerCount ?? 0}</p>
              )}
              <p className="text-xs text-muted-foreground leading-tight">Needs Your Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
                <AlertTriangle className="h-5 w-5 text-violet-600" />
              </div>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <p className="text-2xl font-bold">{stats?.pendingAdminCount ?? 0}</p>
              )}
              <p className="text-xs text-muted-foreground leading-tight">Awaiting Admin</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert banner for low stock */}
      {stats && stats.lowStockItems > 0 && (
        <button
          onClick={() => navigate('/inventory')}
          className="w-full text-left rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-red-700">
              {stats.lowStockItems} item{stats.lowStockItems > 1 ? 's' : ''} running low
            </p>
            <p className="text-xs text-red-600 mt-0.5">Tap to review inventory</p>
          </div>
          <ChevronRight className="h-5 w-5 text-red-500 shrink-0" />
        </button>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-sm font-semibold mb-3">Quick Actions</p>
        <div className="space-y-2.5">
          {QUICK_ACTIONS.map(({ label, sub, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 rounded-2xl border bg-background p-4 active:scale-[0.98] transition-transform min-h-[64px]"
            >
              <div className={`h-2 w-2 rounded-full ${color} shrink-0`} />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Role badge */}
      <div className="flex justify-center pt-2">
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {user?.role?.replace('_', ' ')} · FACTORY
        </Badge>
      </div>
    </div>
  );
}
