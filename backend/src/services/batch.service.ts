import { prisma } from '../lib/prisma.js';

export async function listBatches(includeInactive = false) {
  return prisma.batch.findMany({
    where: includeInactive
      ? undefined
      : {
          isActive: true,
        },
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
          genericName: true,
          brandName: true,
          unitRelation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        expiryDate: 'asc',
      },
      {
        medicine: {
          name: 'asc',
        },
      },
      {
        createdAt: 'asc',
      },
    ],
  });
}

export async function getBatchById(id: string) {
  return prisma.batch.findUnique({
    where: {
      id,
    },
    include: {
      medicine: {
        select: {
          id: true,
          name: true,
          genericName: true,
          brandName: true,
          unitRelation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}