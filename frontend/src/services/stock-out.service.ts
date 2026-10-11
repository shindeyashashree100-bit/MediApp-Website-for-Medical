import { apiRequest } from './api';

export type StockOutInput = {
  medicineId: string;
  batchId: string;
  quantity: number;
  reference?: string | null;
  notes?: string | null;
};

type StockOutResult = {
  batch: {
    id: string;
    quantity: number;
  };
  transaction: {
    id: string;
    medicineId: string;
    batchId: string;
    type: 'STOCK_OUT';
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reference: string | null;
    notes: string | null;
    createdAt: string;
  };
};

type ApiResponse<T> = {
  success: true;
  data: T;
};

export async function stockOut(
  input: StockOutInput,
): Promise<StockOutResult> {
  const response = await apiRequest<
    ApiResponse<StockOutResult>
  >('/stock-out', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return response.data;
}