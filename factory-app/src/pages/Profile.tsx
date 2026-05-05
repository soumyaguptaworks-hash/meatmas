import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

export function Profile() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  async function handleLogout() {
    try { await authApi.logout(); } finally {
      clearAuth();
      navigate('/login');
    }
  }

  const firstName = user?.email?.split('@')[0] ?? 'User';
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <div className="px-4 py-5 space-y-5 max-w-md mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground -ml-1"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
          {initials}
        </div>
        <div className="text-center">
          <p className="text-xl font-bold capitalize">{firstName}</p>
          <Badge variant="outline" className="mt-1 gap-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {user?.role?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Info card */}
      <Card>
        <CardContent className="p-0 divide-y">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 shrink-0">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 shrink-0">
              <Shield className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium">{user?.role?.replace('_', ' ') ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">App Context</p>
              <p className="text-sm font-medium">{user?.appContext ?? 'FACTORY'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-2 min-h-[48px]"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
