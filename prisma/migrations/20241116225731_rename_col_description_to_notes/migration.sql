/*
  Warnings:

  - You are about to drop the column `description` on the `Accessory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Accessory" DROP COLUMN "description",
ADD COLUMN     "notes" TEXT;
