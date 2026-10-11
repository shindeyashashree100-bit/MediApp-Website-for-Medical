import { z } from 'zod';

const nullableString = (max: number) =>
  z.string().trim().max(max).nullable().optional();

export const createSupplierSchema = z
  .object({
    name: z.string().trim().min(1).max(200),

    phone: nullableString(30),

    email: z
      .string()
      .trim()
      .email()
      .max(320)
      .nullable()
      .optional(),

    address: nullableString(500),

    gstNumber: z
      .string()
      .trim()
      .max(30)
      .nullable()
      .optional(),
  })
  .strict();

export const updateSupplierSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),

    phone: nullableString(30),

    email: z
      .string()
      .trim()
      .email()
      .max(320)
      .nullable()
      .optional(),

    address: nullableString(500),

    gstNumber: z
      .string()
      .trim()
      .max(30)
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

export const supplierIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;