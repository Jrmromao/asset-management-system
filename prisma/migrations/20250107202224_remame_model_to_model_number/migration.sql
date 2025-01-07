/*
  Warnings:

  - You are about to drop the column `model` on the `Accessory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Accessory" DROP COLUMN "model",
ADD COLUMN     "modelNumber" TEXT;
