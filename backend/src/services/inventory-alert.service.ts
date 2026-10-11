import { prisma } from '../lib/prisma.js';

async function getExpiryDates() {
  const settings = await prisma.settings.findFirst();

  const expiryWarningDays = settings?.expiryWarningDays ?? 90;

  const now = new Date();

  const warningDate = new Date(now);
  warningDate.setDate(
    warningDate.getDate() + expiryWarningDays,
  );

  return {
    now,
    warningDate,
  };
}

export async function getLowStockItems() {
  const medicines = await prisma.medicine.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      genericName: true,
      brandName: true,
      sku: true,
      unitId: true,
      unitRelation: {
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
        },
      },
      minimumStock: true,
      batches: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          batchNumber: true,
          quantity: true,
          expiryDate: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return medicines
    .map((medicine) => {
      const currentStock = medicine.batches.reduce(
        (total, batch) => total + batch.quantity,
        0,
      );

      return {
        id: medicine.id,
        name: medicine.name,
        genericName: medicine.genericName,
        brandName: medicine.brandName,
        sku: medicine.sku,
        unitId: medicine.unitId,
        unitRelation: medicine.unitRelation,
        minimumStock: medicine.minimumStock,
        currentStock,
        batches: medicine.batches,
      };
    })
    .filter(
      (medicine) =>
        medicine.currentStock <= medicine.minimumStock,
    );
}

export async function getExpiringItems() {
  const { now, warningDate } = await getExpiryDates();

  return prisma.batch.findMany({
    where: {
      isActive: true,
      quantity: {
        gt: 0,
      },
      expiryDate: {
        gte: now,
        lte: warningDate,
      },
      medicine: {
        isActive: true,
      },
    },
    select: {
      id: true,
      batchNumber: true,
      quantity: true,
      expiryDate: true,
      medicine: {
        select: {
          id: true,
          name: true,
          genericName: true,
          brandName: true,
          sku: true,
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
      },
    },
    orderBy: {
      expiryDate: 'asc',
    },
  });
}

export async function getExpiredItems() {
  const { now } = await getExpiryDates();

  return prisma.batch.findMany({
    where: {
      isActive: true,
      quantity: {
        gt: 0,
      },
      expiryDate: {
        lt: now,
      },
      medicine: {
        isActive: true,
      },
    },
    select: {
      id: true,
      batchNumber: true,
      quantity: true,
      expiryDate: true,
      medicine: {
        select: {
          id: true,
          name: true,
          genericName: true,
          brandName: true,
          sku: true,
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
      },
    },
    orderBy: {
      expiryDate: 'asc',
    },
  });
}