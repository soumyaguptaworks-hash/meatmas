import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Package, FlaskConical, BoxSelect, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/',          label: 'Home',      icon: Home },
  { to: '/demands',   label: 'Demands',   icon: ClipboardList },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/batches',   label: 'Batches',   icon: FlaskConical },
  { to: '/packaging', label: 'Packaging', icon: BoxSelect },
] as const;

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-primary text-primary-foreground h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shrink-0">
          <ChefHat className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-sm leading-none">MeatMaster</p>
          <p className="text-[10px] text-primary-foreground/60 mt-0.5">Factory App</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-[48px]',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-primary-foreground/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
