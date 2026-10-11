export type BatchMedicine = {
  id: string;
  name: string;
  genericName: string | null;
  brandName: string | null;
  unitRelation: {
    id: string;
    name: string;
  };
};

export type Batch = {
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
  medicine: BatchMedicine;
};