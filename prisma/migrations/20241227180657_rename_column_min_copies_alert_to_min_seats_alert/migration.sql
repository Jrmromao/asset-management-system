/*
  Warnings:

  - You are about to drop the column `minCopiesAlert` on the `License` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "License" DROP COLUMN "minCopiesAlert",
ADD COLUMN     "minSeatsAlert" INTEGER NOT NULL DEFAULT 0;
