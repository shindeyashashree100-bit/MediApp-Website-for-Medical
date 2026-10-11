export type ReportUnit = {
  id: string;
  name: string;
};

export type InventoryReportBatch = {
  id: string;
  batchNumber: string;
  purchasePrice: string;
  sellingPrice: string;
  quantity: number;
  manufacturingDate: string | null;
  expiryDate: string;
};

export type InventoryReportItem = {
  id: string;
  name: string;
  genericName: string | null;
  brandName: string | null;
  sku: string | null;
  minimumStock: number;
  unitRelation: ReportUnit;
  batches: InventoryReportBatch[];
  currentStock: number;
  stockValue: number;
  sellingValue: number;
};

export type StockMovement = {
  id: string;
  medicineId: string;
  batchId: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  adjustmentType:
    | 'INCREASE'
    | 'DECREASE'
    | null;
  adjustmentReason:
    | 'PHYSICAL_COUNT'
    | 'DAMAGED'
    | 'EXPIRED'
    | 'LOST'
    | 'CORRECTION'
    | 'OTHER'
    | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;

  medicine: {
    id: string;
    name: string;
    sku: string | null;
    unitRelation: ReportUnit;
  };

  batch: {
    id: string;
    batchNumber: string;
    expiryDate: string;
  };
};

export type SalesReportItem = {
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
    sku: string | null;
    unitRelation: ReportUnit;
  };

  batch: {
    id: string;
    batchNumber: string;
    expiryDate: string;
  };
};

export type SalesReportSale = {
  id: string;
  receiptNumber: string;
  saleDate: string;
  subtotal: string;
  discount: string;
  totalAmount: string;
  paymentMethod:
    | 'CASH'
    | 'UPI'
    | 'CARD'
    | 'OTHER';
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
  operationId: string;
  createdAt: string;
  items: SalesReportItem[];
};

export type SalesReportSummary = {
  totalSales: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
};

export type ExpiryReportItem = {
  id: string;
  batchNumber: string;
  quantity: number;
  purchasePrice: string;
  sellingPrice: string;
  manufacturingDate: string | null;
  expiryDate: string;

  medicine: {
    id: string;
    name: string;
    genericName: string | null;
    brandName: string | null;
    sku: string | null;
    unitRelation: ReportUnit;
  };
};

export type ExpiryReportResponse = {
  warningDays: number;
  data: ExpiryReportItem[];
};