import { Router } from 'express';
import { createSaleController } from '../controllers/sale.controller.js';
import {
  getSaleByIdController,
  getSalesController,
} from '../controllers/sale-query.controller.js';

const router = Router();

router.get('/', getSalesController);
router.get('/:id', getSaleByIdController);
router.post('/', createSaleController);

export default router;