import { Address, Chain, Hex, SignedAuthorizationList } from 'viem'

export type RelayerChainConfig = {
  rpcUrl: string
  viemChain: Chain
  usdcAddress: Address
  spokepoolAddress: Address
}

export type Transaction = {
  chainId: number
  to: Address
  value: bigint
  data: Hex
  isFill: boolean
  authorisationList?: SignedAuthorizationList
}

export type BundleEvent = {
  bundleId: bigint
  type: string
  targetFillPayload: ChainExecution
  acrossDepositEvents: DepositEvent[]
}

export type DepositEvent = {
  originClaimPayload: ChainExecution
  inputToken: Address // address
  outputToken: Address // address
  inputAmount: bigint // uint256
  outputAmount: bigint // uint256
  destinationChainId: number
  originChainId: number
  depositId: bigint // uint256 (indexed)
  quoteTimestamp: number // uint32
  fillDeadline: number // uint32
  exclusivityDeadline: number // uint32
  depositor: Address // address (indexed)
  recipient: Address // address
  exclusiveRelayer: Address // address
  message: Hex // bytes
}

export type ChainExecution = {
  chainId: number
  to: Address
  value: bigint
  data: Hex
}
