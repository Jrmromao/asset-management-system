/*
  Warnings:

  - You are about to drop the column `vendor` on the `License` table. All the data in the column will be lost.
  - Added the required column `poNumber` to the `License` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "License" DROP COLUMN "vendor",
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "inventoryId" TEXT,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "poNumber" TEXT NOT NULL,
ADD COLUMN     "statusLabelId" TEXT,
ADD COLUMN     "supplierId" TEXT;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_statusLabelId_fkey" FOREIGN KEY ("statusLabelId") REFERENCES "StatusLabel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "DepartmentLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
