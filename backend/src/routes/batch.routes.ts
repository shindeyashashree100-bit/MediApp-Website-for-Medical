import { Router } from 'express';
import {
  getBatchController,
  listBatchesController,
} from '../controllers/batch.controller.js';

const router = Router();

router.get('/', listBatchesController);
router.get('/:id', getBatchController);

export default router;