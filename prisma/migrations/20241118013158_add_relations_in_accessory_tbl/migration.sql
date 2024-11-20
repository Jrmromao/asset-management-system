/*
  Warnings:

  - You are about to drop the column `minQuantityAlert` on the `Accessory` table. All the data in the column will be lost.
  - You are about to drop the column `vendor` on the `Accessory` table. All the data in the column will be lost.
  - Added the required column `reorderPoint` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Accessory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Accessory" DROP COLUMN "minQuantityAlert",
DROP COLUMN "vendor",
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "inventoryId" TEXT,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "modelId" TEXT,
ADD COLUMN     "reorderPoint" INTEGER NOT NULL,
ADD COLUMN     "statusLabelId" TEXT,
ADD COLUMN     "supplierId" TEXT,
ADD COLUMN     "weight" DECIMAL(65,30) NOT NULL;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_statusLabelId_fkey" FOREIGN KEY ("statusLabelId") REFERENCES "StatusLabel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "DepartmentLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
