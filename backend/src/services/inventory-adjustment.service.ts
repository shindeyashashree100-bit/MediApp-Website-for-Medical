import { prisma } from '../lib/prisma.js';

export interface InventoryAdjustmentInput {
  medicineId: string;
  batchId: string;
  adjustmentType: 'INCREASE' | 'DECREASE';
  quantity: number;
  adjustmentReason:
    | 'PHYSICAL_COUNT'
    | 'DAMAGED'
    | 'EXPIRED'
    | 'LOST'
    | 'CORRECTION'
    | 'OTHER';
  reference?: string | null;
  notes?: string | null;
}

export class AdjustmentMedicineError extends Error {
  constructor() {
    super('Medicine not found or inactive.');
    this.name = 'AdjustmentMedicineError';
  }
}

export class AdjustmentBatchError extends Error {
  constructor() {
    super(
      'The selected batch does not exist, is inactive, or does not belong to the selected medicine.',
    );
    this.name = 'AdjustmentBatchError';
  }
}

export class AdjustmentInsufficientStockError extends Error {
  constructor() {
    super('There is not enough stock for this decrease adjustment.');
    this.name = 'AdjustmentInsufficientStockError';
  }
}

export async function adjustInventory(
  input: InventoryAdjustmentInput,
) {
  return prisma.$transaction(async (tx) => {
    const medicine = await tx.medicine.findFirst({
      where: {
        id: input.medicineId,
        isActive: true,
      },
    });

    if (!medicine) {
      throw new AdjustmentMedicineError();
    }

    const batch = await tx.batch.findFirst({
      where: {
        id: input.batchId,
        medicineId: input.medicineId,
        isActive: true,
      },
    });

    if (!batch) {
      throw new AdjustmentBatchError();
    }

    const previousQuantity = batch.quantity;

    const newQuantity =
      input.adjustmentType === 'INCREASE'
        ? previousQuantity + input.quantity
        : previousQuantity - input.quantity;

    if (newQuantity < 0) {
      throw new AdjustmentInsufficientStockError();
    }

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
        batchId: input.batchId,
        type: 'ADJUSTMENT',
        quantity: input.quantity,
        previousQuantity,
        newQuantity,
        adjustmentType: input.adjustmentType,
        adjustmentReason: input.adjustmentReason,
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