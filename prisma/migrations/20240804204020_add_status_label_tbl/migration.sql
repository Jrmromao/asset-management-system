-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "statusLableId" INTEGER;

-- CreateTable
CREATE TABLE "StatusLable" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "isAchived" BOOLEAN NOT NULL,
    "allowLoan" BOOLEAN NOT NULL,

    CONSTRAINT "StatusLable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_statusLableId_fkey" FOREIGN KEY ("statusLableId") REFERENCES "StatusLable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
