import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '../auth/auth.module';

const products = [
  { id: 'p1',  code: 'CH001', name: 'Chicken Breast',      category: 'Chicken', price: 320,  unit: 'kg',  inStock: true,  stock: 45 },
  { id: 'p2',  code: 'CH002', name: 'Chicken Legs',        category: 'Chicken', price: 180,  unit: 'kg',  inStock: true,  stock: 60 },
  { id: 'p3',  code: 'CH003', name: 'Chicken Wings',       category: 'Chicken', price: 160,  unit: 'kg',  inStock: true,  stock: 30 },
  { id: 'p4',  code: 'CH004', name: 'Whole Chicken',       category: 'Chicken', price: 220,  unit: 'kg',  inStock: true,  stock: 20 },
  { id: 'p5',  code: 'MT001', name: 'Mutton Leg',          category: 'Mutton',  price: 780,  unit: 'kg',  inStock: true,  stock: 15 },
  { id: 'p6',  code: 'MT002', name: 'Mutton Chops',        category: 'Mutton',  price: 820,  unit: 'kg',  inStock: true,  stock: 10 },
  { id: 'p7',  code: 'MT003', name: 'Mutton Mince',        category: 'Mutton',  price: 700,  unit: 'kg',  inStock: false, stock: 0  },
  { id: 'p8',  code: 'BF001', name: 'Beef Mince',          category: 'Beef',    price: 550,  unit: 'kg',  inStock: true,  stock: 80 },
  { id: 'p9',  code: 'BF002', name: 'Beef Steak',          category: 'Beef',    price: 950,  unit: 'kg',  inStock: true,  stock: 12 },
  { id: 'p10', code: 'BF003', name: 'Beef Ribs',           category: 'Beef',    price: 680,  unit: 'kg',  inStock: true,  stock: 18 },
  { id: 'p11', code: 'PK001', name: 'Pork Ribs',           category: 'Pork',    price: 480,  unit: 'kg',  inStock: true,  stock: 25 },
  { id: 'p12', code: 'PK002', name: 'Pork Belly',          category: 'Pork',    price: 420,  unit: 'kg',  inStock: true,  stock: 20 },
  { id: 'p13', code: 'LB001', name: 'Lamb Chops',          category: 'Lamb',    price: 1100, unit: 'kg',  inStock: true,  stock: 8  },
  { id: 'p14', code: 'LB002', name: 'Lamb Mince',          category: 'Lamb',    price: 980,  unit: 'kg',  inStock: false, stock: 0  },
  { id: 'p15', code: 'EG001', name: 'Eggs (Tray)',         category: 'Other',   price: 120,  unit: 'tray',inStock: true,  stock: 50 },
];

let orderCounter = 1;
const orders: unknown[] = [];

@UseGuards(JwtAuthGuard)
@Controller('pos')
export class PosController {

  @Get('products')
  getProducts(@Query('search') search?: string, @Query('category') category?: string) {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    }
    if (category && category !== 'ALL') {
      result = result.filter(p => p.category === category);
    }
    return result;
  }

  @Post('orders')
  createOrder(
    @Body() body: { items: Array<{ productId: string; quantity: number; unitPrice: number }>; cashReceived: number; notes?: string },
    @CurrentUser() user: { email: string },
  ) {
    const TAX_RATE = 0.05;
    const lineItems = body.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name ?? item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      };
    });

    const subtotal = lineItems.reduce((s, i) => s + i.subtotal, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = subtotal + tax;

    const order = {
      id: `ord_${Date.now()}`,
      orderNumber: `POS-${String(orderCounter++).padStart(4, '0')}`,
      items: lineItems,
      subtotal,
      taxRate: TAX_RATE,
      tax,
      total,
      cashReceived: body.cashReceived,
      change: body.cashReceived - total,
      cashierEmail: user?.email ?? 'unknown',
      createdAt: new Date().toISOString(),
    };

    orders.push(order);
    return order;
  }

  @Get('orders')
  getOrders(@Query('page') page = 1, @Query('limit') limit = 20) {
    const start = (Number(page) - 1) * Number(limit);
    return {
      data: orders.slice(start, start + Number(limit)),
      total: orders.length,
    };
  }
}
