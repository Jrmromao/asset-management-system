/*
  Warnings:

  - You are about to drop the column `technicianId` on the `Maintenance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Maintenance" DROP CONSTRAINT "Maintenance_technicianId_fkey";

-- DropIndex
DROP INDEX "Company_primaryContactEmail_key";

-- DropIndex
DROP INDEX "Maintenance_technicianId_idx";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "primaryContactEmail" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Maintenance" DROP COLUMN "technicianId";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "companyId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Role_isGlobal_idx" ON "Role"("isGlobal");

-- CreateIndex
CREATE INDEX "UserItem_itemId_itemType_idx" ON "UserItem"("itemId", "itemType");

-- RenameForeignKey
ALTER TABLE "UserItem" RENAME CONSTRAINT "accessory_to_user_item" TO "UserItem_accessory_fkey";

-- RenameForeignKey
ALTER TABLE "UserItem" RENAME CONSTRAINT "license_to_user_item" TO "UserItem_license_fkey";
