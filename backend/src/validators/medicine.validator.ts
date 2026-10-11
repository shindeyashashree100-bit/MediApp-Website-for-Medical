import { z } from 'zod';

const optionalNullableString = (max: number) =>
  z.string().trim().max(max).nullable().optional();

export const createMedicineSchema = z
  .object({
    name: z.string().trim().min(1).max(200),

    genericName: optionalNullableString(200),

    brandName: optionalNullableString(200),

    sku: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(
        /^[A-Za-z0-9._-]+$/,
        'SKU may contain only letters, numbers, dots, underscores, and hyphens',
      )
      .nullable()
      .optional(),

    unitId: z.string().uuid(),

    description: optionalNullableString(1000),

    minimumStock: z
      .number()
      .int()
      .min(0)
      .max(1_000_000)
      .optional(),

    categoryId: z.string().uuid(),
  })
  .strict();

export const updateMedicineSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),

    genericName: optionalNullableString(200),

    brandName: optionalNullableString(200),

    sku: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(
        /^[A-Za-z0-9._-]+$/,
        'SKU may contain only letters, numbers, dots, underscores, and hyphens',
      )
      .nullable()
      .optional(),

    unitId: z.string().uuid().optional(),

    description: optionalNullableString(1000),

    minimumStock: z
      .number()
      .int()
      .min(0)
      .max(1_000_000)
      .optional(),

    categoryId: z.string().uuid().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

export const medicineIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;
export type UpdateMedicineInput = z.infer<typeof updateMedicineSchema>;