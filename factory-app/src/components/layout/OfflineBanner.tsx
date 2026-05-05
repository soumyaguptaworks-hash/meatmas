import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="shrink-0 flex items-center justify-center gap-2 bg-red-600 text-white text-xs font-medium py-2 px-4"
      role="alert"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>You are offline — some features may not work</span>
    </div>
  );
}
