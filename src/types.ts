import { Address, Chain } from 'viem'

export type RelayerChainConfig = {
  rpcUrl: string
  viemChain: Chain
  usdcAddress: Address
  spokepoolAddress: Address
}

export type DepositEvent = {
  inputToken: Address // address
  outputToken: Address // address
  inputAmount: bigint // uint256
  outputAmount: bigint // uint256
  destinationChainId: number // uint256 (indexed)
  depositId: bigint // uint256 (indexed)
  quoteTimestamp: number // uint32
  fillDeadline: number // uint32
  exclusivityDeadline: number // uint32
  depositor: Address // address (indexed)
  recipient: Address // address
  exclusiveRelayer: Address // address
  message: string // bytes
}

export type BundleEvent = {
  bundleId: string
  standardDepositEvents: DepositEvent[]
  executionDepositEvent: DepositEvent
}
