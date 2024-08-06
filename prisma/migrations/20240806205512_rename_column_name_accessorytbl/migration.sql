/*
  Warnings:

  - You are about to drop the column `alertRenewalDays` on the `Accessory` table. All the data in the column will be lost.
  - You are about to drop the column `licenseCopiesCount` on the `Accessory` table. All the data in the column will be lost.
  - You are about to drop the column `licensedEmail` on the `Accessory` table. All the data in the column will be lost.
  - You are about to drop the column `minCopiesAlert` on the `Accessory` table. All the data in the column will be lost.
  - Added the required column `alertEmail` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minQuantityAlert` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuantityCount` to the `Accessory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Accessory" DROP COLUMN "alertRenewalDays",
DROP COLUMN "licenseCopiesCount",
DROP COLUMN "licensedEmail",
DROP COLUMN "minCopiesAlert",
ADD COLUMN     "alertEmail" TEXT NOT NULL,
ADD COLUMN     "minQuantityAlert" INTEGER NOT NULL,
ADD COLUMN     "totalQuantityCount" INTEGER NOT NULL;
