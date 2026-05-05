import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((c: InternalAxiosRequestConfig) => {
  const t = useAuthStore.getState().accessToken;
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

let refreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];
const flush = (err: unknown, t: string | null) => { queue.forEach((p) => err ? p.reject(err) : p.resolve(t!)); queue = []; };

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const orig = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status !== 401 || orig._retry) return Promise.reject(err);
    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
    if (!refreshToken) { clearAuth(); window.location.href = '/login'; return Promise.reject(err); }
    if (refreshing) return new Promise((res, rej) => queue.push({ resolve: (t) => { orig.headers.Authorization = `Bearer ${t}`; res(api(orig)); }, reject: rej }));
    orig._retry = true; refreshing = true;
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken });
      setTokens(data.accessToken, refreshToken);
      flush(null, data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig);
    } catch (e) { flush(e, null); clearAuth(); window.location.href = '/login'; return Promise.reject(e); }
    finally { refreshing = false; }
  },
);

export default api;
