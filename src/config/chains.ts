import { loadConfig } from './utils'

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

export function defaultGetRPCUrl(chainId: number): string {
  if (!chains[chainId]) {
    throw new Error(`No RPC URL found for chainId: ${chainId}`)
  }
  return chains[chainId].rpcUrl
}
