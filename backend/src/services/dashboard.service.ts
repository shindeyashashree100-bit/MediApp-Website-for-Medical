import { prisma } from '../lib/prisma.js';

export async function getDashboardSummary() {
  const now = new Date();

  const settings = await prisma.settings.findFirst();

  const expiryWarningDays = settings?.expiryWarningDays ?? 90;

  const expiryWarningDate = new Date(now);

  expiryWarningDate.setDate(
    expiryWarningDate.getDate() + expiryWarningDays,
  );

  const startOfToday = new Date(now);

  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);

  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [
    totalMedicines,
    activeMedicines,
    totalSuppliers,
    lowStockMedicines,
    expiredBatches,
    expiringSoonBatches,
    todaySales,
    todayRevenue,
  ] = await prisma.$transaction([
    prisma.medicine.count(),

    prisma.medicine.count({
      where: {
        isActive: true,
      },
    }),

    prisma.supplier.count({
      where: {
        isActive: true,
      },
    }),

    prisma.medicine.count({
      where: {
        isActive: true,
        minimumStock: {
          gt: 0,
        },
        batches: {
          some: {
            isActive: true,
          },
        },
      },
    }),

    prisma.batch.count({
      where: {
        isActive: true,
        expiryDate: {
          lt: now,
        },
        quantity: {
          gt: 0,
        },
      },
    }),

    prisma.batch.count({
      where: {
        isActive: true,
        expiryDate: {
          gte: now,
          lte: expiryWarningDate,
        },
        quantity: {
          gt: 0,
        },
      },
    }),

    prisma.sale.count({
      where: {
        saleDate: {
          gte: startOfToday,
          lt: startOfTomorrow,
        },
      },
    }),

    prisma.sale.aggregate({
      where: {
        saleDate: {
          gte: startOfToday,
          lt: startOfTomorrow,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  const medicinesWithStock = await prisma.medicine.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      minimumStock: true,
      batches: {
        where: {
          isActive: true,
        },
        select: {
          quantity: true,
        },
      },
    },
  });

  const lowStockDetails = medicinesWithStock
    .map((medicine) => ({
      id: medicine.id,
      name: medicine.name,
      minimumStock: medicine.minimumStock,
      currentStock: medicine.batches.reduce(
        (total, batch) => total + batch.quantity,
        0,
      ),
    }))
    .filter(
      (medicine) =>
        medicine.currentStock <= medicine.minimumStock,
    );

  return {
    medicines: {
      total: totalMedicines,
      active: activeMedicines,
    },

    suppliers: {
      active: totalSuppliers,
    },

    inventory: {
      lowStockCount: lowStockDetails.length,
      lowStock: lowStockDetails,
      expiredBatchCount: expiredBatches,
      expiringSoonBatchCount: expiringSoonBatches,
    },

    today: {
      salesCount: todaySales,
      revenue: todayRevenue._sum.totalAmount ?? 0,
    },
  };
}