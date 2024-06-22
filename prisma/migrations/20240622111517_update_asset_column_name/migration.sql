/*
  Warnings:

  - You are about to drop the column `value` on the `Asset` table. All the data in the column will be lost.
  - Added the required column `price` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "value",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
