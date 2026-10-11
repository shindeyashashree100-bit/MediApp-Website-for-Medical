import { Router } from 'express';
import { inventoryAdjustmentController } from '../controllers/inventory-adjustment.controller.js';

const router = Router();

router.post('/', inventoryAdjustmentController);

export default router;