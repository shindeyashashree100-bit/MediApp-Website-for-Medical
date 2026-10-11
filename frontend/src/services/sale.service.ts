import { apiRequest } from './api';

import type {
  CreateSaleInput,
  Sale,
  SaleItem,
  SalesPagination,
} from '@/types/sale';

type ApiResponse<T> = {
  success: true;
  data: T;
};

type CreateSaleResponse = {
  sale: Sale;
  items: SaleItem[];
};

export async function createSale(
  input: CreateSaleInput,
): Promise<Sale> {
  const response = await apiRequest<
    ApiResponse<CreateSaleResponse>
  >('/sales', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return {
    ...response.data.sale,
    items: response.data.items,
  };
}

export async function getSales(
  page = 1,
  limit = 10,
  search?: string,
  paymentMethod?: string,
): Promise<{
  data: Sale[];
  pagination: SalesPagination;
}> {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('limit', String(limit));

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  if (paymentMethod) {
    params.set(
      'paymentMethod',
      paymentMethod,
    );
  }

  const response = await apiRequest<{
    success: true;
    data: Sale[];
    pagination: SalesPagination;
  }>(
    `/sales?${params.toString()}`,
  );

  return {
    data: response.data,
    pagination: response.pagination,
  };
}

export async function getSale(
  id: string,
): Promise<Sale> {
  const response = await apiRequest<
    ApiResponse<Sale>
  >(`/sales/${id}`);

  return response.data;
}