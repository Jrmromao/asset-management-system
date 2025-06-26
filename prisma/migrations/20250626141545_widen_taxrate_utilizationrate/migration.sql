/*
  Warnings:

  - You are about to alter the column `taxRate` on the `License` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,4)` to `Decimal(6,2)`.
  - You are about to alter the column `utilizationRate` on the `License` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,4)` to `Decimal(6,2)`.

*/
-- AlterTable
ALTER TABLE "License" ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "utilizationRate" SET DATA TYPE DECIMAL(6,2);
