import { useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, User } from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore, selectItemCount } from '@/store/cart.store';

export function Header() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const itemCount = useCartStore(selectItemCount);

  async function handleLogout() {
    try { await authApi.logout(); } finally { clearAuth(); navigate('/login'); }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm z-10">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ShoppingBag className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="leading-none">
          <p className="text-sm font-bold">MeatMaster</p>
          <p className="text-[10px] text-muted-foreground">Point of Sale</p>
        </div>
      </div>

      {/* Center — active session info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Session active</span>
        {itemCount > 0 && (
          <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {itemCount} in cart
          </span>
        )}
      </div>

      {/* Right — user + logout */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{user?.email ?? 'Operator'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
