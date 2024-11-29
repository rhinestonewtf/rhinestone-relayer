import { Address } from 'viem'
import { RelayerChainConfig } from '../types'
import { arbitrum, base } from 'viem/chains'

require('dotenv').config()

export const arbitrumUSDC: Address =
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
export const baseUSDC: Address = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

export const validatorAddress: Address =
  '0x2483DA3A338895199E5e538530213157e931Bf06'
export const moduleAttester: Address =
  '0x8a310b9085faF5d9464D84C3d9a7BE3b28c94531'
export const originExecutor: Address =
  '0x868E00ae42214a5a1BB2d01aE1587c8814cF45BB'
export const targetExecutor: Address =
  '0xaffd5668449271Ce63B2a37fB0631f3B27F053b8'
export const hook: Address = '0x97fbddd688327229eb193e824c8466d0c8c848fb'

export const REPAYMENT_CHAIN_ID = 42161n
// Define the registry for different networks
export const registry: Record<number, RelayerChainConfig> = {
  42161: {
    // Arbitrum
    rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    usdcAddress: arbitrumUSDC,
    spokepoolAddress: '0xFf6EE0FEf01A589F5B25C575Cd089B79cA81C0B8',
    viemChain: arbitrum,
  },
  8453: {
    // Base
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    usdcAddress: baseUSDC,
    spokepoolAddress: '0x634341c2fca77a82f3885e2cb28c5f068bbb4788',
    viemChain: base,
  },
  // Add more networks as needed
}

// Function to get network details by chain ID
export const getNetworkDetails = (chainId: number): RelayerChainConfig => {
  if (!(chainId in registry)) {
    throw new Error(`Unsupported chainId: ${chainId}`)
  }

  return registry[chainId]
}

export const getSpokepoolAddress = (chainId: number): Address => {
  return getNetworkDetails(chainId).spokepoolAddress
}

export const isSupportedNetwork = (chainId: number): boolean => {
  return chainId in registry
}
