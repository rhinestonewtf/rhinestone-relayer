import { Address } from "viem";

export type BridgeIntent = {
  accountLocker: Address;
  orchestrator: Address;
  sourceChainId: number;
  targetChainId: number;
  sourceTokenAddress: Address;
  targetTokenAddress: Address;
  amount: bigint;
  maxFee: bigint;
  nonce: string;
  userData: string;
  expiryTimestamp: number;
};
