import { Router } from 'express';
import { stockInController } from '../controllers/stock-in.controller.js';

const router = Router();

router.post('/', stockInController);

export default router;