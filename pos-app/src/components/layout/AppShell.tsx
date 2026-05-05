import { Navigate, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useAuthStore } from '@/store/auth.store';

export function AppShell() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
