-- CreateTable
CREATE TABLE "UserLicense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserLicense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserLicense_userId_idx" ON "UserLicense"("userId");

-- CreateIndex
CREATE INDEX "UserLicense_licenseId_idx" ON "UserLicense"("licenseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLicense_userId_licenseId_key" ON "UserLicense"("userId", "licenseId");

-- AddForeignKey
ALTER TABLE "UserLicense" ADD CONSTRAINT "UserLicense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLicense" ADD CONSTRAINT "UserLicense_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
