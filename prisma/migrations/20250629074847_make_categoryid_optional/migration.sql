-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "FormTemplate_categoryId_idx" ON "FormTemplate"("categoryId");
