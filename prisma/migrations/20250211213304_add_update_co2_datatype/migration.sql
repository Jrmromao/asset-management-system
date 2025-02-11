/*
  Warnings:

  - You are about to alter the column `co2e` on the `Co2eRecord` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Co2eRecord" ALTER COLUMN "co2e" SET DATA TYPE DECIMAL(10,2);
