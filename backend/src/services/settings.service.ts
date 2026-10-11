import { prisma } from '../lib/prisma';

export interface UpdateSettingsInput {
  storeName?: string;
  storeAddress?: string | null;
  storePhone?: string | null;
  currency?: string;
  expiryWarningDays?: number;
  expiryCriticalDays?: number;
  timezone?: string;
}

const DEFAULT_SETTINGS = {
  storeName: 'Medical Store',
  currency: 'INR',
  expiryWarningDays: 90,
  expiryCriticalDays: 30,
  timezone: 'Asia/Kolkata',
};

export async function getSettings() {
  let settings = await prisma.settings.findFirst();

  if (!settings) {
    settings = await prisma.settings.create({
      data: DEFAULT_SETTINGS,
    });
  }

  return settings;
}

export async function updateSettings(input: UpdateSettingsInput) {
  const existing = await prisma.settings.findFirst();

  if (!existing) {
    return prisma.settings.create({
      data: {
        ...DEFAULT_SETTINGS,
        ...input,
      },
    });
  }

  return prisma.settings.update({
    where: {
      id: existing.id,
    },
    data: input,
  });
}