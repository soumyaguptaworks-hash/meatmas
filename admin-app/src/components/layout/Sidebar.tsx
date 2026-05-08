import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ClipboardList, GitBranch,
  ChefHat, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';

const MENU_ITEMS = [
  { to: '/',                    label: 'Dashboard',           icon: LayoutDashboard },
  { to: '/demand-approvals',    label: 'Demand Approvals',    icon: ClipboardList },
  { to: '/item-master',         label: 'Item Master',         icon: Package },
  { to: '/processing-pipeline', label: 'Processing Pipeline', icon: GitBranch },
] as const;

const ADMIN_ITEMS = [
  { to: '/users', label: 'User Management', icon: Users },
] as const;

function getInitials(email: string) {
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : email.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await authApi.logout(); } finally {
      clearAuth();
      navigate('/login');
    }
  }

  const navLink = (to: string, label: string, Icon: React.ElementType, end = false) => (
    <NavLink
      key={to}
      to={to}
      end={end}
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
  );

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-[#0f1117] border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d94040] shadow-lg shadow-[#d94040]/30">
          <ChefHat className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-white">MeatMaster</p>
          <p className="text-[10px] text-gray-500 mt-0.5 font-medium tracking-wide uppercase">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* MENU section */}
        <div className="space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Menu
          </p>
          {MENU_ITEMS.map(({ to, label, icon: Icon }) =>
            navLink(to, label, Icon, to === '/')
          )}
        </div>

        {/* ADMIN section */}
        <div className="space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Admin
          </p>
          {ADMIN_ITEMS.map(({ to, label, icon: Icon }) =>
            navLink(to, label, Icon)
          )}
        </div>
      </nav>

      {/* Footer — user info + logout */}
      <div className="border-t border-white/5 px-3 py-3 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d94040]/20 text-[#d94040] text-xs font-bold">
            {user ? getInitials(user.email) : 'AD'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-200 truncate leading-none">
              {user?.email?.split('@')[0] ?? 'Admin'}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 capitalize">
              {user?.role?.toLowerCase() ?? 'admin'}
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
