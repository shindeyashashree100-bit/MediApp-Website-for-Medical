import { prisma } from '../lib/prisma.js';

export async function getBatchTransactions(
  batchId: string,
) {
  const batch = await prisma.batch.findUnique({
    where: {
      id: batchId,
    },
    select: {
      id: true,
      batchNumber: true,
      normalizedBatchNumber: true,
      quantity: true,
      expiryDate: true,
      medicine: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
    },
  });

  if (!batch) {
    return null;
  }

  const transactions =
    await prisma.inventoryTransaction.findMany({
      where: {
        batchId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

  return {
    batch,
    transactions,
  };
}
