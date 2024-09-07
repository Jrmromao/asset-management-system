-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_assigneeId_fkey";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
