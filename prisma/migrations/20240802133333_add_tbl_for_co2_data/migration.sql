-- CreateTable
CREATE TABLE "Co2eRecord" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "co2e" DOUBLE PRECISION NOT NULL,
    "co2eType" TEXT NOT NULL,
    "sourceOrActivity" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "Co2eRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
