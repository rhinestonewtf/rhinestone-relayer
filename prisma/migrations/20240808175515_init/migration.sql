-- CreateTable
CREATE TABLE "BridgeIntent" (
    "id" SERIAL NOT NULL,
    "targetChainId" INTEGER NOT NULL,
    "expiryTimestamp" TIMESTAMP(3) NOT NULL,
    "orchestrator" TEXT NOT NULL,
    "sourceTokenAddress" TEXT NOT NULL,
    "targetTokenAddress" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "maxFee" BIGINT NOT NULL,
    "nonce" TEXT NOT NULL,
    "userData" TEXT NOT NULL,

    CONSTRAINT "BridgeIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimRequest" (
    "id" SERIAL NOT NULL,
    "fee" BIGINT NOT NULL,
    "claimRecipient" TEXT NOT NULL,
    "bridgeIntentId" INTEGER NOT NULL,

    CONSTRAINT "ClaimRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClaimRequest" ADD CONSTRAINT "ClaimRequest_bridgeIntentId_fkey" FOREIGN KEY ("bridgeIntentId") REFERENCES "BridgeIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
