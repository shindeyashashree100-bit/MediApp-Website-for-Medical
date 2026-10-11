import { Router } from 'express';
import {
  getExpiredController,
  getExpiringController,
  getLowStockController,
} from '../controllers/inventory-alert.controller.js';

const router = Router();

router.get('/low-stock', getLowStockController);
router.get('/expiring', getExpiringController);
router.get('/expired', getExpiredController);

export default router;