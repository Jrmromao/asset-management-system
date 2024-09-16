-- CreateTable
CREATE TABLE "Kit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Kit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitAsset" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "KitAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKit" (
    "userId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,

    CONSTRAINT "UserKit_pkey" PRIMARY KEY ("userId","kitId")
);

-- CreateIndex
CREATE UNIQUE INDEX "KitAsset_kitId_assetId_key" ON "KitAsset"("kitId", "assetId");

-- AddForeignKey
ALTER TABLE "KitAsset" ADD CONSTRAINT "KitAsset_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitAsset" ADD CONSTRAINT "KitAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKit" ADD CONSTRAINT "UserKit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKit" ADD CONSTRAINT "UserKit_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
