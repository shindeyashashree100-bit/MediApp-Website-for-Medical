import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const medicines = await prisma.medicine.findMany({
    select: {
      id: true,
      name: true,
      unit: true,
      unitId: true,
    },
  });

  let updated = 0;
  let skipped = 0;
  let unmatched = 0;

  for (const medicine of medicines) {
    if (medicine.unitId) {
      console.log(
        `Already linked: "${medicine.name}" -> unitId ${medicine.unitId}`,
      );
      skipped++;
      continue;
    }

    const unitName = medicine.unit.trim().toLowerCase();

    const unit = await prisma.unit.findUnique({
      where: {
        name: unitName,
      },
    });

    if (!unit) {
      console.error(
        `No matching Unit found for medicine "${medicine.name}" with unit "${medicine.unit}".`,
      );
      unmatched++;
      continue;
    }

    await prisma.medicine.update({
      where: {
        id: medicine.id,
      },
      data: {
        unitId: unit.id,
      },
    });

    console.log(
      `Linked "${medicine.name}" -> "${unit.name}" (${unit.id})`,
    );

    updated++;
  }

  console.log('');
  console.log('Migration complete.');
  console.log(`Updated: ${updated}`);
  console.log(`Already linked: ${skipped}`);
  console.log(`Unmatched: ${unmatched}`);
} catch (error) {
  console.error('Failed to migrate medicine units:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}