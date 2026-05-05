import { useEffect, useRef } from 'react';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartPanel } from '@/components/pos/CartPanel';

export function POS() {
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // '/' — focus search
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: product grid — takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <ProductGrid searchRef={searchRef} />
      </div>

      {/* Right: cart panel — fixed 320px */}
      <CartPanel />
    </div>
  );
}
