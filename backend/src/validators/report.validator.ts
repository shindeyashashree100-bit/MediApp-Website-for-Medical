import { z } from 'zod';

const dateString = z
  .string()
  .datetime({ offset: true });

const dateRangeFields = {
  from: dateString.optional(),
  to: dateString.optional(),
};

function validateDateRange<
  T extends {
    from?: string;
    to?: string;
  },
>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (!data.from || !data.to) {
    return;
  }

  const from = new Date(data.from);
  const to = new Date(data.to);

  if (from > to) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['from'],
      message:
        'From date cannot be later than the To date.',
    });
  }
}

export const reportDateRangeSchema = z
  .object(dateRangeFields)
  .strict()
  .superRefine(validateDateRange);

export const stockMovementReportQuerySchema = z
  .object({
    ...dateRangeFields,

    type: z
      .enum([
        'STOCK_IN',
        'STOCK_OUT',
        'ADJUSTMENT',
      ])
      .optional(),

    search: z
      .string()
      .trim()
      .max(200)
      .optional(),
  })
  .strict()
  .superRefine(validateDateRange);

export const salesReportQuerySchema = z
  .object({
    ...dateRangeFields,

    paymentMethod: z
      .enum([
        'CASH',
        'UPI',
        'CARD',
        'OTHER',
      ])
      .optional(),

    search: z
      .string()
      .trim()
      .max(200)
      .optional(),
  })
  .strict()
  .superRefine(validateDateRange);

export const expiryReportQuerySchema = z
  .object({
    status: z
      .enum([
        'ALL',
        'EXPIRING',
        'EXPIRED',
      ])
      .optional()
      .default('ALL'),

    search: z
      .string()
      .trim()
      .max(200)
      .optional(),
  })
  .strict();

export type ReportDateRangeInput =
  z.infer<typeof reportDateRangeSchema>;

export type StockMovementReportQuery =
  z.infer<typeof stockMovementReportQuerySchema>;

export type SalesReportQuery =
  z.infer<typeof salesReportQuerySchema>;

export type ExpiryReportQuery =
  z.infer<typeof expiryReportQuerySchema>;