/*
  Warnings:

  - You are about to drop the `ToolLicense` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ToolLicense" DROP CONSTRAINT "ToolLicense_userId_fkey";

-- DropTable
DROP TABLE "ToolLicense";

-- CreateTable
CREATE TABLE "LicenseTool" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseTool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LicenseTool" ADD CONSTRAINT "LicenseTool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
