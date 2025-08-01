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
  authorizationList?: SignedAuthorizationList
}

export type FeeEstimation = {
  gas: bigint
  maxFeePerGas: bigint,
  maxPriorityFeePerGas: bigint,
}
