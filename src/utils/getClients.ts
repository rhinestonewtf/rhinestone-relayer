import {
  createPublicClient,
  createWalletClient,
  Hex,
  http,
  publicActions,
} from 'viem'

import { privateKeyToAccount } from 'viem/accounts'
// import { nonceManager } from 'viem'

export const getPublicClient = (chainId: number) => {
  return createPublicClient({
    transport: http(getRPCUrl(chainId)),
  })
}

export const getWalletClient = (chainId: number, privateKey: Hex) => {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    transport: http(getRPCUrl(chainId)),
  }).extend(publicActions)
}

export function getRPCUrl(chainId: number): string {
  const chainConfigs: { [key: number]: { rpcUrl: string } } = {
    1: {
      rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
    }, // Mainnet
    42161: {
      rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    }, // Arbitrum
    8453: {
      rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    }, // Base
    10: {
      rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    }, // Optimism
    11155111: {
      rpcUrl: `https://sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    }, // Sepolia
    84532: {
      rpcUrl: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    }, // Base Testnet
    421614: {
      rpcUrl: `https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    }, // Arbitrum Testnet
    11155420: {
      rpcUrl: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
  }

  if (!chainConfigs[chainId]) {
    throw new Error(`No RPC URL found for chainId: ${chainId}`)
  }

  return chainConfigs[chainId].rpcUrl
}
