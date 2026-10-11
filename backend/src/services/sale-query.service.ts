import { prisma } from '../lib/prisma.js';

export interface SaleListQuery {
  page: number;
  limit: number;
  search?: string;
  paymentMethod?: 'CASH' | 'UPI' | 'CARD' | 'OTHER';
}

export async function getSales(query: SaleListQuery) {
  const { page, limit, search, paymentMethod } = query;

  const skip = (page - 1) * limit;

  const where = {
    ...(paymentMethod
      ? {
          paymentMethod,
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              receiptNumber: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              customerName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              customerPhone: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),
  };

  const [sales, total] = await prisma.$transaction([
    prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                sku: true,
                unitId: true,
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
      skip,
      take: limit,
    }),
    prisma.sale.count({
      where,
    }),
  ]);

  return {
    data: sales,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getSaleById(id: string) {
  return prisma.sale.findUnique({
    where: {
      id,
    },
    include: {
      items: {
        include: {
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
                },
              },
            },
          },
          batch: {
            select: {
              id: true,
              batchNumber: true,
              normalizedBatchNumber: true,
              purchasePrice: true,
              sellingPrice: true,
              expiryDate: true,
            },
          },
        },
      },
    },
  });
}