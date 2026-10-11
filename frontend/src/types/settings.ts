export type Settings = {
  id: string;
  storeName: string;
  storeAddress: string | null;
  storePhone: string | null;
  currency: string;
  expiryWarningDays: number;
  expiryCriticalDays: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateSettingsInput = {
  storeName?: string;
  storeAddress?: string | null;
  storePhone?: string | null;
  currency?: string;
  expiryWarningDays?: number;
  expiryCriticalDays?: number;
  timezone?: string;
};