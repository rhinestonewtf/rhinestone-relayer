/*
  Warnings:

  - The primary key for the `UserAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[accountLocker,chainId]` on the table `UserAccount` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `UserAccountId` on the `ClaimRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `chainId` to the `UserAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lockerOwner` to the `UserAccount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClaimRequest" DROP CONSTRAINT "ClaimRequest_UserAccountId_fkey";

-- AlterTable
ALTER TABLE "ClaimRequest" DROP COLUMN "UserAccountId",
ADD COLUMN     "UserAccountId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserAccount" DROP CONSTRAINT "UserAccount_pkey",
ADD COLUMN     "chainId" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "lockerOwner" TEXT NOT NULL,
ADD CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimRequest_UserAccountId_nonce_key" ON "ClaimRequest"("UserAccountId", "nonce");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_accountLocker_chainId_key" ON "UserAccount"("accountLocker", "chainId");

-- AddForeignKey
ALTER TABLE "ClaimRequest" ADD CONSTRAINT "ClaimRequest_UserAccountId_fkey" FOREIGN KEY ("UserAccountId") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
