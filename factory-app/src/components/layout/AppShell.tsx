import { Navigate, Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { OfflineBanner } from './OfflineBanner';
import { useAuthStore } from '@/store/auth.store';

export function AppShell() {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!accessToken) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {/* Offline banner — always at top */}
      <OfflineBanner />

      {/* Header (mobile + desktop) */}
      <AppHeader />

      {/* Body row: sidebar (desktop) + main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <DesktopSidebar />

        {/* Scrollable main */}
        <main className="flex-1 overflow-y-auto scrollbar-none bg-[#f7f7f8]">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — only on mobile */}
      <BottomNav />
    </div>
  );
}
