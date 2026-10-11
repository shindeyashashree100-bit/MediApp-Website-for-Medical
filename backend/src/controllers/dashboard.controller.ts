import type { Request, Response } from 'express';
import { getDashboardSummary } from '../services/dashboard.service.js';

export async function getDashboardSummaryController(
  _req: Request,
  res: Response,
): Promise<void> {
  const summary = await getDashboardSummary();

  res.status(200).json({
    success: true,
    data: summary,
  });
}