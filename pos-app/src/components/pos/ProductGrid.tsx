import { useEffect, useState, useRef } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductCard } from './ProductCard';
import { posApi, type Product } from '@/api/pos.api';
import { cn } from '@/lib/utils';

interface Props {
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export function ProductGrid({ searchRef }: Props) {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('ALL');
  const [categories, setCategories] = useState<string[]>([]);

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function load(q: string, cat: string) {
    setLoading(true); setError('');
    posApi.getProducts(q || undefined, cat)
      .then(({ data }) => {
        setProducts(data);
        // Derive unique categories from first load (no search filter)
        if (!q && cat === 'ALL') {
          const cats = [...new Set(data.map((p) => p.category))].sort();
          setCategories(cats);
        }
      })
      .catch(() => setError('Could not load products. Check your connection.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load('', 'ALL'); }, []);

  function handleSearch(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(val, category), 280);
  }

  function handleCategory(cat: string) {
    setCategory(cat);
    load(search, cat);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Search + category bar ── */}
      <div className="shrink-0 space-y-2 border-b bg-white px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Search products…  (press / to focus)"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {['ALL', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                category === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
              )}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}

          <button
            onClick={() => load(search, category)}
            className="ml-auto shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-secondary transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── Product grid ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No products found</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
