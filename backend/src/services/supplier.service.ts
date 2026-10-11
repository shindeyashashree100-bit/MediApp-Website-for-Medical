import { prisma } from '../lib/prisma.js';

export interface CreateSupplierInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gstNumber?: string | null;
}

export interface UpdateSupplierInput {
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gstNumber?: string | null;
}

export async function listSuppliers(includeInactive = false) {
  return prisma.supplier.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
  });
}

export async function createSupplier(input: CreateSupplierInput) {
  return prisma.supplier.create({
    data: {
      name: input.name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
      gstNumber: input.gstNumber ?? null,
    },
  });
}

export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput,
) {
  return prisma.supplier.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.gstNumber !== undefined && {
        gstNumber: input.gstNumber,
      }),
    },
  });
}

export async function deactivateSupplier(id: string) {
  return prisma.supplier.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}

export async function activateSupplier(id: string) {
  return prisma.supplier.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
}