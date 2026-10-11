import { prisma } from '../lib/prisma.js';

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
}

export async function listCategories(includeInactive = false) {
  return prisma.category.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
  });
}

export async function createCategory(input: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      name: input.name,
      description: input.description ?? null,
    },
  });
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
) {
  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
    },
  });
}

export async function deactivateCategory(id: string) {
  return prisma.category.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}

export async function activateCategory(id: string) {
  return prisma.category.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
}