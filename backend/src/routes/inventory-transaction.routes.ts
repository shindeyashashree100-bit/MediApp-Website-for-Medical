import { Router } from 'express';
import { getBatchTransactionsController } from '../controllers/inventory-transaction.controller.js';

const router = Router();

router.get(
  '/batches/:batchId/transactions',
  getBatchTransactionsController,
);

export default router;