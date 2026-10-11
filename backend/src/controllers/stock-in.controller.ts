import type { Request, Response } from 'express';
import {
  stockIn,
  StockInBatchInactiveError,
  StockInMedicineError,
  StockInSupplierError,
} from '../services/stock-in.service.js';
import { stockInSchema } from '../validators/stock-in.validator.js';

export async function stockInController(
  req: Request,
  res: Response,
): Promise<void> {
  const validationResult = stockInSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid stock-in data.',
        details: validationResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const stockInResult = await stockIn({
      medicineId: validationResult.data.medicineId,
      supplierId: validationResult.data.supplierId,
      batchNumber: validationResult.data.batchNumber,
      purchasePrice: validationResult.data.purchasePrice,
      sellingPrice: validationResult.data.sellingPrice,
      quantity: validationResult.data.quantity,
      manufacturingDate: validationResult.data.manufacturingDate
        ? new Date(validationResult.data.manufacturingDate)
        : null,
      expiryDate: new Date(validationResult.data.expiryDate),
      reference: validationResult.data.reference ?? null,
      notes: validationResult.data.notes ?? null,
    });

    res.status(201).json({
      success: true,
      data: stockInResult,
    });
  } catch (error: unknown) {
    if (error instanceof StockInMedicineError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MEDICINE_NOT_AVAILABLE',
          message: 'The selected medicine does not exist or is inactive.',
        },
      });

      return;
    }

    if (error instanceof StockInSupplierError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SUPPLIER_NOT_AVAILABLE',
          message: 'The selected supplier does not exist or is inactive.',
        },
      });

      return;
    }

    if (error instanceof StockInBatchInactiveError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BATCH_INACTIVE',
          message:
            'The selected batch is inactive and cannot receive additional stock.',
        },
      });

      return;
    }

    console.error('Failed to process stock-in:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'STOCK_IN_FAILED',
        message: 'Failed to process stock-in.',
      },
    });
  }
}