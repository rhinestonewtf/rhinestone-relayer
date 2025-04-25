import { loadConfig } from './utils'

type ChainConfig = {
  rpcUrl: string
  assets?: {
    [symbol: string]: {
      address: string // Chain-specific contract address
      targetWeight?: number // Optional weight for distribution, defaults to 1
    }
  }
}

const loadChainConfig = (path: string) => {
  const config = loadConfig(path)
  const res: { [key: number]: ChainConfig } = {}

  for (const [key, value] of Object.entries(config)) {
    const numKey = parseInt(key)

    res[numKey] = value as ChainConfig
  }

  return res
}

export const chains = loadChainConfig(
  process.env.CHAINS_CONFIG ?? 'chains.json',
)

export function defaultGetRPCUrl(chainId: number): string {
  if (!chains[chainId]) {
    throw new Error(`No RPC URL found for chainId: ${chainId}`)
  }
  return chains[chainId].rpcUrl
}

// Helper function to get asset weight (defaults to 1 if not specified)
export function getAssetWeight(chainId: number, symbol: string): number {
  if (
    !chains[chainId] ||
    !chains[chainId].assets ||
    !chains[chainId].assets[symbol]
  ) {
    return 0 // Asset not supported on this chain
  }

  return chains[chainId].assets[symbol].targetWeight ?? 1
}
