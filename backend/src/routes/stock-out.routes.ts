import { Router } from 'express';
import { stockOutController } from '../controllers/stock-out.controller.js';

const router = Router();

router.post('/', stockOutController);

export default router;