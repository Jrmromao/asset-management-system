-- CreateTable
CREATE TABLE "Co2eRecord" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "userId" TEXT,
    "co2e" DOUBLE PRECISION NOT NULL,
    "co2eType" TEXT NOT NULL,
    "sourceOrActivity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Co2eRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Co2eRecord_itemId_idx" ON "Co2eRecord"("itemId");

-- CreateIndex
CREATE INDEX "Co2eRecord_userId_idx" ON "Co2eRecord"("userId");

-- CreateIndex
CREATE INDEX "Co2eRecord_itemType_idx" ON "Co2eRecord"("itemType");

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_assetId_fkey" FOREIGN KEY ("itemId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_accessoryId_fkey" FOREIGN KEY ("itemId") REFERENCES "Accessory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
