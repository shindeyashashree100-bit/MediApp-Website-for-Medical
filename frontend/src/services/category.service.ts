import { apiRequest } from './api';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/category';

type ApiResponse<T> = {
  success: true;
  data: T;
};

export async function getCategories(
  includeInactive = false,
): Promise<Category[]> {
  const query = includeInactive
    ? '?includeInactive=true'
    : '';

  const response = await apiRequest<ApiResponse<Category[]>>(
    `/categories${query}`,
  );

  return response.data;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const response = await apiRequest<ApiResponse<Category>>(
    '/categories',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const response = await apiRequest<ApiResponse<Category>>(
    `/categories/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function activateCategory(
  id: string,
): Promise<Category> {
  const response = await apiRequest<ApiResponse<Category>>(
    `/categories/${id}/activate`,
    {
      method: 'PATCH',
    },
  );

  return response.data;
}

export async function deactivateCategory(
  id: string,
): Promise<Category> {
  const response = await apiRequest<ApiResponse<Category>>(
    `/categories/${id}/deactivate`,
    {
      method: 'PATCH',
    },
  );

  return response.data;
}