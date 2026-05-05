import { Plus, Minus, PackageX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
import { useCartStore, selectCartQty } from '@/store/cart.store';
import type { Product } from '@/api/pos.api';

interface Props { product: Product; }

// Distinct pastel backgrounds per category for quick visual scanning
const CATEGORY_COLORS: Record<string, string> = {
  Beef:    'bg-red-50    border-red-100',
  Chicken: 'bg-amber-50  border-amber-100',
  Lamb:    'bg-orange-50 border-orange-100',
  Pork:    'bg-pink-50   border-pink-100',
  Mutton:  'bg-rose-50   border-rose-100',
  Fish:    'bg-cyan-50   border-cyan-100',
  default: 'bg-slate-50  border-slate-100',
};

export function ProductCard({ product }: Props) {
  const addItem   = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const qty       = useCartStore(selectCartQty(product.id));

  const colorClass = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.default;
  const outOfStock = !product.inStock || product.stock === 0;

  function handleAdd() {
    if (outOfStock) return;
    addItem({ productId: product.id, code: product.code, name: product.name, price: product.price, unit: product.unit });
  }

  return (
    <div className={cn(
      'relative flex flex-col rounded-xl border-2 p-3 transition-all duration-150 cursor-pointer select-none',
      colorClass,
      outOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.97]',
    )}
      onClick={handleAdd}
    >
      {/* Cart quantity badge */}
      {qty > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow z-10 animate-pop">
          {qty}
        </span>
      )}

      {/* Out of stock overlay */}
      {outOfStock && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60">
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <PackageX className="h-5 w-5" />
            <span className="text-[10px] font-medium">Out of stock</span>
          </div>
        </div>
      )}

      {/* Category chip */}
      <span className="mb-2 self-start rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        {product.category}
      </span>

      {/* Name */}
      <p className="text-sm font-semibold leading-tight line-clamp-2 flex-1">{product.name}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{product.code}</p>

      {/* Price row */}
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-base font-bold text-foreground">{formatPrice(product.price)}</p>
          <p className="text-[10px] text-muted-foreground">per {product.unit}</p>
        </div>

        {/* Quantity stepper — shows when item is in cart */}
        {qty > 0 && (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => updateQty(product.id, qty - 1)}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm border hover:bg-red-50 transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-5 text-center text-xs font-bold">{qty}</span>
            <button
              onClick={handleAdd}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-primary shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3 text-primary-foreground" />
            </button>
          </div>
        )}

        {/* Add button — shows when not yet in cart */}
        {qty === 0 && !outOfStock && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/90 shadow-sm">
            <Plus className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
