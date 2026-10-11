import { apiRequest } from './api';
import type {
  CreateMedicineInput,
  Medicine,
  MedicineCategory,
  MedicineDetail,
  MedicineBatch,
  MedicineUnit,
  UpdateMedicineInput,
} from '@/types/medicine';

type ApiResponse<T> = {
  success: true;
  data: T;
};

export async function getMedicines(
  includeInactive = false,
): Promise<Medicine[]> {
  const query = includeInactive
    ? '?includeInactive=true'
    : '';

  const response = await apiRequest<ApiResponse<Medicine[]>>(
    `/medicines${query}`,
  );

  return response.data;
}

export async function getMedicine(
  id: string,
): Promise<MedicineDetail> {
  const response = await apiRequest<
    ApiResponse<MedicineDetail>
  >(`/medicines/${id}`);

  return response.data;
}

export async function getMedicineBatches(
  medicineId: string,
): Promise<{
  medicine: {
    id: string;
    name: string;
    unitId: string;
    unitRelation: MedicineUnit;
  };
  batches: MedicineBatch[];
}> {
  const response = await apiRequest<
    ApiResponse<{
      medicine: {
        id: string;
        name: string;
        unitId: string;
        unitRelation: MedicineUnit;
      };
      batches: MedicineBatch[];
    }>
  >(`/medicines/${medicineId}/batches`);

  return response.data;
}

export async function getCategories(): Promise<
  MedicineCategory[]
> {
  const response = await apiRequest<
    ApiResponse<MedicineCategory[]>
  >('/categories');

  return response.data;
}

export async function getUnits(): Promise<MedicineUnit[]> {
  const response = await apiRequest<
    ApiResponse<MedicineUnit[]>
  >('/units');

  return response.data;
}

export async function createMedicine(
  input: CreateMedicineInput,
): Promise<Medicine> {
  const response = await apiRequest<ApiResponse<Medicine>>(
    '/medicines',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function updateMedicine(
  id: string,
  input: UpdateMedicineInput,
): Promise<Medicine> {
  const response = await apiRequest<ApiResponse<Medicine>>(
    `/medicines/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function activateMedicine(
  id: string,
): Promise<Medicine> {
  const response = await apiRequest<ApiResponse<Medicine>>(
    `/medicines/${id}/activate`,
    {
      method: 'PATCH',
    },
  );

  return response.data;
}

export async function deactivateMedicine(
  id: string,
): Promise<Medicine> {
  const response = await apiRequest<ApiResponse<Medicine>>(
    `/medicines/${id}/deactivate`,
    {
      method: 'PATCH',
    },
  );

  return response.data;
}