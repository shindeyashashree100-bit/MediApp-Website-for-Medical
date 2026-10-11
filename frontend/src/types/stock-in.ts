import type { MedicineUnit } from '@/types/medicine';

export interface StockInMedicine {
  id: string;
  name: string;
  unitId: string;
  unitRelation: MedicineUnit;
}

export interface StockInSupplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockInInput {
  medicineId: string;
  supplierId: string;
  batchNumber: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  manufacturingDate?: string | null;
  expiryDate: string;
  reference?: string | null;
  notes?: string | null;
}

export interface StockInBatch {
  id: string;
  batchNumber: string;
  normalizedBatchNumber: string;
  purchasePrice: string;
  sellingPrice: string;
  quantity: number;
  manufacturingDate: string | null;
  expiryDate: string;
}

export interface StockInResult {
  batch: StockInBatch;
  receipt: {
    id: string;
    batchId: string;
    supplierId: string;
    quantity: number;
    purchasePrice: string;
    sellingPrice: string;
    reference: string | null;
    receivedAt: string;
    notes: string | null;
    createdAt: string;
  };
  transaction: {
    id: string;
    medicineId: string;
    batchId: string;
    type: 'STOCK_IN';
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    adjustmentType: string | null;
    adjustmentReason: string | null;
    reference: string | null;
    notes: string | null;
    createdAt: string;
  };
}
