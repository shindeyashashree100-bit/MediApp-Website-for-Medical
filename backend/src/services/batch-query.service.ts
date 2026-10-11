import { prisma } from '../lib/prisma.js';

export async function getAvailableBatchesForMedicine(
  medicineId: string,
) {
  const medicine = await prisma.medicine.findFirst({
    where: {
      id: medicineId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      unitId: true,
      unitRelation: {
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
        },
      },
    },
  });

  if (!medicine) {
    return null;
  }

  const batches = await prisma.batch.findMany({
    where: {
      medicineId,
      isActive: true,
      quantity: {
        gt: 0,
      },
      expiryDate: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      batchNumber: true,
      normalizedBatchNumber: true,
      purchasePrice: true,
      sellingPrice: true,
      quantity: true,
      manufacturingDate: true,
      expiryDate: true,
    },
    orderBy: [
      {
        expiryDate: 'asc',
      },
      {
        createdAt: 'asc',
      },
    ],
  });

  return {
    medicine,
    batches,
  };
}