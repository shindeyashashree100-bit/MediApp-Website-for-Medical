import type { Request, Response } from 'express';
import { z } from 'zod';
import { getAvailableBatchesForMedicine } from '../services/batch-query.service.js';

const medicineIdSchema = z.string().uuid();

export async function getAvailableBatchesController(
  req: Request,
  res: Response,
): Promise<void> {
  const medicineIdResult = medicineIdSchema.safeParse(
    req.params.medicineId,
  );

  if (!medicineIdResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid medicine ID.',
        details: medicineIdResult.error.flatten(),
      },
    });

    return;
  }

  const medicineId = medicineIdResult.data;

  const result = await getAvailableBatchesForMedicine(
    medicineId,
  );

  if (!result) {
    res.status(404).json({
      success: false,
      error: {
        code: 'MEDICINE_NOT_FOUND',
        message: 'Medicine not found or inactive.',
      },
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: result,
  });
}