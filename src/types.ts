import { Address, Chain } from 'viem'

export type RelayerChainConfig = {
  rpcUrl: string
  viemChain: Chain
  usdcAddress: Address
  spokepoolAddress: Address
}
