/*
  Warnings:

  - You are about to drop the column `bridgeIntentId` on the `ClaimRequest` table. All the data in the column will be lost.
  - You are about to drop the column `userAccountId` on the `ClaimRequest` table. All the data in the column will be lost.
  - The primary key for the `UserAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `UserAccount` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `UserAccount` table. All the data in the column will be lost.
  - You are about to drop the `BridgeIntent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PendingClaim` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[UserAccountId,nonce]` on the table `ClaimRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `UserAccountId` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountLocker` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiryTimestamp` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxFee` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nonce` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orchestrator` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solverExpiry` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceChainId` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceTokenAddress` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetChainId` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetTokenAddress` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userData` to the `ClaimRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountLocker` to the `UserAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountOwner` to the `UserAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClaimRequest" DROP CONSTRAINT "ClaimRequest_bridgeIntentId_fkey";

-- DropForeignKey
ALTER TABLE "ClaimRequest" DROP CONSTRAINT "ClaimRequest_userAccountId_fkey";

-- DropForeignKey
ALTER TABLE "PendingClaim" DROP CONSTRAINT "PendingClaim_userAccountId_fkey";

-- DropIndex
DROP INDEX "UserAccount_address_key";

-- AlterTable
ALTER TABLE "ClaimRequest" DROP COLUMN "bridgeIntentId",
DROP COLUMN "userAccountId",
ADD COLUMN     "UserAccountId" TEXT NOT NULL,
ADD COLUMN     "accountLocker" TEXT NOT NULL,
ADD COLUMN     "amount" BIGINT NOT NULL,
ADD COLUMN     "expiryTimestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "maxFee" BIGINT NOT NULL,
ADD COLUMN     "nonce" TEXT NOT NULL,
ADD COLUMN     "orchestrator" TEXT NOT NULL,
ADD COLUMN     "solverExpiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sourceChainId" INTEGER NOT NULL,
ADD COLUMN     "sourceTokenAddress" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "targetChainId" INTEGER NOT NULL,
ADD COLUMN     "targetTokenAddress" TEXT NOT NULL,
ADD COLUMN     "userData" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserAccount" DROP CONSTRAINT "UserAccount_pkey",
DROP COLUMN "address",
DROP COLUMN "id",
ADD COLUMN     "accountLocker" TEXT NOT NULL,
ADD COLUMN     "accountOwner" TEXT NOT NULL,
ADD CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("accountLocker");

-- DropTable
DROP TABLE "BridgeIntent";

-- DropTable
DROP TABLE "PendingClaim";

-- CreateIndex
CREATE UNIQUE INDEX "ClaimRequest_UserAccountId_nonce_key" ON "ClaimRequest"("UserAccountId", "nonce");

-- AddForeignKey
ALTER TABLE "ClaimRequest" ADD CONSTRAINT "ClaimRequest_UserAccountId_fkey" FOREIGN KEY ("UserAccountId") REFERENCES "UserAccount"("accountLocker") ON DELETE RESTRICT ON UPDATE CASCADE;
