import { z } from 'zod';

export const saleListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),

  search: z
    .string()
    .trim()
    .max(200)
    .optional(),

  paymentMethod: z
    .enum(['CASH', 'UPI', 'CARD', 'OTHER'])
    .optional(),
});

export const saleIdSchema = z.object({
  id: z.string().uuid(),
});

export type SaleListQueryInput = z.infer<
  typeof saleListQuerySchema
>;