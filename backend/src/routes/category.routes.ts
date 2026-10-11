import { Router } from 'express';
import {
  activateCategoryController,
  createCategoryController,
  deactivateCategoryController,
  getCategoryController,
  listCategoriesController,
  updateCategoryController,
} from '../controllers/category.controller.js';

const router = Router();

router.get('/', listCategoriesController);
router.get('/:id', getCategoryController);

router.post('/', createCategoryController);

router.put('/:id', updateCategoryController);

router.patch('/:id/deactivate', deactivateCategoryController);
router.patch('/:id/activate', activateCategoryController);

export default router;