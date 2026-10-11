/*
  Warnings:

  - You are about to drop the column `unit` on the `Medicine` table. All the data in the column will be lost.
  - Made the column `unitId` on table `Medicine` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_unitId_fkey";

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "unit",
ALTER COLUMN "unitId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
