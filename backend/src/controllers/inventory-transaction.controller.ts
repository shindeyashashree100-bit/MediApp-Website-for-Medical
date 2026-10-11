import type { Request, Response } from 'express';
import { z } from 'zod';
import { getBatchTransactions } from '../services/inventory-transaction.service.js';

const batchIdSchema = z.string().uuid();

export async function getBatchTransactionsController(
  req: Request,
  res: Response,
): Promise<void> {
  const batchIdResult = batchIdSchema.safeParse(
    req.params.batchId,
  );

  if (!batchIdResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid batch ID.',
        details: batchIdResult.error.flatten(),
      },
    });

    return;
  }

  const result = await getBatchTransactions(
    batchIdResult.data,
  );

  if (!result) {
    res.status(404).json({
      success: false,
      error: {
        code: 'BATCH_NOT_FOUND',
        message: 'Batch not found.',
      },
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: result,
  });
}