/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,companyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_companyId_key" ON "User"("employeeId", "companyId");
