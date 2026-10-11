import type { Request, Response } from 'express';
import {
  getExpiredItems,
  getExpiringItems,
  getLowStockItems,
} from '../services/inventory-alert.service.js';

export async function getLowStockController(
  _req: Request,
  res: Response,
): Promise<void> {
  const items = await getLowStockItems();

  res.status(200).json({
    success: true,
    data: items,
  });
}

export async function getExpiringController(
  _req: Request,
  res: Response,
): Promise<void> {
  const items = await getExpiringItems();

  res.status(200).json({
    success: true,
    data: items,
  });
}

export async function getExpiredController(
  _req: Request,
  res: Response,
): Promise<void> {
  const items = await getExpiredItems();

  res.status(200).json({
    success: true,
    data: items,
  });
}