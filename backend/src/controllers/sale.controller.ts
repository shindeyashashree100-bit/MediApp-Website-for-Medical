import type { Request, Response } from 'express';
import {
  createSale,
  SaleBatchError,
  SaleDiscountError,
  SaleInsufficientStockError,
  SaleMedicineError,
} from '../services/sale.service.js';
import { saleSchema } from '../validators/sale.validator.js';

export async function createSaleController(
  req: Request,
  res: Response,
): Promise<void> {
  const validationResult = saleSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid sale data.',
        details: validationResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const saleResult = await createSale({
      receiptNumber: validationResult.data.receiptNumber,
      discount: validationResult.data.discount,
      paymentMethod: validationResult.data.paymentMethod,
      customerName: validationResult.data.customerName ?? null,
      customerPhone: validationResult.data.customerPhone ?? null,
      notes: validationResult.data.notes ?? null,
      items: validationResult.data.items,
    });

    res.status(201).json({
      success: true,
      data: saleResult,
    });
  } catch (error: unknown) {
    if (error instanceof SaleMedicineError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MEDICINE_NOT_AVAILABLE',
          message:
            'One of the selected medicines does not exist or is inactive.',
        },
      });

      return;
    }

    if (error instanceof SaleBatchError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BATCH_NOT_AVAILABLE',
          message:
            'One of the selected batches does not exist, is inactive, or does not belong to the selected medicine.',
        },
      });

      return;
    }

    if (error instanceof SaleInsufficientStockError) {
      res.status(409).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message:
            'There is not enough stock for one of the selected batches.',
        },
      });

      return;
    }

    if (error instanceof SaleDiscountError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DISCOUNT',
          message:
            'Discount cannot be greater than the sale subtotal.',
        },
      });

      return;
    }

    console.error('Failed to create sale:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SALE_CREATION_FAILED',
        message: 'Failed to create sale.',
      },
    });
  }
}