import type { Request, Response } from 'express';

import {
  getExpiryReport,
  getInventoryReport,
  getSalesReport,
  getStockMovementReport,
} from '../services/report.service.js';

import {
  expiryReportQuerySchema,
  salesReportQuerySchema,
  stockMovementReportQuerySchema,
} from '../validators/report.validator.js';

function parseDate(
  value?: string,
) {
  return value
    ? new Date(value)
    : undefined;
}

export async function getInventoryReportController(
  _req: Request,
  res: Response,
): Promise<void> {
  const data =
    await getInventoryReport();

  res.status(200).json({
    success: true,
    data,
  });
}

export async function getStockMovementReportController(
  req: Request,
  res: Response,
): Promise<void> {
  const result =
    stockMovementReportQuerySchema.safeParse(
      req.query,
    );

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message:
          'Invalid stock movement report query.',
        details:
          result.error.flatten(),
      },
    });

    return;
  }

  const data =
    await getStockMovementReport({
      from: parseDate(result.data.from),
      to: parseDate(result.data.to),
      type: result.data.type,
      search: result.data.search,
    });

  res.status(200).json({
    success: true,
    data,
  });
}

export async function getSalesReportController(
  req: Request,
  res: Response,
): Promise<void> {
  const result =
    salesReportQuerySchema.safeParse(
      req.query,
    );

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message:
          'Invalid sales report query.',
        details:
          result.error.flatten(),
      },
    });

    return;
  }

  const report =
    await getSalesReport({
      from: parseDate(result.data.from),
      to: parseDate(result.data.to),
      paymentMethod:
        result.data.paymentMethod,
      search: result.data.search,
    });

  res.status(200).json({
    success: true,
    data: report,
  });
}

export async function getExpiryReportController(
  req: Request,
  res: Response,
): Promise<void> {
  const result =
    expiryReportQuerySchema.safeParse(
      req.query,
    );

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message:
          'Invalid expiry report query.',
        details:
          result.error.flatten(),
      },
    });

    return;
  }

  const report =
    await getExpiryReport(
      result.data,
    );

  res.status(200).json({
    success: true,
    data: report,
  });
}