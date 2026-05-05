import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { useCartStore, type CartItem } from '@/store/cart.store';

interface Props { item: CartItem; }

export function CartRow({ item }: Props) {
  const updateQty  = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = item.price * item.quantity;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-white p-3 text-sm">
      {/* Name + delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium leading-tight truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatPrice(item.price)} / {item.unit}
          </p>
        </div>
        <button
          onClick={() => removeItem(item.productId)}
          className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Qty stepper + subtotal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateQty(item.productId, item.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border bg-muted/40 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>

          {/* Direct qty input */}
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) updateQty(item.productId, v);
            }}
            className="h-7 w-10 rounded-md border bg-background text-center text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <button
            onClick={() => updateQty(item.productId, item.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <p className="font-semibold">{formatPrice(subtotal)}</p>
      </div>
    </div>
  );
}
