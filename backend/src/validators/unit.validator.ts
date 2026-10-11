import { z } from 'zod';

export const createUnitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Unit name is required.')
      .max(50, 'Unit name must be 50 characters or less.'),

    description: z
      .string()
      .trim()
      .max(500, 'Description must be 500 characters or less.')
      .nullable()
      .optional(),
  })
  .strict();

export const updateUnitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Unit name is required.')
      .max(50, 'Unit name must be 50 characters or less.')
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, 'Description must be 500 characters or less.')
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

export const unitIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;