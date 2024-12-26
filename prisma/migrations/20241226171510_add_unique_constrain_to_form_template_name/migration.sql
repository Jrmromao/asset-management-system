/*
  Warnings:

  - A unique constraint covering the columns `[name,companyId]` on the table `FormTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FormTemplate_name_companyId_key" ON "FormTemplate"("name", "companyId");
