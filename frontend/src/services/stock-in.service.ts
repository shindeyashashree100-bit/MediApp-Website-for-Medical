import { apiRequest } from './api';
import type {
  StockInInput,
  StockInResult,
} from '@/types/stock-in';

type ApiResponse<T> = {
  success: true;
  data: T;
};

export async function createStockIn(
  input: StockInInput,
): Promise<StockInResult> {
  const response = await apiRequest<ApiResponse<StockInResult>>(
    '/stock-in',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );

  return response.data;
}
