import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Package, FlaskConical, BoxSelect } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { to: '/',          label: 'Home',      icon: Home },
  { to: '/demands',   label: 'Demands',   icon: ClipboardList },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/batches',   label: 'Batches',   icon: FlaskConical },
  { to: '/packaging', label: 'Packaging', icon: BoxSelect },
] as const;

export function BottomNav() {
  return (
    <nav
      className="md:hidden shrink-0 border-t bg-background"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                  isActive && 'bg-primary/10',
                )}>
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
