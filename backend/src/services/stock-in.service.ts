import { prisma } from '../lib/prisma.js';

export interface StockInInput {
  medicineId: string;
  supplierId: string;
  batchNumber: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  manufacturingDate?: Date | null;
  expiryDate: Date;
  reference?: string | null;
  notes?: string | null;
}

export class StockInMedicineError extends Error {
  constructor() {
    super('Medicine not found or inactive.');
    this.name = 'StockInMedicineError';
  }
}

export class StockInSupplierError extends Error {
  constructor() {
    super('Supplier not found or inactive.');
    this.name = 'StockInSupplierError';
  }
}

export class StockInBatchInactiveError extends Error {
  constructor() {
    super('The existing batch is inactive.');
    this.name = 'StockInBatchInactiveError';
  }
}

function normalizeBatchNumber(batchNumber: string): string {
  return batchNumber.trim().toUpperCase();
}

export async function stockIn(input: StockInInput) {
  const normalizedBatchNumber = normalizeBatchNumber(input.batchNumber);

  return prisma.$transaction(async (tx) => {
    const medicine = await tx.medicine.findFirst({
      where: {
        id: input.medicineId,
        isActive: true,
      },
    });

    if (!medicine) {
      throw new StockInMedicineError();
    }

    const supplier = await tx.supplier.findFirst({
      where: {
        id: input.supplierId,
        isActive: true,
      },
    });

    if (!supplier) {
      throw new StockInSupplierError();
    }

    let batch = await tx.batch.findUnique({
      where: {
        medicineId_normalizedBatchNumber: {
          medicineId: input.medicineId,
          normalizedBatchNumber,
        },
      },
    });

    if (batch && !batch.isActive) {
      throw new StockInBatchInactiveError();
    }

    const previousQuantity = batch?.quantity ?? 0;
    const newQuantity = previousQuantity + input.quantity;

    if (batch) {
      batch = await tx.batch.update({
        where: {
          id: batch.id,
        },
        data: {
          quantity: newQuantity,
          purchasePrice: input.purchasePrice,
          sellingPrice: input.sellingPrice,
        },
      });
    } else {
      batch = await tx.batch.create({
        data: {
          medicineId: input.medicineId,
          batchNumber: input.batchNumber.trim(),
          normalizedBatchNumber,
          purchasePrice: input.purchasePrice,
          sellingPrice: input.sellingPrice,
          quantity: input.quantity,
          manufacturingDate: input.manufacturingDate ?? null,
          expiryDate: input.expiryDate,
        },
      });
    }

    const receipt = await tx.stockReceipt.create({
      data: {
        batchId: batch.id,
        supplierId: input.supplierId,
        quantity: input.quantity,
        purchasePrice: input.purchasePrice,
        sellingPrice: input.sellingPrice,
        reference: input.reference ?? null,
        notes: input.notes ?? null,
      },
    });

    const transaction = await tx.inventoryTransaction.create({
      data: {
        medicineId: input.medicineId,
        batchId: batch.id,
        type: 'STOCK_IN',
        quantity: input.quantity,
        previousQuantity,
        newQuantity,
        reference: input.reference ?? null,
        notes: input.notes ?? null,
      },
    });

    return {
      batch,
      receipt,
      transaction,
    };
  });
}