import { Router } from 'express';

import {
  getExpiryReportController,
  getInventoryReportController,
  getSalesReportController,
  getStockMovementReportController,
} from '../controllers/report.controller.js';

const router = Router();

router.get(
  '/inventory',
  getInventoryReportController,
);

router.get(
  '/stock-movement',
  getStockMovementReportController,
);

router.get(
  '/sales',
  getSalesReportController,
);

router.get(
  '/expiry',
  getExpiryReportController,
);

export default router;