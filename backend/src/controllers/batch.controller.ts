import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  getBatchById,
  listBatches,
} from '../services/batch.service.js';

const batchIdSchema = z.object({
  id: z.string().uuid(),
});

export async function listBatchesController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const includeInactive =
      req.query.includeInactive === 'true';

    const batches = await listBatches(includeInactive);

    res.status(200).json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error('Failed to list batches:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'BATCHES_FETCH_FAILED',
        message: 'Failed to fetch batches.',
      },
    });
  }
}

export async function getBatchController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = batchIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_BATCH_ID',
        message: 'Invalid batch ID.',
      },
    });

    return;
  }

  try {
    const batch = await getBatchById(idResult.data.id);

    if (!batch) {
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
      data: batch,
    });
  } catch (error) {
    console.error('Failed to get batch:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_FETCH_FAILED',
        message: 'Failed to fetch batch.',
      },
    });
  }
}