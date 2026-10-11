import { Router } from 'express';
import {
  activateMedicineController,
  createMedicineController,
  deactivateMedicineController,
  getMedicineController,
  listMedicinesController,
  updateMedicineController,
} from '../controllers/medicine.controller.js';
import { getAvailableBatchesController } from '../controllers/batch-query.controller.js';

const router = Router();

router.get('/', listMedicinesController);

router.get(
  '/:medicineId/batches',
  getAvailableBatchesController,
);

router.get('/:id', getMedicineController);

router.post('/', createMedicineController);

router.put('/:id', updateMedicineController);

router.patch('/:id/deactivate', deactivateMedicineController);

router.patch('/:id/activate', activateMedicineController);

export default router;