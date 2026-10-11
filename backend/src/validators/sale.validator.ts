import { z } from 'zod';

const saleItemSchema = z
  .object({
    medicineId: z.string().uuid(),

    batchId: z.string().uuid(),

    quantity: z
      .number()
      .int()
      .positive()
      .max(1_000_000),

    unitPrice: z
      .number()
      .finite()
      .min(0)
      .max(10_000_000),
  })
  .strict();

export const saleSchema = z
  .object({
    receiptNumber: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

    discount: z
      .number()
      .finite()
      .min(0)
      .max(10_000_000)
      .optional(),

    paymentMethod: z.enum([
      'CASH',
      'UPI',
      'CARD',
      'OTHER',
    ]),

    customerName: z
      .string()
      .trim()
      .max(200)
      .nullable()
      .optional(),

    customerPhone: z
      .string()
      .trim()
      .max(30)
      .nullable()
      .optional(),

    notes: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional(),

    items: z
      .array(saleItemSchema)
      .min(1)
      .max(100),
  })
  .strict()
  .superRefine((data, ctx) => {
    const itemKeys = new Set<string>();

    for (const item of data.items) {
      const key = `${item.medicineId}:${item.batchId}`;

      if (itemKeys.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items'],
          message:
            'The same medicine and batch cannot appear more than once in a sale.',
        });

        break;
      }

      itemKeys.add(key);
    }
  });

export type SaleInput = z.infer<typeof saleSchema>;