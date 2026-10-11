import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const units = [
  {
    name: 'piece',
    description: 'Individual physical item',
  },
  {
    name: 'strip',
    description: 'Strip of tablets or capsules',
  },
  {
    name: 'tablet',
    description: 'Individual tablet',
  },
  {
    name: 'capsule',
    description: 'Individual capsule',
  },
  {
    name: 'bottle',
    description: 'Individual medicine bottle',
  },
  {
    name: 'vial',
    description: 'Individual medicine vial',
  },
  {
    name: 'ampoule',
    description: 'Individual ampoule',
  },
  {
    name: 'tube',
    description: 'Individual medicine tube',
  },
  {
    name: 'box',
    description: 'Individual medicine box',
  },
  {
    name: 'pack',
    description: 'Individual medicine pack',
  },
  {
    name: 'sachet',
    description: 'Individual sachet',
  },
];

try {
  for (const unit of units) {
    await prisma.unit.upsert({
      where: {
        name: unit.name,
      },
      update: {
        description: unit.description,
        isActive: true,
      },
      create: {
        name: unit.name,
        description: unit.description,
        isActive: true,
      },
    });
  }

  console.log(`Created/verified ${units.length} units.`);
} catch (error) {
  console.error('Failed to seed units:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}