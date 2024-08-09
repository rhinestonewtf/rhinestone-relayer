/*
  Warnings:

  - You are about to drop the column `accountLocker` on the `ClaimRequest` table. All the data in the column will be lost.
  - Changed the type of `expiryTimestamp` on the `ClaimRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `solverExpiry` on the `ClaimRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ClaimRequest" DROP COLUMN "accountLocker",
DROP COLUMN "expiryTimestamp",
ADD COLUMN     "expiryTimestamp" INTEGER NOT NULL,
DROP COLUMN "solverExpiry",
ADD COLUMN     "solverExpiry" INTEGER NOT NULL;
