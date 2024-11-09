/*
  Warnings:

  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_companyId_fkey";

-- DropTable
DROP TABLE "Location";

-- CreateTable
CREATE TABLE "DepartmentLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DepartmentLocation_companyId_idx" ON "DepartmentLocation"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentLocation_name_companyId_key" ON "DepartmentLocation"("name", "companyId");

-- AddForeignKey
ALTER TABLE "DepartmentLocation" ADD CONSTRAINT "DepartmentLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
