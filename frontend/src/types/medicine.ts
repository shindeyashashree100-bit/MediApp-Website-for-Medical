export type MedicineCategory = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MedicineUnit = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Medicine = {
  id: string;
  name: string;
  genericName: string | null;
  brandName: string | null;
  sku: string | null;

  unitId: string;
  unitRelation: MedicineUnit;

  description: string | null;
  minimumStock: number;
  currentStock: number;
  isActive: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;

  category: MedicineCategory;
};

export type MedicineBatch = {
  id: string;
  medicineId: string;
  batchNumber: string;
  normalizedBatchNumber: string;
  purchasePrice: string;
  sellingPrice: string;
  quantity: number;
  manufacturingDate: string | null;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MedicineDetail = Medicine & {
  batches: MedicineBatch[];
};

export type CreateMedicineInput = {
  name: string;
  genericName?: string | null;
  brandName?: string | null;
  sku?: string | null;

  unitId: string;

  description?: string | null;
  minimumStock?: number;
  categoryId: string;
};

export type UpdateMedicineInput = {
  name?: string;
  genericName?: string | null;
  brandName?: string | null;
  sku?: string | null;

  unitId?: string;

  description?: string | null;
  minimumStock?: number;
  categoryId?: string;
};