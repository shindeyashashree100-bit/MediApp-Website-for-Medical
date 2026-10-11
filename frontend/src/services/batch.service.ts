import { apiRequest } from './api';
import type { Batch } from '@/types/batch';

type ApiResponse<T> = {
  success: true;
  data: T;
};

export async function getBatches(
  includeInactive = false,
): Promise<Batch[]> {
  const query = includeInactive
    ? '?includeInactive=true'
    : '';

  const response = await apiRequest<
    ApiResponse<Batch[]>
  >(`/batches${query}`);

  return response.data;
}

export async function getBatch(
  id: string,
): Promise<Batch> {
  const response = await apiRequest<
    ApiResponse<Batch>
  >(`/batches/${id}`);

  return response.data;
}