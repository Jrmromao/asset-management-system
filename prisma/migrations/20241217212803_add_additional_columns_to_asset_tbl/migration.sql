/*
  Warnings:

  - Added the required column `energyRatting` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "dailyOperatingHours" INTEGER,
ADD COLUMN     "energyRatting" TEXT NOT NULL;
