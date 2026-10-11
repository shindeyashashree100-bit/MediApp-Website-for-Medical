import type { Request, Response } from 'express';
import {
  activateMedicine,
  createMedicine,
  deactivateMedicine,
  getMedicineById,
  listMedicines,
  MedicineCategoryError,
  MedicineUnitError,
  updateMedicine,
} from '../services/medicine.service.js';
import {
  createMedicineSchema,
  medicineIdSchema,
  updateMedicineSchema,
} from '../validators/medicine.validator.js';

function isPrismaError(
  error: unknown,
  code: string,
): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === code
  );
}

export async function listMedicinesController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true';

    const medicines = await listMedicines(includeInactive);

    res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    console.error('Failed to list medicines:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'MEDICINES_FETCH_FAILED',
        message: 'Failed to fetch medicines.',
      },
    });
  }
}

export async function getMedicineController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = medicineIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_MEDICINE_ID',
        message: 'Invalid medicine ID.',
      },
    });

    return;
  }

  try {
    const medicine = await getMedicineById(idResult.data.id);

    if (!medicine) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MEDICINE_NOT_FOUND',
          message: 'Medicine not found.',
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    console.error('Failed to get medicine:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'MEDICINE_FETCH_FAILED',
        message: 'Failed to fetch medicine.',
      },
    });
  }
}

export async function createMedicineController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = createMedicineSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid medicine data.',
        details: result.error.flatten(),
      },
    });

    return;
  }

  try {
    const medicine = await createMedicine(result.data);

    res.status(201).json({
      success: true,
      data: medicine,
    });
  } catch (error: unknown) {
    if (error instanceof MedicineCategoryError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_AVAILABLE',
          message: 'The selected category does not exist or is inactive.',
        },
      });

      return;
    }
        if (error instanceof MedicineUnitError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UNIT_NOT_AVAILABLE',
          message: 'The selected unit does not exist or is inactive.',
        },
      });

      return;
    }
    if (error instanceof MedicineUnitError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UNIT_NOT_AVAILABLE',
          message: 'The selected unit does not exist or is inactive.',
        },
      });

      return;
    }

    if (isPrismaError(error, 'P2002')) {
      res.status(409).json({
        success: false,
        error: {
          code: 'MEDICINE_SKU_EXISTS',
          message: 'A medicine with this SKU already exists.',
        },
      });

      return;
    }

    console.error('Failed to create medicine:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'MEDICINE_CREATE_FAILED',
        message: 'Failed to create medicine.',
      },
    });
  }
}

export async function updateMedicineController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = medicineIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_MEDICINE_ID',
        message: 'Invalid medicine ID.',
      },
    });

    return;
  }

  const bodyResult = updateMedicineSchema.safeParse(req.body);

  if (!bodyResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid medicine data.',
        details: bodyResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const medicine = await updateMedicine(
      idResult.data.id,
      bodyResult.data,
    );

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error: unknown) {
    if (error instanceof MedicineCategoryError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_AVAILABLE',
          message: 'The selected category does not exist or is inactive.',
        },
      });

      return;
    }

    if (isPrismaError(error, 'P2025')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MEDICINE_NOT_FOUND',
          message: 'Medicine not found.',
        },
      });

      return;
    }

    if (isPrismaError(error, 'P2002')) {
      res.status(409).json({
        success: false,
        error: {
          code: 'MEDICINE_SKU_EXISTS',
          message: 'A medicine with this SKU already exists.',
        },
      });

      return;
    }

    console.error('Failed to update medicine:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'MEDICINE_UPDATE_FAILED',
        message: 'Failed to update medicine.',
      },
    });
  }
}

export async function deactivateMedicineController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = medicineIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_MEDICINE_ID',
        message: 'Invalid medicine ID.',
      },
    });

    return;
  }

  try {
    const medicine = await deactivateMedicine(idResult.data.id);

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2025')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MEDICINE_NOT_FOUND',
          message: 'Medicine not found.',
        },
      });

      return;
    }

    console.error('Failed to deactivate medicine:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'MEDICINE_DEACTIVATE_FAILED',
        message: 'Failed to deactivate medicine.',
      },
    });
  }
}

export async function activateMedicineController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = medicineIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_MEDICINE_ID',
        message: 'Invalid medicine ID.',
      },
    });

    return;
  }

  try {
    const medicine = await activateMedicine(idResult.data.id);

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2025')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MEDICINE_NOT_FOUND',
          message: 'Medicine not found.',
        },
      });

      return;
    }

    console.error('Failed to activate medicine:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'MEDICINE_ACTIVATE_FAILED',
        message: 'Failed to activate medicine.',
      },
    });
  }
}