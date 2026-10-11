
import { z } from 'zod';

const dateString = z
  .string()
  .datetime({ offset: true });

export const stockInSchema = z
  .object({
    medicineId: z.string().uuid(),

    supplierId: z.string().uuid(),

    batchNumber: z
      .string()
      .trim()
      .min(1)
      .max(100),

    purchasePrice: z
      .number()
      .finite()
      .min(0)
      .max(10_000_000),

    sellingPrice: z
      .number()
      .finite()
      .min(0)
      .max(10_000_000),

    quantity: z
      .number()
      .int()
      .positive()
      .max(1_000_000),

    manufacturingDate: dateString
      .nullable()
      .optional(),

    expiryDate: dateString,

    reference: z
      .string()
      .trim()
      .max(200)
      .nullable()
      .optional(),

    notes: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const now = new Date();
    const expiryDate = new Date(data.expiryDate);

    if (Number.isNaN(expiryDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiryDate'],
        message: 'Expiry date must be a valid date.',
      });

      return;
    }

    if (expiryDate <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiryDate'],
        message: 'Expiry date must be in the future.',
      });
    }

    if (data.manufacturingDate) {
      const manufacturingDate = new Date(data.manufacturingDate);

      if (Number.isNaN(manufacturingDate.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['manufacturingDate'],
          message: 'Manufacturing date must be a valid date.',
        });

        return;
      }

      if (manufacturingDate > expiryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['manufacturingDate'],
          message:
            'Manufacturing date cannot be later than expiry date.',
        });
      }
    }
  });

export type StockInInput = z.infer<typeof stockInSchema>;
