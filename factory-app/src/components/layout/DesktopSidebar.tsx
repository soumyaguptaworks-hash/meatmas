import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Package, FlaskConical, BoxSelect, ChefHat, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';

const NAV_ITEMS = [
  { to: '/',          label: 'Home',      icon: Home },
  { to: '/demands',   label: 'Demands',   icon: ClipboardList },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/batches',   label: 'Batches',   icon: FlaskConical },
  { to: '/packaging', label: 'Packaging', icon: BoxSelect },
] as const;

function getInitials(email: string) {
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : email.slice(0, 2).toUpperCase();
}

export function DesktopSidebar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await authApi.logout(); } finally {
      clearAuth();
      navigate('/login');
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#0f1117] border-r border-white/5 h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d94040] shadow-lg shadow-[#d94040]/30">
          <ChefHat className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-white">MeatMaster</p>
          <p className="text-[10px] text-gray-500 mt-0.5 font-medium tracking-wide uppercase">Factory App</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div className="space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Menu
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
                    ? 'bg-[#d94040]/15 text-[#d94040]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-100',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#d94040]' : 'text-gray-500')} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer — user info + logout */}
      <div className="border-t border-white/5 px-3 py-3 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d94040]/20 text-[#d94040] text-xs font-bold">
            {user ? getInitials(user.email) : 'FA'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-200 truncate leading-none">
              {user?.email?.split('@')[0] ?? 'User'}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 capitalize">
              {user?.role?.toLowerCase() ?? 'staff'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
