export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'CARD'
  | 'OTHER';

export type SaleItemInput = {
  medicineId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
};

export type CreateSaleInput = {
  receiptNumber?: string;
  discount?: number;
  paymentMethod: PaymentMethod;
  customerName?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  items: SaleItemInput[];
};

export type SaleItem = {
  id: string;
  saleId: string;
  medicineId: string;
  batchId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  medicine: {
    id: string;
    name: string;
    genericName?: string | null;
    brandName?: string | null;
    sku: string | null;
    unitId: string;
    unitRelation: {
      id: string;
      name: string;
    };
  };
  batch: {
    id: string;
    batchNumber: string;
    normalizedBatchNumber?: string;
    purchasePrice?: string;
    sellingPrice?: string;
    expiryDate: string;
  };
};

export type Sale = {
  id: string;
  receiptNumber: string;
  saleDate: string;
  subtotal: string;
  discount: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
  operationId: string;
  createdAt: string;
  items: SaleItem[];
};

export type SalesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};