/*
  Warnings:

  - A unique constraint covering the columns `[phoneNum]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_phoneNum_companyId_key";

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNum_key" ON "User"("phoneNum");
