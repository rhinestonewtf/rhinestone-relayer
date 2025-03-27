import {
  createPublicClient,
  createWalletClient,
  Hex,
  http,
  nonceManager,
  publicActions,
  extractChain,
} from 'viem'

import { privateKeyToAccount } from 'viem/accounts'
import { loadConfig } from './config'

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

const loadChainConfig = (path: string) => {
  const config = loadConfig(path)
  const res: { [key: number]: { rpcUrl: string } } = {}

  for (const [key, value] of Object.entries(config)) {
    const numKey = parseInt(key)

    res[numKey] = value as { rpcUrl: string }
  }

  return res
}

export const chains = loadChainConfig(
  process.env.CHAINS_CONFIG ?? 'chains.json',
)

export function getRPCUrl(chainId: number): string {
  if (!chains[chainId]) {
    throw new Error(`No RPC URL found for chainId: ${chainId}`)
  }
  return chains[chainId].rpcUrl
}
