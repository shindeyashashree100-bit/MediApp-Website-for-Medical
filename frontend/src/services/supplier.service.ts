import { apiRequest } from './api';
import type {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from '@/types/supplier';

type ApiResponse<T> = {
  success: true;
  data: T;
};

export async function getSuppliers(
  includeInactive = false,
): Promise<Supplier[]> {
  const query = includeInactive
    ? '?includeInactive=true'
    : '';

  const response = await apiRequest<
    ApiResponse<Supplier[]>
  >(`/suppliers${query}`);

  return response.data;
}

export async function getSupplier(
  id: string,
): Promise<Supplier> {
  const response = await apiRequest<
    ApiResponse<Supplier>
  >(`/suppliers/${id}`);

  return response.data;
}

export async function createSupplier(
  input: CreateSupplierInput,
): Promise<Supplier> {
  const response = await apiRequest<
    ApiResponse<Supplier>
  >('/suppliers', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput,
): Promise<Supplier> {
  const response = await apiRequest<
    ApiResponse<Supplier>
  >(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function activateSupplier(
  id: string,
): Promise<Supplier> {
  const response = await apiRequest<
    ApiResponse<Supplier>
  >(`/suppliers/${id}/activate`, {
    method: 'PATCH',
  });

  return response.data;
}

export async function deactivateSupplier(
  id: string,
): Promise<Supplier> {
  const response = await apiRequest<
    ApiResponse<Supplier>
  >(`/suppliers/${id}/deactivate`, {
    method: 'PATCH',
  });

  return response.data;
}