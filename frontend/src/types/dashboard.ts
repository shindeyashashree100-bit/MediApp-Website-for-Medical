export type DashboardUnit = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export type DashboardLowStockItem = {
  id: string;
  name: string;
  genericName: string | null;
  brandName: string | null;
  sku: string | null;
  unitId: string;
  unitRelation: DashboardUnit;
  minimumStock: number;
  currentStock: number;
  batches: {
    id: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
  }[];
};

export type DashboardSummary = {
  medicines: {
    total: number;
    active: number;
  };

  suppliers: {
    active: number;
  };

  inventory: {
    lowStockCount: number;
    lowStock: DashboardLowStockItem[];
    expiredBatchCount: number;
    expiringSoonBatchCount: number;
  };

  today: {
    salesCount: number;
    revenue: string | number;
  };
};

export type DashboardAlertBatch = {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  medicine: {
    id: string;
    name: string;
    genericName: string | null;
    brandName: string | null;
    sku: string | null;
    unitId: string;
    unitRelation: DashboardUnit;
  };
};