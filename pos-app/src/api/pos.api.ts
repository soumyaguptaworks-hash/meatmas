import api from './axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;      // price per unit
  unit: string;       // 'kg' | 'pcs' | 'g' | etc.
  inStock: boolean;
  stock: number;      // available units
  imageUrl?: string;
}

export interface OrderLineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderPayload {
  items: OrderLineItem[];
  cashReceived: number;
  notes?: string;
}

export interface OrderResult {
  id: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  cashReceived: number;
  change: number;
  cashierEmail: string;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const posApi = {
  getProducts: (search?: string, category?: string) =>
    api.get<Product[]>('/pos/products', {
      params: { ...(search ? { search } : {}), ...(category && category !== 'ALL' ? { category } : {}) },
    }),

  createOrder: (payload: CreateOrderPayload) =>
    api.post<OrderResult>('/pos/orders', payload),

  getOrderHistory: (page = 1, limit = 20) =>
    api.get<{ data: OrderResult[]; total: number }>('/pos/orders', { params: { page, limit } }),
};
