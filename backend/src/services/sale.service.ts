import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';

export interface CreateSaleItemInput {
  medicineId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleInput {
  receiptNumber?: string;
  discount?: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'OTHER';
  customerName?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  items: CreateSaleItemInput[];
}

export class SaleMedicineError extends Error {
  constructor() {
    super('A selected medicine does not exist or is inactive.');
    this.name = 'SaleMedicineError';
  }
}

export class SaleBatchError extends Error {
  constructor() {
    super(
      'A selected batch does not exist, is inactive, or does not belong to the selected medicine.',
    );
    this.name = 'SaleBatchError';
  }
}

export class SaleInsufficientStockError extends Error {
  constructor() {
    super('There is not enough stock for one of the selected batches.');
    this.name = 'SaleInsufficientStockError';
  }
}

export class SaleDiscountError extends Error {
  constructor() {
    super('Discount cannot be greater than the sale subtotal.');
    this.name = 'SaleDiscountError';
  }
}

function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = randomUUID().slice(0, 8).toUpperCase();

  return `SALE-${timestamp}-${suffix}`;
}

export async function createSale(input: CreateSaleInput) {
  return prisma.$transaction(async (tx) => {
    const receiptNumber =
      input.receiptNumber?.trim() || generateReceiptNumber();

    const operationId = randomUUID();

    const operation = await tx.inventoryOperation.create({
      data: {
        operationId,
        type: 'SALE',
        status: 'PENDING',
      },
    });

    try {
      let subtotal = 0;

      const preparedItems: CreateSaleItemInput[] = [];

      for (const item of input.items) {
        const medicine = await tx.medicine.findFirst({
          where: {
            id: item.medicineId,
            isActive: true,
          },
        });

        if (!medicine) {
          throw new SaleMedicineError();
        }

        const batch = await tx.batch.findFirst({
          where: {
            id: item.batchId,
            medicineId: item.medicineId,
            isActive: true,
          },
        });

        if (!batch) {
          throw new SaleBatchError();
        }

        if (batch.quantity < item.quantity) {
          throw new SaleInsufficientStockError();
        }

        subtotal += item.quantity * item.unitPrice;

        preparedItems.push(item);
      }

      const discount = input.discount ?? 0;

      if (discount > subtotal) {
        throw new SaleDiscountError();
      }

      const totalAmount = subtotal - discount;

      const sale = await tx.sale.create({
        data: {
          receiptNumber,
          saleDate: new Date(),
          subtotal,
          discount,
          totalAmount,
          paymentMethod: input.paymentMethod,
          customerName: input.customerName ?? null,
          customerPhone: input.customerPhone ?? null,
          notes: input.notes ?? null,
          operationId,
        },
      });

      const createdItems = [];

      for (const item of preparedItems) {
        const batch = await tx.batch.findFirst({
          where: {
            id: item.batchId,
            medicineId: item.medicineId,
            isActive: true,
          },
        });

        if (!batch) {
          throw new SaleBatchError();
        }

        const updatedBatch = await tx.batch.updateMany({
          where: {
            id: batch.id,
            quantity: {
              gte: item.quantity,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedBatch.count !== 1) {
          throw new SaleInsufficientStockError();
        }

        const previousQuantity = batch.quantity;
        const newQuantity = previousQuantity - item.quantity;
        const totalPrice = item.quantity * item.unitPrice;

        const saleItem = await tx.saleItem.create({
          data: {
            saleId: sale.id,
            medicineId: item.medicineId,
            batchId: item.batchId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice,
          },
        });

        createdItems.push(saleItem);

        await tx.inventoryTransaction.create({
          data: {
            medicineId: item.medicineId,
            batchId: item.batchId,
            type: 'STOCK_OUT',
            quantity: item.quantity,
            previousQuantity,
            newQuantity,
            reference: receiptNumber,
            notes: `Sale ${receiptNumber}`,
          },
        });
      }

      await tx.inventoryOperation.update({
        where: {
          id: operation.id,
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return {
        sale,
        items: createdItems,
      };
    } catch (error) {
      await tx.inventoryOperation.update({
        where: {
          id: operation.id,
        },
        data: {
          status: 'FAILED',
        },
      });

      throw error;
    }
  });
}