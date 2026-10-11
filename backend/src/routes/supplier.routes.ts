import { Router } from 'express';
import {
  activateSupplierController,
  createSupplierController,
  deactivateSupplierController,
  getSupplierController,
  listSuppliersController,
  updateSupplierController,
} from '../controllers/supplier.controller.js';

const router = Router();

router.get('/', listSuppliersController);
router.get('/:id', getSupplierController);

router.post('/', createSupplierController);

router.put('/:id', updateSupplierController);

router.patch('/:id/deactivate', deactivateSupplierController);
router.patch('/:id/activate', activateSupplierController);

export default router;