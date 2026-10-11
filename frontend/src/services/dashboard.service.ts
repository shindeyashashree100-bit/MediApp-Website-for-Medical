import { apiRequest } from './api';
import type {
  DashboardAlertBatch,
  DashboardSummary,
} from '@/types/dashboard';

type ApiResponse<T> = {
  success: true;
  data: T;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiRequest<ApiResponse<DashboardSummary>>(
    '/dashboard/summary',
  );

  return response.data;
}

export async function getLowStockItems(): Promise<
  DashboardSummary['inventory']['lowStock']
> {
  const response = await apiRequest<
    ApiResponse<DashboardSummary['inventory']['lowStock']>
  >('/inventory/alerts/low-stock');

  return response.data;
}

export async function getExpiringItems(): Promise<DashboardAlertBatch[]> {
  const response = await apiRequest<ApiResponse<DashboardAlertBatch[]>>(
    '/inventory/alerts/expiring',
  );

  return response.data;
}

export async function getExpiredItems(): Promise<DashboardAlertBatch[]> {
  const response = await apiRequest<ApiResponse<DashboardAlertBatch[]>>(
    '/inventory/alerts/expired',
  );

  return response.data;
}
