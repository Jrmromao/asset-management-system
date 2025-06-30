/*
  Warnings:

  - You are about to drop the column `formTemplateId` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_formTemplateId_fkey";

-- DropIndex
DROP INDEX "Category_formTemplateId_idx";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "formTemplateId";

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
