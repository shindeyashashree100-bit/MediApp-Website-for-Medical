import { prisma } from '../lib/prisma.js';

export interface CreateMedicineInput {
  name: string;
  genericName?: string | null;
  brandName?: string | null;
  sku?: string | null;
  unitId: string;
  description?: string | null;
  minimumStock?: number;
  categoryId: string;
}

export interface UpdateMedicineInput {
  name?: string;
  genericName?: string | null;
  brandName?: string | null;
  sku?: string | null;
  unitId?: string;
  description?: string | null;
  minimumStock?: number;
  categoryId?: string;
}

export class MedicineCategoryError extends Error {
  constructor() {
    super('Category not found or inactive.');
    this.name = 'MedicineCategoryError';
  }
}

export class MedicineUnitError extends Error {
  constructor() {
    super('Unit not found or inactive.');
    this.name = 'MedicineUnitError';
  }
}

async function ensureActiveCategory(categoryId: string) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      isActive: true,
    },
  });

  if (!category) {
    throw new MedicineCategoryError();
  }
}

async function ensureActiveUnit(unitId: string) {
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      isActive: true,
    },
  });

  if (!unit) {
    throw new MedicineUnitError();
  }
}

export async function listMedicines(includeInactive = false) {
  const medicines = await prisma.medicine.findMany({
    where: includeInactive ? undefined : { isActive: true },
    include: {
      category: true,
      unitRelation: true,
      batches: {
        where: {
          isActive: true,
        },
        select: {
          quantity: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return medicines.map((medicine) => {
    const currentStock = medicine.batches.reduce(
      (total, batch) => total + batch.quantity,
      0,
    );

    const {
      batches: _batches,
      ...medicineWithoutBatches
    } = medicine;

    return {
      ...medicineWithoutBatches,
      currentStock,
    };
  });
}

export async function getMedicineById(id: string) {
  return prisma.medicine.findUnique({
    where: { id },
    include: {
      category: true,
      unitRelation: true,
      batches: {
        where: {
          isActive: true,
        },
        orderBy: {
          expiryDate: 'asc',
        },
      },
    },
  });
}

export async function createMedicine(input: CreateMedicineInput) {
  await ensureActiveCategory(input.categoryId);
  await ensureActiveUnit(input.unitId);

  return prisma.medicine.create({
    data: {
      name: input.name,
      genericName: input.genericName ?? null,
      brandName: input.brandName ?? null,
      sku: input.sku ?? null,
      unitId: input.unitId,
      description: input.description ?? null,
      minimumStock: input.minimumStock ?? 0,
      categoryId: input.categoryId,
    },
    include: {
      category: true,
      unitRelation: true,
    },
  });
}

export async function updateMedicine(
  id: string,
  input: UpdateMedicineInput,
) {
  if (input.categoryId !== undefined) {
    await ensureActiveCategory(input.categoryId);
  }

  if (input.unitId !== undefined) {
    await ensureActiveUnit(input.unitId);
  }

  return prisma.medicine.update({
    where: { id },
    data: {
      ...(input.name !== undefined && {
        name: input.name,
      }),

      ...(input.genericName !== undefined && {
        genericName: input.genericName,
      }),

      ...(input.brandName !== undefined && {
        brandName: input.brandName,
      }),

      ...(input.sku !== undefined && {
        sku: input.sku,
      }),

      ...(input.unitId !== undefined && {
        unitId: input.unitId,
      }),

      ...(input.description !== undefined && {
        description: input.description,
      }),

      ...(input.minimumStock !== undefined && {
        minimumStock: input.minimumStock,
      }),

      ...(input.categoryId !== undefined && {
        categoryId: input.categoryId,
      }),
    },
    include: {
      category: true,
      unitRelation: true,
    },
  });
}

export async function deactivateMedicine(id: string) {
  return prisma.medicine.update({
    where: { id },
    data: {
      isActive: false,
    },
    include: {
      category: true,
      unitRelation: true,
    },
  });
}

export async function activateMedicine(id: string) {
  return prisma.medicine.update({
    where: { id },
    data: {
      isActive: true,
    },
    include: {
      category: true,
      unitRelation: true,
    },
  });
}