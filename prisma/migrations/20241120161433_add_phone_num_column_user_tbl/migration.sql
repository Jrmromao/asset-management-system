/*
  Warnings:

  - A unique constraint covering the columns `[phoneNum,companyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNum" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNum_companyId_key" ON "User"("phoneNum", "companyId");
