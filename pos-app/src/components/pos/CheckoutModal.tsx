import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, X, Loader2, Receipt, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import { posApi } from '@/api/pos.api';
import { useCartStore, selectSubtotal, selectTax, selectTotal, TAX_RATE } from '@/store/cart.store';

interface Props {
  onClose: () => void;
}

type Step = 'payment' | 'loading' | 'success';

export function CheckoutModal({ onClose }: Props) {
  const items      = useCartStore((s) => s.items);
  const clearCart  = useCartStore((s) => s.clearCart);
  const subtotal   = useCartStore(selectSubtotal);
  const tax        = useCartStore(selectTax);
  const total      = useCartStore(selectTotal);

  const [step, setStep]           = useState<Step>('payment');
  const [cashInput, setCashInput] = useState('');
  const [error, setError]         = useState('');
  const [order, setOrder]         = useState<{ orderNumber: string; change: number } | null>(null);

  const cashRef = useRef<HTMLInputElement>(null);
  useEffect(() => { cashRef.current?.focus(); }, []);

  const cash   = parseFloat(cashInput) || 0;
  const change = cash - total;
  const canConfirm = cash >= total && items.length > 0;

  async function handleConfirm() {
    setError('');
    setStep('loading');
    try {
      const { data } = await posApi.createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.price })),
        cashReceived: cash,
      });
      setOrder({ orderNumber: data.orderNumber, change: data.change });
      setStep('success');
    } catch {
      setError('Order failed. Please try again.');
      setStep('payment');
    }
  }

  function handleNewSale() {
    clearCart();
    onClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && step !== 'loading') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, onClose]);

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md rounded-2xl border bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* ── Success screen ── */}
        {step === 'success' && order && (
          <div className="flex flex-col items-center gap-5 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-700">Sale Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">Order #{order.orderNumber}</p>
            </div>
            <div className="w-full space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cash received</span>
                <span className="font-semibold">{formatPrice(cash)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Change</span>
                <span className="text-lg font-bold text-emerald-600">{formatPrice(order.change)}</span>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={handleNewSale}>
              New Sale
            </Button>
          </div>
        )}

        {/* ── Payment / loading screen ── */}
        {step !== 'success' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span className="font-semibold">Checkout</span>
              </div>
              {step !== 'loading' && (
                <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Bill summary */}
              <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-sm">
                {items.map((i) => (
                  <div key={i.productId} className="flex justify-between text-muted-foreground">
                    <span className="truncate max-w-[60%]">{i.name} × {i.quantity} {i.unit}</span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Cash received */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cash Received (₹)</label>
                <input
                  ref={cashRef}
                  type="number"
                  min={total}
                  step="1"
                  placeholder={String(Math.ceil(total))}
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && canConfirm) handleConfirm(); }}
                  disabled={step === 'loading'}
                  className="flex h-12 w-full rounded-xl border-2 bg-background px-4 text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-colors"
                  style={{ borderColor: cash > 0 && !canConfirm ? 'hsl(var(--destructive))' : undefined }}
                />
              </div>

              {/* Change due */}
              <div className={`flex justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                <span>{change >= 0 ? 'Change Due' : 'Amount Short'}</span>
                <span className="text-base">{formatPrice(Math.abs(change))}</span>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={step === 'loading'}>
                  Cancel
                </Button>
                <Button
                  variant="success"
                  className="flex-1 gap-2"
                  size="lg"
                  onClick={handleConfirm}
                  disabled={!canConfirm || step === 'loading'}
                >
                  {step === 'loading'
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                    : <><CheckCircle2 className="h-4 w-4" /> Confirm Sale</>}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">Press Enter to confirm · Esc to cancel</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
