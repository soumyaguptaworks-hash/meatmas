import { create } from 'zustand';

export const TAX_RATE = Number(import.meta.env.VITE_TAX_RATE ?? 0.05);

export interface CartItem {
  productId: string;
  code: string;
  name: string;
  price: number;   // per unit
  unit: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem:    (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQty:  (productId: string, qty: number) => void;
  clearCart:  () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],

  addItem: (product) =>
    set((s) => {
      const hit = s.items.find((i) => i.productId === product.productId);
      return hit
        ? { items: s.items.map((i) => i.productId === product.productId ? { ...i, quantity: i.quantity + 1 } : i) }
        : { items: [...s.items, { ...product, quantity: 1 }] };
    }),

  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

  updateQty: (productId, qty) => {
    if (qty <= 0) { get().removeItem(productId); return; }
    set((s) => ({ items: s.items.map((i) => i.productId === productId ? { ...i, quantity: qty } : i) }));
  },

  clearCart: () => set({ items: [] }),
}));

// ── Derived selectors ─────────────────────────────────────────────────────────
export const selectItemCount  = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal   = (s: CartState) => s.items.reduce((n, i) => n + i.price * i.quantity, 0);
export const selectTax        = (s: CartState) => Math.round(selectSubtotal(s) * TAX_RATE * 100) / 100;
export const selectTotal      = (s: CartState) => selectSubtotal(s) + selectTax(s);
export const selectCartQty    = (productId: string) => (s: CartState) =>
  s.items.find((i) => i.productId === productId)?.quantity ?? 0;
