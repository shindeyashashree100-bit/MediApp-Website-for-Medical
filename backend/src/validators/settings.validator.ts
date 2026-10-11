import { z } from 'zod';

export const updateSettingsSchema = z
  .object({
    storeName: z.string().trim().min(1).max(200).optional(),

    storeAddress: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional(),

    storePhone: z
      .string()
      .trim()
      .max(30)
      .nullable()
      .optional(),

    currency: z
      .string()
      .trim()
      .length(3)
      .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter ISO code')
      .optional(),

    expiryWarningDays: z
      .number()
      .int()
      .positive()
      .max(3650)
      .optional(),

    expiryCriticalDays: z
      .number()
      .int()
      .positive()
      .max(3650)
      .optional(),

    timezone: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.expiryWarningDays === undefined ||
      data.expiryCriticalDays === undefined ||
      data.expiryWarningDays >= data.expiryCriticalDays,
    {
      message:
        'Expiry warning days must be greater than or equal to expiry critical days',
      path: ['expiryWarningDays'],
    },
  );

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;