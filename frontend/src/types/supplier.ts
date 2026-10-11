export type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSupplierInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gstNumber?: string | null;
};

export type UpdateSupplierInput = {
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gstNumber?: string | null;
};