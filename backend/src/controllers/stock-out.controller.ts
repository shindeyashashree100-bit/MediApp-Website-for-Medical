import type { Request, Response } from 'express';
import {
  stockOut,
  StockOutBatchError,
  StockOutInsufficientStockError,
  StockOutMedicineError,
} from '../services/stock-out.service.js';
import { stockOutSchema } from '../validators/stock-out.validator.js';

export async function stockOutController(
  req: Request,
  res: Response,
): Promise<void> {
  const validationResult = stockOutSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid stock-out data.',
        details: validationResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const stockOutResult = await stockOut({
      medicineId: validationResult.data.medicineId,
      batchId: validationResult.data.batchId,
      quantity: validationResult.data.quantity,
      reference: validationResult.data.reference ?? null,
      notes: validationResult.data.notes ?? null,
    });

    res.status(200).json({
      success: true,
      data: stockOutResult,
    });
  } catch (error: unknown) {
    if (error instanceof StockOutMedicineError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MEDICINE_NOT_AVAILABLE',
          message: 'The selected medicine does not exist or is inactive.',
        },
      });

      return;
    }

    if (error instanceof StockOutBatchError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BATCH_NOT_AVAILABLE',
          message:
            'The selected batch does not exist, is inactive, or does not belong to the selected medicine.',
        },
      });

      return;
    }

    if (error instanceof StockOutInsufficientStockError) {
      res.status(409).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: 'There is not enough stock in the selected batch.',
        },
      });

      return;
    }

    console.error('Failed to process stock-out:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'STOCK_OUT_FAILED',
        message: 'Failed to process stock-out.',
      },
    });
  }
}