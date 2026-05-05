import { useState } from 'react';
import { ShoppingCart, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartRow } from './CartRow';
import { CheckoutModal } from './CheckoutModal';
import { formatPrice } from '@/lib/format';
import { useCartStore, selectSubtotal, selectTax, selectTotal, selectItemCount, TAX_RATE } from '@/store/cart.store';

export function CartPanel() {
  const items      = useCartStore((s) => s.items);
  const clearCart  = useCartStore((s) => s.clearCart);
  const itemCount  = useCartStore(selectItemCount);
  const subtotal   = useCartStore(selectSubtotal);
  const tax        = useCartStore(selectTax);
  const total      = useCartStore(selectTotal);

  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      <div className="flex h-full w-80 shrink-0 flex-col border-l bg-cart">

        {/* ── Cart header ── */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Cart</span>
            {itemCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={() => { if (confirm('Clear the entire cart?')) clearCart(); }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* ── Cart items ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 opacity-20" />
              <div className="text-center">
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-xs mt-0.5">Click a product to add it</p>
              </div>
            </div>
          )}
          {items.map((item) => <CartRow key={item.productId} item={item} />)}
        </div>

        {/* ── Totals + checkout ── */}
        <div className="shrink-0 border-t bg-white px-4 py-4 space-y-3">
          {/* Breakdown */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-base">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <Button
            size="xl"
            className="w-full gap-2"
            disabled={items.length === 0}
            onClick={() => setShowCheckout(true)}
          >
            <Receipt className="h-5 w-5" />
            Checkout — {formatPrice(total)}
          </Button>

          <p className="text-center text-[10px] text-muted-foreground">Press F10 to open checkout</p>
        </div>
      </div>

      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
    </>
  );
}
