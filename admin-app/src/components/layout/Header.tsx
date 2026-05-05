import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, ChevronDown, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/':                   { title: 'Dashboard',        subtitle: 'Overview of your operations' },
  '/users':              { title: 'User Management',  subtitle: 'Manage admin and operator accounts' },
  '/item-master':        { title: 'Item Master',      subtitle: 'Manage your product catalog' },
  '/demand-approvals':   { title: 'Demand Approvals', subtitle: 'Review and approve factory demands' },
};

function getInitials(email: string) {
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : email.slice(0, 2).toUpperCase();
}

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const page = PAGE_TITLES[pathname] ?? { title: 'Admin Panel', subtitle: '' };

  async function handleLogout() {
    try { await authApi.logout(); } finally {
      clearAuth();
      navigate('/login');
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-gray-900 leading-none">{page.title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{page.subtitle}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-white" />
        </button>

        <div className="h-6 w-px bg-gray-100 mx-1" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-gray-50 transition-colors outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-semibold bg-primary/15 text-[#d94040]">
                {user ? getInitials(user.email) : 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-800 leading-none">
                {user?.email?.split('@')[0] ?? 'Admin'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
                {user?.role?.toLowerCase().replace('_', ' ') ?? 'admin'}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-xs font-semibold">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Administrator</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-sm">
              <User className="h-3.5 w-3.5" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm">
              <Settings className="h-3.5 w-3.5" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-sm text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
