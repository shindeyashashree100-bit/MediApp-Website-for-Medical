import { z } from 'zod';

export const inventoryAdjustmentSchema = z
  .object({
    medicineId: z.string().uuid(),

    batchId: z.string().uuid(),

    adjustmentType: z.enum(['INCREASE', 'DECREASE']),

    quantity: z
      .number()
      .int()
      .positive()
      .max(1_000_000),

    adjustmentReason: z.enum([
      'PHYSICAL_COUNT',
      'DAMAGED',
      'EXPIRED',
      'LOST',
      'CORRECTION',
      'OTHER',
    ]),

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

export type InventoryAdjustmentInput = z.infer<
  typeof inventoryAdjustmentSchema
>;