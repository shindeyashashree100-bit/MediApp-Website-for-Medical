import type { Request, Response } from 'express';
import {
  getSaleById,
  getSales,
} from '../services/sale-query.service.js';
import {
  saleIdSchema,
  saleListQuerySchema,
} from '../validators/sale-query.validator.js';

export async function getSalesController(
  req: Request,
  res: Response,
): Promise<void> {
  const validationResult = saleListQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid sales query.',
        details: validationResult.error.flatten(),
      },
    });

    return;
  }

  const result = await getSales({
    page: validationResult.data.page,
    limit: validationResult.data.limit,
    search: validationResult.data.search,
    paymentMethod: validationResult.data.paymentMethod,
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}

export async function getSaleByIdController(
  req: Request,
  res: Response,
): Promise<void> {
  const validationResult = saleIdSchema.safeParse(req.params);

  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid sale ID.',
        details: validationResult.error.flatten(),
      },
    });

    return;
  }

  const sale = await getSaleById(validationResult.data.id);

  if (!sale) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SALE_NOT_FOUND',
        message: 'Sale not found.',
      },
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: sale,
  });
}