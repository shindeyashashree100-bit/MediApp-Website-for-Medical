import { apiRequest } from './api';

import type {
  ExpiryReportResponse,
  InventoryReportItem,
  SalesReportSale,
  SalesReportSummary,
  StockMovement,
} from '@/types/report';

type ApiResponse<T> = {
  success: true;
  data: T;
};

export async function getInventoryReport(): Promise<
  InventoryReportItem[]
> {
  const response =
    await apiRequest<
      ApiResponse<InventoryReportItem[]>
    >('/reports/inventory');

  return response.data;
}

export async function getStockMovementReport(
  from?: string,
  to?: string,
  type?: string,
  search?: string,
): Promise<StockMovement[]> {
  const params = new URLSearchParams();

  if (from) {
    params.set('from', from);
  }

  if (to) {
    params.set('to', to);
  }

  if (type) {
    params.set('type', type);
  }

  if (search?.trim()) {
    params.set('search', search.trim());
  }

  const query = params.toString();

  const response =
    await apiRequest<
      ApiResponse<StockMovement[]>
    >(
      `/reports/stock-movement${
        query ? `?${query}` : ''
      }`,
    );

  return response.data;
}

export async function getSalesReport(
  from?: string,
  to?: string,
  paymentMethod?: string,
  search?: string,
): Promise<{
  data: SalesReportSale[];
  summary: SalesReportSummary;
}> {
  const params = new URLSearchParams();

  if (from) {
    params.set('from', from);
  }

  if (to) {
    params.set('to', to);
  }

  if (paymentMethod) {
    params.set(
      'paymentMethod',
      paymentMethod,
    );
  }

  if (search?.trim()) {
    params.set(
      'search',
      search.trim(),
    );
  }

  const query = params.toString();

  const response =
    await apiRequest<
      ApiResponse<{
        data: SalesReportSale[];
        summary: SalesReportSummary;
      }>
    >(
      `/reports/sales${
        query ? `?${query}` : ''
      }`,
    );

  return response.data;
}

export async function getExpiryReport(
  status = 'ALL',
  search?: string,
): Promise<ExpiryReportResponse> {
  const params = new URLSearchParams();

  params.set('status', status);

  if (search?.trim()) {
    params.set(
      'search',
      search.trim(),
    );
  }

  const response =
    await apiRequest<
      ApiResponse<ExpiryReportResponse>
    >(
      `/reports/expiry?${params.toString()}`,
    );

  return response.data;
}