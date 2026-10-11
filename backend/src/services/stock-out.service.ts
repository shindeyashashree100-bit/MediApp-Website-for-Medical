import { prisma } from '../lib/prisma.js';

export interface StockOutInput {
  medicineId: string;
  batchId: string;
  quantity: number;
  reference?: string | null;
  notes?: string | null;
}

export class StockOutMedicineError extends Error {
  constructor() {
    super('Medicine not found or inactive.');
    this.name = 'StockOutMedicineError';
  }
}

export class StockOutBatchError extends Error {
  constructor() {
    super('Batch not found, inactive, or does not belong to the selected medicine.');
    this.name = 'StockOutBatchError';
  }
}

export class StockOutInsufficientStockError extends Error {
  constructor() {
    super('Insufficient stock for this batch.');
    this.name = 'StockOutInsufficientStockError';
  }
}

export async function stockOut(input: StockOutInput) {
  return prisma.$transaction(async (tx) => {
    const medicine = await tx.medicine.findFirst({
      where: {
        id: input.medicineId,
        isActive: true,
      },
    });

    if (!medicine) {
      throw new StockOutMedicineError();
    }

    const batch = await tx.batch.findFirst({
      where: {
        id: input.batchId,
        medicineId: input.medicineId,
        isActive: true,
      },
    });

    if (!batch) {
      throw new StockOutBatchError();
    }

    if (batch.quantity < input.quantity) {
      throw new StockOutInsufficientStockError();
    }

    const previousQuantity = batch.quantity;
    const newQuantity = previousQuantity - input.quantity;

    const updatedBatch = await tx.batch.update({
      where: {
        id: batch.id,
      },
      data: {
        quantity: newQuantity,
      },
    });

    const transaction = await tx.inventoryTransaction.create({
      data: {
        medicineId: input.medicineId,
        batchId: batch.id,
        type: 'STOCK_OUT',
        quantity: input.quantity,
        previousQuantity,
        newQuantity,
        reference: input.reference ?? null,
        notes: input.notes ?? null,
      },
    });

    return {
      batch: updatedBatch,
      transaction,
    };
  });
}