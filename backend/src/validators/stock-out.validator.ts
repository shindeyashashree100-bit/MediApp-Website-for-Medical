import { z } from 'zod';

export const stockOutSchema = z
  .object({
    medicineId: z.string().uuid(),

    batchId: z.string().uuid(),

    quantity: z
      .number()
      .int()
      .positive()
      .max(1_000_000),

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
  .strict();

export type StockOutInput = z.infer<typeof stockOutSchema>;