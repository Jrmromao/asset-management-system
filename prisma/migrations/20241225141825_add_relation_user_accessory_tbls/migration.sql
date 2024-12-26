-- AlterTable
ALTER TABLE "Accessory" ADD COLUMN     "assigneeId" TEXT;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
