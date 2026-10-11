import type { Request, Response } from 'express';
import {
  activateUnit,
  createUnit,
  deactivateUnit,
  getUnitById,
  listUnits,
  updateUnit,
} from '../services/unit.service.js';
import {
  createUnitSchema,
  unitIdSchema,
  updateUnitSchema,
} from '../validators/unit.validator.js';

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

export async function listUnitsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const includeInactive =
      req.query.includeInactive === 'true';

    const units = await listUnits(includeInactive);

    res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    console.error('Failed to list units:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'UNITS_FETCH_FAILED',
        message: 'Failed to fetch units.',
      },
    });
  }
}

export async function getUnitController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = unitIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_UNIT_ID',
        message: 'Invalid unit ID.',
        details: idResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const unit = await getUnitById(idResult.data.id);

    if (!unit) {
      res.status(404).json({
        success: false,
        error: {
          code: 'UNIT_NOT_FOUND',
          message: 'Unit not found.',
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    console.error('Failed to get unit:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'UNIT_FETCH_FAILED',
        message: 'Failed to fetch unit.',
      },
    });
  }
}

export async function createUnitController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = createUnitSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid unit data.',
        details: result.error.flatten(),
      },
    });

    return;
  }

  try {
    const unit = await createUnit(result.data);

    res.status(201).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    if (isPrismaError(error, 'P2002')) {
      res.status(409).json({
        success: false,
        error: {
          code: 'UNIT_NAME_EXISTS',
          message: 'A unit with this name already exists.',
        },
      });

      return;
    }

    console.error('Failed to create unit:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'UNIT_CREATE_FAILED',
        message: 'Failed to create unit.',
      },
    });
  }
}

export async function updateUnitController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = unitIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_UNIT_ID',
        message: 'Invalid unit ID.',
        details: idResult.error.flatten(),
      },
    });

    return;
  }

  const bodyResult = updateUnitSchema.safeParse(req.body);

  if (!bodyResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid unit data.',
        details: bodyResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const unit = await updateUnit(
      idResult.data.id,
      bodyResult.data,
    );

    res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    if (isPrismaError(error, 'P2025')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'UNIT_NOT_FOUND',
          message: 'Unit not found.',
        },
      });

      return;
    }

    if (isPrismaError(error, 'P2002')) {
      res.status(409).json({
        success: false,
        error: {
          code: 'UNIT_NAME_EXISTS',
          message: 'A unit with this name already exists.',
        },
      });

      return;
    }

    console.error('Failed to update unit:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'UNIT_UPDATE_FAILED',
        message: 'Failed to update unit.',
      },
    });
  }
}

export async function deactivateUnitController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = unitIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_UNIT_ID',
        message: 'Invalid unit ID.',
        details: idResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const unit = await deactivateUnit(idResult.data.id);

    res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    if (isPrismaError(error, 'P2025')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'UNIT_NOT_FOUND',
          message: 'Unit not found.',
        },
      });

      return;
    }

    console.error('Failed to deactivate unit:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'UNIT_DEACTIVATE_FAILED',
        message: 'Failed to deactivate unit.',
      },
    });
  }
}

export async function activateUnitController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = unitIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_UNIT_ID',
        message: 'Invalid unit ID.',
        details: idResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const unit = await activateUnit(idResult.data.id);

    res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    if (isPrismaError(error, 'P2025')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'UNIT_NOT_FOUND',
          message: 'Unit not found.',
        },
      });

      return;
    }

    console.error('Failed to activate unit:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'UNIT_ACTIVATE_FAILED',
        message: 'Failed to activate unit.',
      },
    });
  }
}