/*
  Warnings:

  - A unique constraint covering the columns `[name,companyId]` on the table `Manufacturer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Manufacturer_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_companyId_key" ON "Manufacturer"("name", "companyId");
