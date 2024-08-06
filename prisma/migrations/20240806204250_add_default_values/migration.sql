/*
  Warnings:

  - Added the required column `alertRenewalDays` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseCopiesCount` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licensedEmail` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minCopiesAlert` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseDate` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendor` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "alertRenewalDays" INTEGER NOT NULL,
ADD COLUMN     "licenseCopiesCount" INTEGER NOT NULL,
ADD COLUMN     "licensedEmail" TEXT NOT NULL,
ADD COLUMN     "minCopiesAlert" INTEGER NOT NULL,
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vendor" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Accessory" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "categoryId" INTEGER,
    "companyId" INTEGER,

    CONSTRAINT "Accessory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Accessory_categoryId_key" ON "Accessory"("categoryId");

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
