/*
  Warnings:

  - A unique constraint covering the columns `[clerkOrgId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "clerkOrgId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_clerkOrgId_key" ON "Company"("clerkOrgId");
