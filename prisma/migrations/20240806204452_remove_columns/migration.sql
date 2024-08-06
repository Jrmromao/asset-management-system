/*
  Warnings:

  - You are about to drop the column `alertRenewalDays` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `licenseCopiesCount` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `licensedEmail` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `minCopiesAlert` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `vendor` on the `Company` table. All the data in the column will be lost.
  - Added the required column `alertRenewalDays` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseCopiesCount` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licensedEmail` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minCopiesAlert` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseDate` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendor` to the `Accessory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Accessory" ADD COLUMN     "alertRenewalDays" INTEGER NOT NULL,
ADD COLUMN     "licenseCopiesCount" INTEGER NOT NULL,
ADD COLUMN     "licensedEmail" TEXT NOT NULL,
ADD COLUMN     "minCopiesAlert" INTEGER NOT NULL,
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vendor" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "alertRenewalDays",
DROP COLUMN "licenseCopiesCount",
DROP COLUMN "licensedEmail",
DROP COLUMN "minCopiesAlert",
DROP COLUMN "purchaseDate",
DROP COLUMN "vendor";
