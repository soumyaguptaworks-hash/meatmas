import api from './axios';

// ─── Shared types ──────────────────────────────────────────────────────────

export type DemandStatus =
  | 'DRAFT'
  | 'PENDING_MANAGER'
  | 'PENDING_ADMIN'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type DemandType = 'RAW_MATERIAL' | 'PACKAGING' | 'STATIONARY';
export type DemandPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type BatchStatus = 'PREPARING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type StockLevel = 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'EXCESS';
export type InventoryType = 'STATIONARY' | 'RAW_MATERIAL' | 'PROCESSED' | 'PACKED' | 'WASTAGE';
export type PackagingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Demand {
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

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  inventoryType: InventoryType;
  currentStock: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  stockLevel: StockLevel;
  lastUpdated: string;
}

export interface BatchOutput {
  itemName: string;
  quantity: number;
  unit: string;
}

export interface Batch {
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

export interface PackagingOrder {
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

export type PipelineOutputType = 'PROCESSED' | 'WASTAGE';

export interface PipelineOutput {
  id: string;
  name: string;
  type: PipelineOutputType;
  yieldPct: number;
  unit: string;
}

export interface Pipeline {
  id: string;
  inputMaterial: string;
  inputUnit: string;
  category: string;
  outputs: PipelineOutput[];
  notes?: string;
}

export interface HomeStats {
  activeBatches: number;
  pendingDemands: number;
  lowStockItems: number;
  completedToday: number;
  pendingManagerCount: number;
  pendingAdminCount: number;
  totalWastageKg: number;
  totalWastageItems: number;
}

export interface CreateDemandBody {
  demandType: DemandType;
  itemName: string;
  quantity: number;
  unit: string;
  priority: DemandPriority;
  dueDate: string;
  notes?: string;
  saveAsDraft?: boolean;
}

export interface CreateBatchBody {
  processingDate: string;
  inputItem: string;
  inputQuantity: number;
  inputUnit: string;
  outputs: BatchOutput[];
  wastage: BatchOutput[];
}

export interface CreatePackagingBody {
  inputItem: string;
  inputQuantity: number;
  inputUnit: string;
  outputSku: string;
  packSize: number;
  packsProduced: number;
  packagingMaterial: string;
  wastageCount: number;
}

// ─── API calls ─────────────────────────────────────────────────────────────

export const factoryApi = {
  // Home
  getStats: () =>
    api.get<HomeStats>('/factory/stats'),

  // Demands
  getDemands: (status?: DemandStatus | 'ALL') =>
    api.get<Demand[]>('/factory/demands', {
      params: status && status !== 'ALL' ? { status } : {},
    }),

  getDemand: (id: string) =>
    api.get<Demand>(`/factory/demands/${id}`),

  createDemand: (body: CreateDemandBody) =>
    api.post<Demand>('/factory/demands', body),

  updateDemandStatus: (id: string, status: DemandStatus) =>
    api.patch<Demand>(`/factory/demands/${id}/status`, { status }),

  approveDemand: (id: string) =>
    api.patch<Demand>(`/factory/demands/${id}/approve`),

  rejectDemand: (id: string, comment: string) =>
    api.patch<Demand>(`/factory/demands/${id}/reject`, { comment }),

  completeDemand: (id: string, billData?: string, billFileName?: string, receivedQuantity?: number) => {
    const qty = receivedQuantity ?? 0;
    return api.patch<{ completed: Demand; remainder?: Demand }>(
      `/factory/demands/${id}/complete/${qty}`,
      { billData, billFileName },
    );
  },

  // Inventory
  getInventory: (type?: InventoryType, search?: string) =>
    api.get<InventoryItem[]>('/factory/inventory', {
      params: {
        ...(type ? { type } : {}),
        ...(search ? { search } : {}),
      },
    }),

  // Batches
  getBatches: (status?: BatchStatus | 'ALL') =>
    api.get<Batch[]>('/factory/batches', {
      params: status && status !== 'ALL' ? { status } : {},
    }),

  createBatch: (body: CreateBatchBody) =>
    api.post<Batch>('/factory/batches', body),

  updateBatchStatus: (id: string, status: BatchStatus) =>
    api.patch<Batch>(`/factory/batches/${id}/status`, { status }),

  // Packaging
  getPackaging: (status?: PackagingStatus | 'ALL') =>
    api.get<PackagingOrder[]>('/factory/packaging', {
      params: status && status !== 'ALL' ? { status } : {},
    }),

  createPackaging: (body: CreatePackagingBody) =>
    api.post<PackagingOrder>('/factory/packaging', body),

  // Pipelines
  getPipelines: () =>
    api.get<Pipeline[]>('/factory/pipelines'),
};
