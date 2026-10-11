import { prisma } from '../lib/prisma.js';

export interface ReportDateRange {
  from?: Date;
  to?: Date;
}

export interface StockMovementReportQuery
  extends ReportDateRange {
  type?:
    | 'STOCK_IN'
    | 'STOCK_OUT'
    | 'ADJUSTMENT';
  search?: string;
}

export interface SalesReportQuery
  extends ReportDateRange {
  paymentMethod?:
    | 'CASH'
    | 'UPI'
    | 'CARD'
    | 'OTHER';
  search?: string;
}

export interface ExpiryReportQuery {
  status?:
    | 'ALL'
    | 'EXPIRING'
    | 'EXPIRED';
  search?: string;
}

function buildDateFilter(
  from?: Date,
  to?: Date,
) {
  if (!from && !to) {
    return undefined;
  }

  return {
    ...(from && {
      gte: from,
    }),
    ...(to && {
      lte: to,
    }),
  };
}

export async function getInventoryReport() {
  const medicines =
    await prisma.medicine.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        genericName: true,
        brandName: true,
        sku: true,
        minimumStock: true,
        unitRelation: {
          select: {
            id: true,
            name: true,
          },
        },
        batches: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            batchNumber: true,
            purchasePrice: true,
            sellingPrice: true,
            quantity: true,
            manufacturingDate: true,
            expiryDate: true,
          },
          orderBy: {
            expiryDate: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

  return medicines.map((medicine) => {
    const currentStock =
      medicine.batches.reduce(
        (total, batch) =>
          total + batch.quantity,
        0,
      );

    const stockValue =
      medicine.batches.reduce(
        (total, batch) =>
          total +
          Number(batch.purchasePrice) *
            batch.quantity,
        0,
      );

    const sellingValue =
      medicine.batches.reduce(
        (total, batch) =>
          total +
          Number(batch.sellingPrice) *
            batch.quantity,
        0,
      );

    return {
      ...medicine,
      currentStock,
      stockValue,
      sellingValue,
    };
  });
}

export async function getStockMovementReport(
  query: StockMovementReportQuery,
) {
  const dateFilter = buildDateFilter(
    query.from,
    query.to,
  );

  const transactions =
    await prisma.inventoryTransaction.findMany({
      where: {
        ...(dateFilter && {
          createdAt: dateFilter,
        }),

        ...(query.type && {
          type: query.type,
        }),

        ...(query.search && {
          OR: [
            {
              reference: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              notes: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              medicine: {
                name: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            },
            {
              batch: {
                batchNumber: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        }),
      },

      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            sku: true,
            unitRelation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        batch: {
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

  return transactions;
}

export async function getSalesReport(
  query: SalesReportQuery,
) {
  const dateFilter = buildDateFilter(
    query.from,
    query.to,
  );

  const sales =
    await prisma.sale.findMany({
      where: {
        ...(dateFilter && {
          saleDate: dateFilter,
        }),

        ...(query.paymentMethod && {
          paymentMethod:
            query.paymentMethod,
        }),

        ...(query.search && {
          OR: [
            {
              receiptNumber: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              customerName: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              customerPhone: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },

      include: {
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                sku: true,
                unitRelation: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },

            batch: {
              select: {
                id: true,
                batchNumber: true,
                expiryDate: true,
              },
            },
          },
        },
      },

      orderBy: {
        saleDate: 'desc',
      },
    });

  const totalSales = sales.length;

  const subtotal = sales.reduce(
    (total, sale) =>
      total + Number(sale.subtotal),
    0,
  );

  const discount = sales.reduce(
    (total, sale) =>
      total + Number(sale.discount),
    0,
  );

  const totalAmount = sales.reduce(
    (total, sale) =>
      total + Number(sale.totalAmount),
    0,
  );

  return {
    data: sales,
    summary: {
      totalSales,
      subtotal,
      discount,
      totalAmount,
    },
  };
}

export async function getExpiryReport(
  query: ExpiryReportQuery,
) {
  const settings =
    await prisma.settings.findFirst();

  const warningDays =
    settings?.expiryWarningDays ?? 90;

  const now = new Date();

  const warningDate = new Date(now);

  warningDate.setDate(
    warningDate.getDate() +
      warningDays,
  );

  const search = query.search?.trim();

  const batches =
    await prisma.batch.findMany({
      where: {
        isActive: true,

        quantity: {
          gt: 0,
        },

        ...(query.status === 'EXPIRED'
          ? {
              expiryDate: {
                lt: now,
              },
            }
          : query.status === 'EXPIRING'
            ? {
                expiryDate: {
                  gte: now,
                  lte: warningDate,
                },
              }
            : {
                OR: [
                  {
                    expiryDate: {
                      lt: now,
                    },
                  },
                  {
                    expiryDate: {
                      gte: now,
                      lte: warningDate,
                    },
                  },
                ],
              }),

        medicine: {
          isActive: true,

          ...(search && {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                genericName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                brandName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                sku: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }),
        },

        ...(search && {
          batchNumber: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },

      select: {
        id: true,
        batchNumber: true,
        quantity: true,
        purchasePrice: true,
        sellingPrice: true,
        manufacturingDate: true,
        expiryDate: true,
        medicine: {
          select: {
            id: true,
            name: true,
            genericName: true,
            brandName: true,
            sku: true,
            unitRelation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        expiryDate: 'asc',
      },
    });

  return {
    warningDays,
    data: batches,
  };
}