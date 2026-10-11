import { Router } from 'express';
import {
  activateUnitController,
  createUnitController,
  deactivateUnitController,
  getUnitController,
  listUnitsController,
  updateUnitController,
} from '../controllers/unit.controller.js';

const router = Router();

router.get('/', listUnitsController);

router.get('/:id', getUnitController);

router.post('/', createUnitController);

router.put('/:id', updateUnitController);

router.patch('/:id/deactivate', deactivateUnitController);

router.patch('/:id/activate', activateUnitController);

export default router;