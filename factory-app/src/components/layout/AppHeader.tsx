import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/':          { title: 'Home',      subtitle: 'Overview of your factory operations' },
  '/demands':   { title: 'Demands',   subtitle: 'Manage and track production demands' },
  '/inventory': { title: 'Inventory', subtitle: 'Monitor stock levels across categories' },
  '/batches':   { title: 'Batches',   subtitle: 'Track production and processing batches' },
  '/packaging': { title: 'Packaging', subtitle: 'Manage packaging orders and runs' },
  '/profile':   { title: 'Profile',   subtitle: 'Your account settings' },
};

function getInitials(email: string) {
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : email.slice(0, 2).toUpperCase();
}

export function AppHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const key = Object.keys(PAGE_META).find(
    (k) => pathname === k || (k !== '/' && pathname.startsWith(k)),
  );
  const meta = (key ? PAGE_META[key] : null) ?? { title: 'Factory', subtitle: '' };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setOpen(false);
    try { await authApi.logout(); } finally {
      clearAuth();
      navigate('/login');
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 md:px-6 shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-gray-900 leading-none">{meta.title}</h1>
        {meta.subtitle && <p className="text-xs text-gray-400 mt-0.5">{meta.subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search — desktop only */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search everything..."
            className="h-9 w-64 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors"
          />
        </div>

        {/* Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#d94040] border-2 border-white" />
        </button>

        <div className="h-6 w-px bg-gray-100" />

        {/* User avatar — desktop is display-only (sidebar handles logout); mobile has dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 md:pointer-events-none"
            aria-label="User menu"
            aria-expanded={open}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d94040]/15 text-[#d94040] text-xs font-semibold">
              {user ? getInitials(user.email) : 'FA'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-none">
                {user?.email?.split('@')[0] ?? 'User'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
                {user?.role?.toLowerCase() ?? 'staff'}
              </p>
            </div>
          </button>

          {/* Mobile-only dropdown */}
          {open && (
            <div className="md:hidden absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold truncate text-gray-900">{user?.email ?? '—'}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {user?.role?.replace('_', ' ')} · Factory
                </p>
              </div>
              <button
                onClick={() => { setOpen(false); navigate('/profile'); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4 text-gray-400" />
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
