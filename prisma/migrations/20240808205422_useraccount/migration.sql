-- AlterTable
ALTER TABLE "ClaimRequest" ADD COLUMN     "userAccountId" INTEGER;

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingClaim" (
    "id" SERIAL NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "balance" BIGINT NOT NULL,
    "userAccountId" INTEGER NOT NULL,

    CONSTRAINT "PendingClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_address_key" ON "UserAccount"("address");

-- AddForeignKey
ALTER TABLE "ClaimRequest" ADD CONSTRAINT "ClaimRequest_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingClaim" ADD CONSTRAINT "PendingClaim_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
