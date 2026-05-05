import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { decodeJwt } from '@/lib/jwt';

export function Login() {
  const navigate    = useNavigate();
  const { setTokens, setUser, accessToken } = useAuthStore();
  const [email, setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]    = useState('');

  if (accessToken) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await authApi.login({ email, password, appContext: 'POS' });
      const p = decodeJwt(data.accessToken);
      setTokens(data.accessToken, data.refreshToken);
      setUser({ sub: p.sub, email: p.email, role: p.role, appContext: p.appContext });
      navigate('/', { replace: true });
    } catch (err) { setError(extractError(err)); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <ShoppingBag className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MeatMaster POS</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Sign in to start selling</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-background p-6 shadow-sm space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="you@meatmaster.com" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="pr-10" />
                <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground">MeatMaster ERP — POS</p>
      </div>
    </div>
  );
}

function extractError(err: unknown): string {
  const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (!msg) return 'Something went wrong. Please try again.';
  return Array.isArray(msg) ? msg.join(', ') : String(msg);
}
