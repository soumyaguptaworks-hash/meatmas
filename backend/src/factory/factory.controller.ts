import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard, CurrentUser } from '../auth/auth.module';

class CompleteDemandDto {
  @IsOptional()
  @IsString()
  billData?: string;

  @IsOptional()
  @IsString()
  billFileName?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  receivedQuantity?: number;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type DemandStatus =
  | 'DRAFT'
  | 'PENDING_MANAGER'
  | 'PENDING_ADMIN'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

type DemandType = 'RAW_MATERIAL' | 'PACKAGING' | 'STATIONARY';
type DemandPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type InventoryType = 'STATIONARY' | 'RAW_MATERIAL' | 'PROCESSED' | 'PACKED' | 'WASTAGE';
type BatchStatus = 'PREPARING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
type PackagingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Demand {
  id: string;
  demandType: DemandType;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  priority: DemandPriority;
  status: DemandStatus;
  requestedBy: string;
  requestedByRole: string;
  dueDate: string;
  notes?: string;
  rejectionComment?: string;
  approvedBy?: string;
  approvedByRole?: string;
  approvedById?: string;
  approvedAt?: string;
  receivedBy?: string;
  receivedByRole?: string;
  receivedAt?: string;
  receivedQuantity?: number;
  originalDemandId?: string;
  billData?: string;
  billFileName?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  inventoryType: InventoryType;
  currentStock: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  stockLevel: 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'EXCESS';
  lastUpdated: string;
}

interface BatchOutput {
  itemName: string;
  quantity: number;
  unit: string;
}

interface Batch {
  id: string;
  batchNumber: string;
  processingDate: string;
  inputItem: string;
  inputQuantity: number;
  inputUnit: string;
  outputs: BatchOutput[];
  wastage: BatchOutput[];
  status: BatchStatus;
  performedBy: string;
  createdAt: string;
}

interface PackagingOrder {
  id: string;
  orderNumber: string;
  inputItem: string;
  inputQuantity: number;
  inputUnit: string;
  outputSku: string;
  packsProduced: number;
  packSize: number;
  packagingMaterial: string;
  wastageCount: number;
  status: PackagingStatus;
  performedBy: string;
  createdAt: string;
}

// ─── In-memory data ───────────────────────────────────────────────────────────

const demands: Demand[] = [
  {
    id: 'd1',
    demandType: 'RAW_MATERIAL',
    itemCode: 'MT001',
    itemName: 'Chicken Breast',
    quantity: 50,
    unit: 'kg',
    priority: 'HIGH',
    status: 'PENDING_MANAGER',
    requestedBy: 'staff@factory.com',
    requestedByRole: 'STAFF',
    dueDate: '2026-05-10',
    notes: 'Urgent for weekend sale',
    createdAt: '2026-05-03T08:00:00Z',
    updatedAt: '2026-05-03T08:00:00Z',
  },
  {
    id: 'd2',
    demandType: 'RAW_MATERIAL',
    itemCode: 'MT002',
    itemName: 'Mutton Leg',
    quantity: 30,
    unit: 'kg',
    priority: 'MEDIUM',
    status: 'PENDING_ADMIN',
    requestedBy: 'staff@factory.com',
    requestedByRole: 'STAFF',
    dueDate: '2026-05-06',
    createdAt: '2026-05-03T09:00:00Z',
    updatedAt: '2026-05-03T10:00:00Z',
  },
  {
    id: 'd3',
    demandType: 'PACKAGING',
    itemCode: 'PK001',
    itemName: 'Vacuum Bags 500g',
    quantity: 500,
    unit: 'pcs',
    priority: 'LOW',
    status: 'APPROVED',
    requestedBy: 'manager@meatmas.com',
    requestedByRole: 'MANAGER',
    dueDate: '2026-05-08',
    approvedBy: 'admin@meatmas.com',
    approvedByRole: 'ADMIN',
    approvedById: '1',
    approvedAt: '2026-05-03T11:00:00Z',
    createdAt: '2026-05-02T10:00:00Z',
    updatedAt: '2026-05-03T11:00:00Z',
  },
  {
    id: 'd4',
    demandType: 'RAW_MATERIAL',
    itemCode: 'MT004',
    itemName: 'Beef Mince',
    quantity: 100,
    unit: 'kg',
    priority: 'URGENT',
    status: 'PENDING_MANAGER',
    requestedBy: 'staff2@factory.com',
    requestedByRole: 'STAFF',
    dueDate: '2026-05-04',
    notes: 'Festival season demand',
    createdAt: '2026-05-03T07:00:00Z',
    updatedAt: '2026-05-03T07:00:00Z',
  },
  {
    id: 'd5',
    demandType: 'STATIONARY',
    itemCode: 'ST001',
    itemName: 'A4 Paper Reams',
    quantity: 10,
    unit: 'reams',
    priority: 'LOW',
    status: 'DRAFT',
    requestedBy: 'staff@factory.com',
    requestedByRole: 'STAFF',
    dueDate: '2026-05-15',
    createdAt: '2026-05-03T12:00:00Z',
    updatedAt: '2026-05-03T12:00:00Z',
  },
  {
    id: 'd6',
    demandType: 'RAW_MATERIAL',
    itemCode: 'MT005',
    itemName: 'Lamb Chops',
    quantity: 25,
    unit: 'kg',
    priority: 'HIGH',
    status: 'REJECTED',
    requestedBy: 'staff@factory.com',
    requestedByRole: 'STAFF',
    dueDate: '2026-05-05',
    rejectionComment: 'Supplier not available this week',
    createdAt: '2026-05-02T08:00:00Z',
    updatedAt: '2026-05-02T15:00:00Z',
  },
  {
    id: 'd7',
    demandType: 'RAW_MATERIAL',
    itemCode: 'MT003',
    itemName: 'Pork Ribs',
    quantity: 40,
    unit: 'kg',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    requestedBy: 'staff@meatmas.com',
    requestedByRole: 'STAFF',
    dueDate: '2026-05-04',
    notes: 'Needed for weekend BBQ stock',
    approvedBy: 'admin@meatmas.com',
    approvedByRole: 'ADMIN',
    approvedById: '1',
    approvedAt: '2026-05-03T11:30:00Z',
    receivedBy: 'manager@meatmas.com',
    receivedByRole: 'MANAGER',
    receivedAt: '2026-05-04T09:15:00Z',
    billData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    billFileName: 'pork_ribs_invoice.png',
    createdAt: '2026-05-03T08:00:00Z',
    updatedAt: '2026-05-04T09:15:00Z',
  },
  {
    id: 'd8',
    demandType: 'PACKAGING',
    itemCode: 'PK002',
    itemName: 'Shrink Wrap Rolls',
    quantity: 20,
    unit: 'rolls',
    priority: 'LOW',
    status: 'COMPLETED',
    requestedBy: 'manager@meatmas.com',
    requestedByRole: 'MANAGER',
    dueDate: '2026-05-03',
    approvedBy: 'admin@meatmas.com',
    approvedByRole: 'ADMIN',
    approvedById: '1',
    approvedAt: '2026-05-02T14:00:00Z',
    receivedBy: 'staff@meatmas.com',
    receivedByRole: 'STAFF',
    receivedAt: '2026-05-03T10:00:00Z',
    billData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    billFileName: 'shrink_wrap_invoice.png',
    createdAt: '2026-05-02T10:00:00Z',
    updatedAt: '2026-05-03T10:00:00Z',
  },
];

const inventoryStationary: InventoryItem[] = [
  {
    id: 'st1',
    itemCode: 'ST001',
    itemName: 'A4 Paper',
    category: 'Paper',
    inventoryType: 'STATIONARY',
    currentStock: 5,
    unit: 'reams',
    minThreshold: 10,
    maxThreshold: 50,
    stockLevel: 'CRITICAL',
    lastUpdated: '2026-05-03T06:00:00Z',
  },
  {
    id: 'st2',
    itemCode: 'ST002',
    itemName: 'Ball Pens',
    category: 'Writing',
    inventoryType: 'STATIONARY',
    currentStock: 30,
    unit: 'pcs',
    minThreshold: 20,
    maxThreshold: 100,
    stockLevel: 'ADEQUATE',
    lastUpdated: '2026-05-03T06:00:00Z',
  },
];

const inventoryRawMaterial: InventoryItem[] = [
  {
    id: 'rm1',
    itemCode: 'MT001',
    itemName: 'Chicken Breast',
    category: 'Poultry',
    inventoryType: 'RAW_MATERIAL',
    currentStock: 15,
    unit: 'kg',
    minThreshold: 20,
    maxThreshold: 200,
    stockLevel: 'LOW',
    lastUpdated: '2026-05-03T06:00:00Z',
  },
  {
    id: 'rm2',
    itemCode: 'MT002',
    itemName: 'Mutton Leg',
    category: 'Mutton',
    inventoryType: 'RAW_MATERIAL',
    currentStock: 5,
    unit: 'kg',
    minThreshold: 10,
    maxThreshold: 100,
    stockLevel: 'CRITICAL',
    lastUpdated: '2026-05-03T06:00:00Z',
  },
  {
    id: 'rm3',
    itemCode: 'MT003',
    itemName: 'Pork Ribs',
    category: 'Pork',
    inventoryType: 'RAW_MATERIAL',
    currentStock: 60,
    unit: 'kg',
    minThreshold: 15,
    maxThreshold: 80,
    stockLevel: 'ADEQUATE',
    lastUpdated: '2026-05-03T06:00:00Z',
  },
  {
    id: 'rm4',
    itemCode: 'MT004',
    itemName: 'Beef Mince',
    category: 'Beef',
    inventoryType: 'RAW_MATERIAL',
    currentStock: 120,
    unit: 'kg',
    minThreshold: 30,
    maxThreshold: 150,
    stockLevel: 'EXCESS',
    lastUpdated: '2026-05-03T06:00:00Z',
  },
  {
    id: 'rm5',
    itemCode: 'MT005',
    itemName: 'Lamb Chops',
    category: 'Mutton',
    inventoryType: 'RAW_MATERIAL',
    currentStock: 8,
    unit: 'kg',
    minThreshold: 10,
    maxThreshold: 80,
    stockLevel: 'LOW',
    lastUpdated: '2026-05-03T06:00:00Z',
  },
];

const inventoryProcessed: InventoryItem[] = [
  {
    id: 'pr1',
    itemCode: 'PR001',
    itemName: 'Boneless Chicken',
    category: 'Poultry',
    inventoryType: 'PROCESSED',
    currentStock: 25,
    unit: 'kg',
    minThreshold: 20,
    maxThreshold: 100,
    stockLevel: 'ADEQUATE',
    lastUpdated: '2026-05-03T08:00:00Z',
  },
  {
    id: 'pr2',
    itemCode: 'PR002',
    itemName: 'Minced Mutton',
    category: 'Mutton',
    inventoryType: 'PROCESSED',
    currentStock: 3,
    unit: 'kg',
    minThreshold: 10,
    maxThreshold: 60,
    stockLevel: 'CRITICAL',
    lastUpdated: '2026-05-03T07:00:00Z',
  },
];

const inventoryPacked: InventoryItem[] = [
  {
    id: 'pk1',
    itemCode: 'PK001',
    itemName: 'Chicken Breast 500g Pack',
    category: 'Packed Poultry',
    inventoryType: 'PACKED',
    currentStock: 40,
    unit: 'pcs',
    minThreshold: 50,
    maxThreshold: 500,
    stockLevel: 'LOW',
    lastUpdated: '2026-05-03T09:00:00Z',
  },
  {
    id: 'pk2',
    itemCode: 'PK002',
    itemName: 'Beef Mince 250g Pack',
    category: 'Packed Beef',
    inventoryType: 'PACKED',
    currentStock: 120,
    unit: 'pcs',
    minThreshold: 50,
    maxThreshold: 400,
    stockLevel: 'ADEQUATE',
    lastUpdated: '2026-05-03T09:00:00Z',
  },
];

const inventoryWastage: InventoryItem[] = [
  {
    id: 'wt1',
    itemCode: 'WT001',
    itemName: 'Chicken Skin & Bones',
    category: 'Poultry Waste',
    inventoryType: 'WASTAGE',
    currentStock: 12,
    unit: 'kg',
    minThreshold: 0,
    maxThreshold: 50,
    stockLevel: 'ADEQUATE',
    lastUpdated: '2026-05-03T10:00:00Z',
  },
  {
    id: 'wt2',
    itemCode: 'WT002',
    itemName: 'Mutton Bone Scraps',
    category: 'Mutton Waste',
    inventoryType: 'WASTAGE',
    currentStock: 7,
    unit: 'kg',
    minThreshold: 0,
    maxThreshold: 30,
    stockLevel: 'ADEQUATE',
    lastUpdated: '2026-05-03T08:00:00Z',
  },
];

const batches: Batch[] = [
  {
    id: 'b1',
    batchNumber: 'B-2026-001',
    processingDate: '2026-05-03',
    inputItem: 'Chicken Breast (Raw)',
    inputQuantity: 50,
    inputUnit: 'kg',
    outputs: [
      { itemName: 'Boneless Chicken', quantity: 38, unit: 'kg' },
      { itemName: 'Chicken Strips', quantity: 5, unit: 'kg' },
    ],
    wastage: [{ itemName: 'Chicken Skin & Bones', quantity: 7, unit: 'kg' }],
    status: 'PROCESSING',
    performedBy: 'Team A',
    createdAt: '2026-05-03T07:00:00Z',
  },
  {
    id: 'b2',
    batchNumber: 'B-2026-002',
    processingDate: '2026-05-03',
    inputItem: 'Beef Mince (Raw)',
    inputQuantity: 100,
    inputUnit: 'kg',
    outputs: [{ itemName: 'Beef Mince Processed', quantity: 92, unit: 'kg' }],
    wastage: [{ itemName: 'Beef Fat Scraps', quantity: 8, unit: 'kg' }],
    status: 'PREPARING',
    performedBy: 'Team B',
    createdAt: '2026-05-03T09:00:00Z',
  },
  {
    id: 'b3',
    batchNumber: 'B-2026-003',
    processingDate: '2026-05-02',
    inputItem: 'Pork Ribs (Raw)',
    inputQuantity: 20,
    inputUnit: 'kg',
    outputs: [{ itemName: 'Cleaned Pork Ribs', quantity: 17, unit: 'kg' }],
    wastage: [{ itemName: 'Pork Bone Scraps', quantity: 3, unit: 'kg' }],
    status: 'COMPLETED',
    performedBy: 'Team A',
    createdAt: '2026-05-02T08:00:00Z',
  },
];

const packagingOrders: PackagingOrder[] = [
  {
    id: 'po1',
    orderNumber: 'PKG-2026-001',
    inputItem: 'Boneless Chicken',
    inputQuantity: 20,
    inputUnit: 'kg',
    outputSku: 'CHK-500G',
    packsProduced: 38,
    packSize: 500,
    packagingMaterial: 'Vacuum Bag',
    wastageCount: 2,
    status: 'COMPLETED',
    performedBy: 'Team A',
    createdAt: '2026-05-03T10:00:00Z',
  },
  {
    id: 'po2',
    orderNumber: 'PKG-2026-002',
    inputItem: 'Beef Mince Processed',
    inputQuantity: 10,
    inputUnit: 'kg',
    outputSku: 'BEF-250G',
    packsProduced: 0,
    packSize: 250,
    packagingMaterial: 'Tray + Cling Film',
    wastageCount: 0,
    status: 'PENDING',
    performedBy: 'Team B',
    createdAt: '2026-05-03T11:00:00Z',
  },
];

// ─── Pipeline types & seed ────────────────────────────────────────────────────

type PipelineOutputType = 'PROCESSED' | 'WASTAGE';
type PipelineCategory = 'POULTRY' | 'RED_MEAT' | 'PORK' | 'SEAFOOD' | 'OTHER';

interface PipelineOutput {
  id: string;
  name: string;
  type: PipelineOutputType;
  yieldPct: number;
  unit: string;
}

interface Pipeline {
  id: string;
  inputMaterial: string;
  inputUnit: string;
  category: PipelineCategory;
  outputs: PipelineOutput[];
  notes?: string;
}

const pipelines: Pipeline[] = [
  {
    id: 'pl1', inputMaterial: 'Whole Chicken', inputUnit: 'kg', category: 'POULTRY',
    notes: 'Standard broiler chicken breakdown',
    outputs: [
      { id: 'pl1o1', name: 'Chicken Breast',    type: 'PROCESSED', yieldPct: 40, unit: 'kg' },
      { id: 'pl1o2', name: 'Chicken Wings',     type: 'PROCESSED', yieldPct: 20, unit: 'kg' },
      { id: 'pl1o3', name: 'Chicken Drumstick', type: 'PROCESSED', yieldPct: 15, unit: 'kg' },
      { id: 'pl1o4', name: 'Chicken Liver',     type: 'PROCESSED', yieldPct:  5, unit: 'kg' },
      { id: 'pl1o5', name: 'Wastage / Bones',   type: 'WASTAGE',   yieldPct: 20, unit: 'kg' },
    ],
  },
  {
    id: 'pl2', inputMaterial: 'Whole Mutton', inputUnit: 'kg', category: 'RED_MEAT',
    notes: 'Fresh mutton carcass processing',
    outputs: [
      { id: 'pl2o1', name: 'Mutton Chops',    type: 'PROCESSED', yieldPct: 40, unit: 'kg' },
      { id: 'pl2o2', name: 'Mutton Mince',    type: 'PROCESSED', yieldPct: 30, unit: 'kg' },
      { id: 'pl2o3', name: 'Mutton Liver',    type: 'PROCESSED', yieldPct:  5, unit: 'kg' },
      { id: 'pl2o4', name: 'Wastage / Bones', type: 'WASTAGE',   yieldPct: 25, unit: 'kg' },
    ],
  },
  {
    id: 'pl3', inputMaterial: 'Whole Beef', inputUnit: 'kg', category: 'RED_MEAT',
    notes: 'Beef carcass — forequarter & hindquarter combined',
    outputs: [
      { id: 'pl3o1', name: 'Beef Steak Cuts', type: 'PROCESSED', yieldPct: 45, unit: 'kg' },
      { id: 'pl3o2', name: 'Beef Mince',      type: 'PROCESSED', yieldPct: 25, unit: 'kg' },
      { id: 'pl3o3', name: 'Beef Ribs',       type: 'PROCESSED', yieldPct: 20, unit: 'kg' },
      { id: 'pl3o4', name: 'Wastage / Bones', type: 'WASTAGE',   yieldPct: 10, unit: 'kg' },
    ],
  },
  {
    id: 'pl4', inputMaterial: 'Whole Pork', inputUnit: 'kg', category: 'PORK',
    outputs: [
      { id: 'pl4o1', name: 'Pork Chops',      type: 'PROCESSED', yieldPct: 38, unit: 'kg' },
      { id: 'pl4o2', name: 'Pork Ribs',       type: 'PROCESSED', yieldPct: 22, unit: 'kg' },
      { id: 'pl4o3', name: 'Pork Mince',      type: 'PROCESSED', yieldPct: 25, unit: 'kg' },
      { id: 'pl4o4', name: 'Wastage / Bones', type: 'WASTAGE',   yieldPct: 15, unit: 'kg' },
    ],
  },
  {
    id: 'pl5', inputMaterial: 'Whole Lamb', inputUnit: 'kg', category: 'RED_MEAT',
    outputs: [
      { id: 'pl5o1', name: 'Lamb Chops',      type: 'PROCESSED', yieldPct: 45, unit: 'kg' },
      { id: 'pl5o2', name: 'Lamb Mince',      type: 'PROCESSED', yieldPct: 28, unit: 'kg' },
      { id: 'pl5o3', name: 'Lamb Liver',      type: 'PROCESSED', yieldPct:  5, unit: 'kg' },
      { id: 'pl5o4', name: 'Wastage / Bones', type: 'WASTAGE',   yieldPct: 22, unit: 'kg' },
    ],
  },
  {
    id: 'pl6', inputMaterial: 'Whole Goat', inputUnit: 'kg', category: 'RED_MEAT',
    outputs: [
      { id: 'pl6o1', name: 'Goat Curry Cut',  type: 'PROCESSED', yieldPct: 55, unit: 'kg' },
      { id: 'pl6o2', name: 'Goat Mince',      type: 'PROCESSED', yieldPct: 22, unit: 'kg' },
      { id: 'pl6o3', name: 'Wastage / Bones', type: 'WASTAGE',   yieldPct: 23, unit: 'kg' },
    ],
  },
];

// ─── Controller ───────────────────────────────────────────────────────────────

@UseGuards(JwtAuthGuard)
@Controller('factory')
export class FactoryController {

  // ── Stats ──────────────────────────────────────────────────────────────────

  @Get('stats')
  getStats() {
    const activeBatches = batches.filter(
      (b) => b.status === 'PREPARING' || b.status === 'PROCESSING',
    ).length;

    const pendingDemands = demands.filter(
      (d) => d.status === 'PENDING_MANAGER' || d.status === 'PENDING_ADMIN',
    ).length;

    const allInventory = [
      ...inventoryStationary,
      ...inventoryRawMaterial,
      ...inventoryProcessed,
      ...inventoryPacked,
      ...inventoryWastage,
    ];

    const lowStockItems = allInventory.filter(
      (i) => i.stockLevel === 'CRITICAL' || i.stockLevel === 'LOW',
    ).length;

    const completedToday = batches.filter((b) => b.status === 'COMPLETED').length;

    const pendingManagerCount = demands.filter(
      (d) => d.status === 'PENDING_MANAGER',
    ).length;

    const pendingAdminCount = demands.filter(
      (d) => d.status === 'PENDING_ADMIN',
    ).length;

    const totalWastageKg = inventoryWastage
      .filter((i) => i.unit === 'kg')
      .reduce((sum, i) => sum + i.currentStock, 0);

    const totalWastageItems = inventoryWastage.length;

    return {
      activeBatches,
      pendingDemands,
      lowStockItems,
      completedToday,
      pendingManagerCount,
      pendingAdminCount,
      totalWastageKg,
      totalWastageItems,
    };
  }

  // ── Demands ────────────────────────────────────────────────────────────────

  @Get('demands')
  getDemands(@Query('status') status?: string) {
    if (status && status !== 'ALL') {
      return demands.filter((d) => d.status === status);
    }
    return demands;
  }

  @Get('demands/:id')
  getDemand(@Param('id') id: string) {
    const demand = demands.find((d) => d.id === id);
    if (!demand) throw new NotFoundException(`Demand ${id} not found`);
    return demand;
  }

  @Post('demands')
  createDemand(
    @Body() body: {
      demandType: DemandType;
      itemName: string;
      quantity: number;
      unit: string;
      priority: DemandPriority;
      dueDate: string;
      notes?: string;
      saveAsDraft?: boolean;
    },
    @CurrentUser() user: { email: string; role: string; sub: string },
  ) {
    const now = new Date().toISOString();
    const isManager = user?.role === 'MANAGER';
    const isDraft = body.saveAsDraft === true;

    let status: DemandStatus = 'PENDING_MANAGER';
    if (isDraft) {
      status = 'DRAFT';
    } else if (isManager) {
      status = 'PENDING_ADMIN';
    }

    const newDemand: Demand = {
      id: `d${Date.now()}`,
      demandType: body.demandType,
      itemCode: `${body.demandType.substring(0, 2)}${Date.now().toString().slice(-4)}`,
      itemName: body.itemName,
      quantity: body.quantity,
      unit: body.unit,
      priority: body.priority,
      status,
      requestedBy: user?.email ?? 'unknown',
      requestedByRole: user?.role ?? 'STAFF',
      dueDate: body.dueDate,
      notes: body.notes,
      createdAt: now,
      updatedAt: now,
    };

    demands.push(newDemand);
    return newDemand;
  }

  @Patch('demands/:id/status')
  updateDemandStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const demand = demands.find((d) => d.id === id);
    if (!demand) throw new NotFoundException(`Demand ${id} not found`);
    demand.status = status as DemandStatus;
    demand.updatedAt = new Date().toISOString();
    return demand;
  }

  @Patch('demands/:id/approve')
  approveDemand(
    @Param('id') id: string,
    @CurrentUser() user: { email: string; role: string; sub: string },
  ) {
    const demand = demands.find((d) => d.id === id);
    if (!demand) throw new NotFoundException(`Demand ${id} not found`);

    const isManager = user?.role === 'MANAGER';
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const now = new Date().toISOString();

    if (isManager && demand.status === 'PENDING_MANAGER') {
      demand.status = 'PENDING_ADMIN';
    } else if (isAdmin && demand.status === 'PENDING_ADMIN') {
      demand.status = 'APPROVED';
      demand.approvedBy = user?.email;
      demand.approvedByRole = user?.role;
      demand.approvedById = user?.sub;
      demand.approvedAt = now;
    }

    demand.updatedAt = now;
    return demand;
  }

  @Patch('demands/:id/reject')
  rejectDemand(
    @Param('id') id: string,
    @Body('comment') comment: string,
  ) {
    const demand = demands.find((d) => d.id === id);
    if (!demand) throw new NotFoundException(`Demand ${id} not found`);
    demand.status = 'REJECTED';
    demand.rejectionComment = comment ?? 'No reason provided';
    demand.updatedAt = new Date().toISOString();
    return demand;
  }

  @Patch('demands/:id/complete')
  completeDemand(
    @Param('id') id: string,
    @Req() req: Request,
    @CurrentUser() user: { email: string; role: string; sub: string },
  ) {
    const demand = demands.find((d) => d.id === id);
    if (!demand) throw new NotFoundException(`Demand ${id} not found`);
    if (demand.status !== 'APPROVED') {
      throw new NotFoundException(`Demand ${id} is not in APPROVED status`);
    }

    // Read directly from raw body — bypasses ValidationPipe whitelist completely
    const rawBody = req.body as any;
    const rawQty = rawBody?.receivedQuantity;
    const receivedQty = (rawQty != null && Number(rawQty) > 0)
      ? Math.min(Number(rawQty), demand.quantity)
      : demand.quantity;

    console.log(`[completeDemand] id=${id} ordered=${demand.quantity} receivedQty=${receivedQty} rawBody.receivedQuantity=${rawQty}`);

    // Determine which inventory array to update
    let targetArray: InventoryItem[];
    let inventoryType: InventoryType;
    if (demand.demandType === 'STATIONARY') {
      targetArray = inventoryStationary;
      inventoryType = 'STATIONARY';
    } else if (demand.demandType === 'PACKAGING') {
      targetArray = inventoryPacked;
      inventoryType = 'PACKED';
    } else {
      targetArray = inventoryRawMaterial;
      inventoryType = 'RAW_MATERIAL';
    }

    // Find existing item by name (case-insensitive) or create new
    const existing = targetArray.find(
      (i) => i.itemName.toLowerCase() === demand.itemName.toLowerCase(),
    );

    if (existing) {
      existing.currentStock += receivedQty;
      existing.lastUpdated = new Date().toISOString();
      const pct = existing.currentStock / existing.maxThreshold;
      existing.stockLevel =
        pct <= 0.1 ? 'CRITICAL' :
        pct <= 0.35 ? 'LOW' :
        pct <= 1.0 ? 'ADEQUATE' : 'EXCESS';
    } else {
      const newItem: InventoryItem = {
        id: `inv${Date.now()}`,
        itemCode: `${demand.demandType.substring(0, 2)}${Date.now().toString().slice(-4)}`,
        itemName: demand.itemName,
        category: demand.demandType.replace('_', ' '),
        inventoryType,
        currentStock: receivedQty,
        unit: demand.unit,
        minThreshold: 0,
        maxThreshold: receivedQty * 3,
        stockLevel: 'ADEQUATE',
        lastUpdated: new Date().toISOString(),
      };
      targetArray.push(newItem);
    }

    const now = new Date().toISOString();
    demand.status = 'COMPLETED';
    demand.updatedAt = now;
    demand.receivedBy = user?.email;
    demand.receivedByRole = user?.role;
    demand.receivedAt = now;
    demand.receivedQuantity = receivedQty;
    if (rawBody?.billData) {
      demand.billData = rawBody.billData;
      demand.billFileName = rawBody.billFileName ?? 'bill';
    }

    let remainder: Demand | undefined;
    const remainderQty = demand.quantity - receivedQty;
    if (remainderQty > 0) {
      remainder = {
        id: `d${Date.now()}`,
        demandType: demand.demandType,
        itemCode: demand.itemCode,
        itemName: demand.itemName,
        quantity: remainderQty,
        unit: demand.unit,
        priority: demand.priority,
        status: 'PENDING_ADMIN',
        requestedBy: demand.requestedBy,
        requestedByRole: demand.requestedByRole,
        dueDate: demand.dueDate,
        notes: `Partial remainder from demand ${demand.id} (${receivedQty} ${demand.unit} received of ${demand.quantity} ${demand.unit} requested)`,
        originalDemandId: demand.id,
        createdAt: now,
        updatedAt: now,
      };
      demands.push(remainder);
    }

    return { completed: demand, remainder };
  }

  // ── Inventory ──────────────────────────────────────────────────────────────

  @Get('inventory')
  getInventory(
    @Query('type') type?: InventoryType,
    @Query('search') search?: string,
  ) {
    let all: InventoryItem[];

    switch (type) {
      case 'STATIONARY':
        all = inventoryStationary;
        break;
      case 'RAW_MATERIAL':
        all = inventoryRawMaterial;
        break;
      case 'PROCESSED':
        all = inventoryProcessed;
        break;
      case 'PACKED':
        all = inventoryPacked;
        break;
      case 'WASTAGE':
        all = inventoryWastage;
        break;
      default:
        all = [
          ...inventoryStationary,
          ...inventoryRawMaterial,
          ...inventoryProcessed,
          ...inventoryPacked,
          ...inventoryWastage,
        ];
    }

    if (search) {
      const q = search.toLowerCase();
      return all.filter(
        (i) =>
          i.itemName.toLowerCase().includes(q) ||
          i.itemCode.toLowerCase().includes(q),
      );
    }

    return all;
  }

  // ── Batches ────────────────────────────────────────────────────────────────

  @Get('batches')
  getBatches(@Query('status') status?: string) {
    if (status && status !== 'ALL') {
      return batches.filter((b) => b.status === status);
    }
    return batches;
  }

  @Post('batches')
  createBatch(
    @Body() body: {
      processingDate: string;
      inputItem: string;
      inputQuantity: number;
      inputUnit: string;
      outputs: { itemName: string; quantity: number; unit: string }[];
      wastage: { itemName: string; quantity: number; unit: string }[];
    },
    @CurrentUser() user: { email: string; role: string },
  ) {
    const now = new Date().toISOString();
    const batchNum = `B-${new Date().getFullYear()}-${String(batches.length + 1).padStart(3, '0')}`;

    const newBatch: Batch = {
      id: `b${Date.now()}`,
      batchNumber: batchNum,
      processingDate: body.processingDate,
      inputItem: body.inputItem,
      inputQuantity: body.inputQuantity,
      inputUnit: body.inputUnit,
      outputs: body.outputs ?? [],
      wastage: body.wastage ?? [],
      status: 'PREPARING',
      performedBy: user?.email ?? 'unknown',
      createdAt: now,
    };

    batches.push(newBatch);
    return newBatch;
  }

  @Patch('batches/:id/status')
  updateBatchStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const batch = batches.find((b) => b.id === id);
    if (!batch) throw new NotFoundException(`Batch ${id} not found`);
    batch.status = status as BatchStatus;
    return batch;
  }

  // ── Packaging ──────────────────────────────────────────────────────────────

  @Get('packaging')
  getPackaging(@Query('status') status?: string) {
    if (status && status !== 'ALL') {
      return packagingOrders.filter((p) => p.status === status);
    }
    return packagingOrders;
  }

  // ── Pipelines ──────────────────────────────────────────────────────────────

  @Get('pipelines')
  getPipelines() {
    return pipelines;
  }

  @Post('pipelines')
  createPipeline(
    @Body() body: { inputMaterial: string; inputUnit: string; category: PipelineCategory; outputs: PipelineOutput[]; notes?: string },
  ) {
    const newPipeline: Pipeline = {
      id: `pl${Date.now()}`,
      inputMaterial: body.inputMaterial,
      inputUnit: body.inputUnit,
      category: body.category,
      outputs: (body.outputs ?? []).map((o) => ({ ...o, id: o.id || `o${Date.now()}${Math.random()}` })),
      notes: body.notes,
    };
    pipelines.push(newPipeline);
    return newPipeline;
  }

  @Patch('pipelines/:id')
  updatePipeline(
    @Param('id') id: string,
    @Body() body: Partial<Pipeline>,
  ) {
    const p = pipelines.find((pl) => pl.id === id);
    if (!p) throw new NotFoundException(`Pipeline ${id} not found`);
    if (body.inputMaterial !== undefined) p.inputMaterial = body.inputMaterial;
    if (body.inputUnit !== undefined) p.inputUnit = body.inputUnit;
    if (body.category !== undefined) p.category = body.category;
    if (body.notes !== undefined) p.notes = body.notes;
    if (body.outputs !== undefined) p.outputs = body.outputs;
    return p;
  }

  @Patch('pipelines/:id/outputs')
  updatePipelineOutputs(
    @Param('id') id: string,
    @Body() body: { outputs: PipelineOutput[] },
  ) {
    const p = pipelines.find((pl) => pl.id === id);
    if (!p) throw new NotFoundException(`Pipeline ${id} not found`);
    p.outputs = body.outputs;
    return p;
  }

  @Delete('pipelines/:id')
  deletePipeline(@Param('id') id: string) {
    const idx = pipelines.findIndex((pl) => pl.id === id);
    if (idx === -1) throw new NotFoundException(`Pipeline ${id} not found`);
    pipelines.splice(idx, 1);
    return { deleted: true };
  }

  @Post('packaging')
  createPackaging(
    @Body() body: {
      inputItem: string;
      inputQuantity: number;
      inputUnit: string;
      outputSku: string;
      packSize: number;
      packsProduced: number;
      packagingMaterial: string;
      wastageCount: number;
    },
    @CurrentUser() user: { email: string; role: string },
  ) {
    const now = new Date().toISOString();
    const orderNum = `PKG-${new Date().getFullYear()}-${String(packagingOrders.length + 1).padStart(3, '0')}`;

    const newOrder: PackagingOrder = {
      id: `po${Date.now()}`,
      orderNumber: orderNum,
      inputItem: body.inputItem,
      inputQuantity: body.inputQuantity,
      inputUnit: body.inputUnit,
      outputSku: body.outputSku,
      packsProduced: body.packsProduced ?? 0,
      packSize: body.packSize,
      packagingMaterial: body.packagingMaterial,
      wastageCount: body.wastageCount ?? 0,
      status: 'PENDING',
      performedBy: user?.email ?? 'unknown',
      createdAt: now,
    };

    packagingOrders.push(newOrder);
    return newOrder;
  }
}
