import type { Request, Response } from 'express';
import {
  adjustInventory,
  AdjustmentBatchError,
  AdjustmentInsufficientStockError,
  AdjustmentMedicineError,
} from '../services/inventory-adjustment.service.js';
import { inventoryAdjustmentSchema } from '../validators/inventory-adjustment.validator.js';

export async function inventoryAdjustmentController(
  req: Request,
  res: Response,
): Promise<void> {
  const validationResult = inventoryAdjustmentSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid inventory adjustment data.',
        details: validationResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const adjustmentResult = await adjustInventory({
      medicineId: validationResult.data.medicineId,
      batchId: validationResult.data.batchId,
      adjustmentType: validationResult.data.adjustmentType,
      quantity: validationResult.data.quantity,
      adjustmentReason: validationResult.data.adjustmentReason,
      reference: validationResult.data.reference ?? null,
      notes: validationResult.data.notes ?? null,
    });

    res.status(200).json({
      success: true,
      data: adjustmentResult,
    });
  } catch (error: unknown) {
    if (error instanceof AdjustmentMedicineError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MEDICINE_NOT_AVAILABLE',
          message: 'The selected medicine does not exist or is inactive.',
        },
      });

      return;
    }

    if (error instanceof AdjustmentBatchError) {
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

    if (error instanceof AdjustmentInsufficientStockError) {
      res.status(409).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message:
            'There is not enough stock for this decrease adjustment.',
        },
      });

      return;
    }

    console.error('Failed to adjust inventory:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INVENTORY_ADJUSTMENT_FAILED',
        message: 'Failed to adjust inventory.',
      },
    });
  }
}