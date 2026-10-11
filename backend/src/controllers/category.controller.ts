import type { Request, Response } from 'express';
import {
  activateCategory,
  createCategory,
  deactivateCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from '../services/category.service.js';
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator.js';

export async function listCategoriesController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true';

    const categories = await listCategories(includeInactive);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Failed to list categories:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORIES_FETCH_FAILED',
        message: 'Failed to fetch categories.',
      },
    });
  }
}

export async function getCategoryController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = categoryIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CATEGORY_ID',
        message: 'Invalid category ID.',
      },
    });

    return;
  }

  try {
    const category = await getCategoryById(idResult.data.id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Failed to get category:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_FETCH_FAILED',
        message: 'Failed to fetch category.',
      },
    });
  }
}

export async function createCategoryController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = createCategorySchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid category data.',
        details: result.error.flatten(),
      },
    });

    return;
  }

  try {
    const category = await createCategory(result.data);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error: unknown) {
    console.error('Failed to create category:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      res.status(409).json({
        success: false,
        error: {
          code: 'CATEGORY_NAME_EXISTS',
          message: 'A category with this name already exists.',
        },
      });

      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_CREATE_FAILED',
        message: 'Failed to create category.',
      },
    });
  }
}

export async function updateCategoryController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = categoryIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CATEGORY_ID',
        message: 'Invalid category ID.',
      },
    });

    return;
  }

  const bodyResult = updateCategorySchema.safeParse(req.body);

  if (!bodyResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid category data.',
        details: bodyResult.error.flatten(),
      },
    });

    return;
  }

  try {
    const category = await updateCategory(
      idResult.data.id,
      bodyResult.data,
    );

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: unknown) {
    console.error('Failed to update category:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        },
      });

      return;
    }

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      res.status(409).json({
        success: false,
        error: {
          code: 'CATEGORY_NAME_EXISTS',
          message: 'A category with this name already exists.',
        },
      });

      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_UPDATE_FAILED',
        message: 'Failed to update category.',
      },
    });
  }
}

export async function deactivateCategoryController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = categoryIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CATEGORY_ID',
        message: 'Invalid category ID.',
      },
    });

    return;
  }

  try {
    const category = await deactivateCategory(idResult.data.id);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: unknown) {
    console.error('Failed to deactivate category:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        },
      });

      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_DEACTIVATE_FAILED',
        message: 'Failed to deactivate category.',
      },
    });
  }
}

export async function activateCategoryController(
  req: Request,
  res: Response,
): Promise<void> {
  const idResult = categoryIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CATEGORY_ID',
        message: 'Invalid category ID.',
      },
    });

    return;
  }

  try {
    const category = await activateCategory(idResult.data.id);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: unknown) {
    console.error('Failed to activate category:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found.',
        },
      });

      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_ACTIVATE_FAILED',
        message: 'Failed to activate category.',
      },
    });
  }
}