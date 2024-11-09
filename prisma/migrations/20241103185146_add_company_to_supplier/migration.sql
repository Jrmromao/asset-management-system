/*
  Warnings:

  - A unique constraint covering the columns `[email,companyId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Supplier_email_key";

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "companyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_email_companyId_key" ON "Supplier"("email", "companyId");

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
