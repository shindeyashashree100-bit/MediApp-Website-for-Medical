import { prisma } from '../lib/prisma.js';

export interface CreateUnitInput {
  name: string;
  description?: string | null;
}

export interface UpdateUnitInput {
  name?: string;
  description?: string | null;
}

export async function listUnits(includeInactive = false) {
  return prisma.unit.findMany({
    where: includeInactive
      ? undefined
      : {
          isActive: true,
        },
    include: {
      _count: {
        select: {
          medicines: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getUnitById(id: string) {
  return prisma.unit.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          medicines: true,
        },
      },
    },
  });
}

export async function createUnit(input: CreateUnitInput) {
  return prisma.unit.create({
    data: {
      name: input.name,
      description: input.description ?? null,
    },
    include: {
      _count: {
        select: {
          medicines: true,
        },
      },
    },
  });
}

export async function updateUnit(
  id: string,
  input: UpdateUnitInput,
) {
  return prisma.unit.update({
    where: {
      id,
    },
    data: {
      ...(input.name !== undefined && {
        name: input.name,
      }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
    },
    include: {
      _count: {
        select: {
          medicines: true,
        },
      },
    },
  });
}

export async function deactivateUnit(id: string) {
  return prisma.unit.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
    include: {
      _count: {
        select: {
          medicines: true,
        },
      },
    },
  });
}

export async function activateUnit(id: string) {
  return prisma.unit.update({
    where: {
      id,
    },
    data: {
      isActive: true,
    },
    include: {
      _count: {
        select: {
          medicines: true,
        },
      },
    },
  });
}