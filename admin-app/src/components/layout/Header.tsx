import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/':                     { title: 'Dashboard',           subtitle: 'Overview of your operations' },
  '/users':                { title: 'User Management',     subtitle: 'Manage admin and operator accounts' },
  '/item-master':          { title: 'Item Master',         subtitle: 'Manage your product catalog' },
  '/demand-approvals':     { title: 'Demand Approvals',    subtitle: 'Review and approve factory demands' },
  '/processing-pipeline':  { title: 'Processing Pipeline', subtitle: 'Define product breakdown rules for each raw material' },
};

function getInitials(email: string) {
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : email.slice(0, 2).toUpperCase();
}

export function Header() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  // Match /demand-approvals/:id as the parent page
  const key = Object.keys(PAGE_META).find((k) => pathname === k || (k !== '/' && pathname.startsWith(k)));
  const page = (key && PAGE_META[key]) ?? { title: 'Admin Panel', subtitle: '' };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-gray-900 leading-none">{page.title}</h1>
        {page.subtitle && <p className="text-xs text-gray-400 mt-0.5">{page.subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search everything..."
            className="h-9 w-64 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors"
          />
        </div>

        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#d94040] border-2 border-white" />
        </button>

        <div className="h-6 w-px bg-gray-100" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-semibold bg-[#d94040]/15 text-[#d94040]">
              {user ? getInitials(user.email) : 'AD'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-800 leading-none">
              {user?.email?.split('@')[0] ?? 'Admin'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
              {user?.role?.toLowerCase() ?? 'admin'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
