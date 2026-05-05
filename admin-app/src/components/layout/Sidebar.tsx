import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ClipboardList, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/',                  label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/users',             label: 'User Management',  icon: Users },
  { to: '/item-master',       label: 'Item Master',      icon: Package },
  { to: '/demand-approvals',  label: 'Demand Approvals', icon: ClipboardList },
] as const;

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col bg-white border-r border-gray-100 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
          <ChefHat className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-gray-900">MeatMaster</p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium tracking-wide uppercase">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-[#d94040]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#d94040]' : 'text-gray-400')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-3.5">
        <p className="text-[10px] text-gray-300 font-medium">v1.0.0 · MeatMaster ERP</p>
      </div>
    </aside>
  );
}
