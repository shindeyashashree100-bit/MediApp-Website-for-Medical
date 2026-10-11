import type { Request, Response } from 'express';
import {
  activateSupplier,
  createSupplier,
  deactivateSupplier,
  getSupplierById,
  listSuppliers,
  updateSupplier,
} from '../services/supplier.service.js';
import {
  createSupplierSchema,
  supplierIdSchema,
  updateSupplierSchema,
} from '../validators/supplier.validator.js';

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

export async function listSuppliersController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true';

    const suppliers = await listSuppliers(includeInactive);

    res.status(200).json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    console.error('Failed to list suppliers:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIERS_FETCH_FAILED',
        message: 'Failed to fetch suppliers.',
      },
    });
  }
}

export async function getSupplierController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = supplierIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_SUPPLIER_ID',
        message: 'Invalid supplier ID.',
      },
    });

    return;
  }

  try {
    const supplier = await getSupplierById(idResult.data.id);

    if (!supplier) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SUPPLIER_NOT_FOUND',
          message: 'Supplier not found.',
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Failed to get supplier:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_FETCH_FAILED',
        message: 'Failed to fetch supplier.',
      },
    });
  }
}

export async function createSupplierController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = createSupplierSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid supplier data.',
        details: result.error.flatten(),
      },
    });

    return;
  }

  try {
    const supplier = await createSupplier(result.data);

    res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Failed to create supplier:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_CREATE_FAILED',
        message: 'Failed to create supplier.',
      },
    });
  }
}

export async function updateSupplierController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = supplierIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_SUPPLIER_ID',
        message: 'Invalid supplier ID.',
      },
    });

    return;
  }

  const bodyResult = updateSupplierSchema.safeParse(req.body);

  if (!bodyResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid supplier data.',
        details: bodyResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const supplier = await updateSupplier(
      idResult.data.id,
      bodyResult.data,
    );

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2025')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SUPPLIER_NOT_FOUND',
          message: 'Supplier not found.',
        },
      });

      return;
    }

    console.error('Failed to update supplier:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_UPDATE_FAILED',
        message: 'Failed to update supplier.',
      },
    });
  }
}

export async function deactivateSupplierController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = supplierIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_SUPPLIER_ID',
        message: 'Invalid supplier ID.',
      },
    });

    return;
  }

  try {
    const supplier = await deactivateSupplier(idResult.data.id);

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2025')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SUPPLIER_NOT_FOUND',
          message: 'Supplier not found.',
        },
      });

      return;
    }

    console.error('Failed to deactivate supplier:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_DEACTIVATE_FAILED',
        message: 'Failed to deactivate supplier.',
      },
    });
  }
}

export async function activateSupplierController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = supplierIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_SUPPLIER_ID',
        message: 'Invalid supplier ID.',
      },
    });

    return;
  }

  try {
    const supplier = await activateSupplier(idResult.data.id);

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error: unknown) {
    if (isPrismaError(error, 'P2025')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SUPPLIER_NOT_FOUND',
          message: 'Supplier not found.',
        },
      });

      return;
    }

    console.error('Failed to activate supplier:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SUPPLIER_ACTIVATE_FAILED',
        message: 'Failed to activate supplier.',
      },
    });
  }
}