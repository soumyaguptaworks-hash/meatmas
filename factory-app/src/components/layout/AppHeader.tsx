import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, User, ChevronDown } from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

const PAGE_TITLES: Record<string, string> = {
  '/':          'Home',
  '/demands':   'Demands',
  '/inventory': 'Inventory',
  '/batches':   'Batches',
  '/packaging': 'Packaging',
  '/profile':   'Profile',
};

export function AppHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title = PAGE_TITLES[pathname] ?? 'Factory';

  // Close dropdown on outside click
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

  function handleProfile() {
    setOpen(false);
    navigate('/profile');
  }

  return (
    <header
      className="shrink-0 bg-primary text-primary-foreground px-4 flex items-center justify-between"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
        paddingBottom: '0.75rem',
      }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <ChefHat className="h-4 w-4" />
        </div>
        <div>
          <p className="text-base font-bold leading-none">{title}</p>
          <p className="text-[10px] text-primary-foreground/70 mt-0.5">
            {user?.email ?? 'Factory'}
          </p>
        </div>
      </div>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 h-9 px-2.5 rounded-full bg-white/10 active:bg-white/20 transition-colors"
          aria-label="User menu"
          aria-expanded={open}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium hidden sm:inline max-w-[100px] truncate">
            {user?.email?.split('@')[0] ?? 'User'}
          </span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border bg-background shadow-lg overflow-hidden z-50 text-foreground">
            {/* User info */}
            <div className="px-4 py-3 border-b bg-muted/30">
              <p className="text-sm font-semibold truncate">{user?.email ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user?.role?.replace('_', ' ')} · Factory
              </p>
            </div>

            {/* Actions */}
            <button
              onClick={handleProfile}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
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
    </header>
  );
}
