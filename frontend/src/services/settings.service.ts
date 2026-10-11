import { apiRequest } from './api';

import type {
  Settings,
  UpdateSettingsInput,
} from '@/types/settings';

type ApiResponse<T> = {
  success: true;
  data: T;
};

export async function getSettings(): Promise<Settings> {
  const response =
    await apiRequest<ApiResponse<Settings>>(
      '/settings',
    );

  return response.data;
}

export async function updateSettings(
  input: UpdateSettingsInput,
): Promise<Settings> {
  const response =
    await apiRequest<ApiResponse<Settings>>(
      '/settings',
      {
        method: 'PUT',
        body: JSON.stringify(input),
      },
    );

  return response.data;
}