/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenance` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Asset` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_formTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_modelId_fkey";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "assignedTo",
DROP COLUMN "lastMaintenance",
DROP COLUMN "metadata",
ALTER COLUMN "modelId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "formTemplateId" TEXT;

-- CreateIndex
CREATE INDEX "Asset_categoryId_idx" ON "Asset"("categoryId");

-- CreateIndex
CREATE INDEX "Category_formTemplateId_idx" ON "Category"("formTemplateId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
