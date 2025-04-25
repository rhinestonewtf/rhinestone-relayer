import { Address } from 'viem'
import { chains, getAssetWeight } from '../config/chains'

// Stub prices for assets (in USD)
const assetPrices: Record<string, number> = {
  NATIVE: 3000, // Approximate ETH price
  USDC: 1, // Stablecoin
  DAI: 1, // Stablecoin
}

// Decimal places for assets
// TODO: This object doesn't handle tokens not in the predefined list, which could cause errors if new assets are added.
// We may want to switch to defining some constants for assets we want to support across the board, or an external source
// of truth for this kind of information.
const assetDecimals: Record<string, number> = {
  NATIVE: 18,
  USDC: 6,
  DAI: 18,
}

// Types for balance tracking
interface AssetBalance {
  symbol: string
  address: string
  balance: bigint
  valueUSD: number
}

interface ChainBalance {
  chainId: number
  assets: AssetBalance[]
  totalValueUSD: number
}

interface PortfolioBalance {
  chains: ChainBalance[]
  totalValueUSD: number
}

// NOTE: For stub implementation, we'll hardcode some balances
//       In a real implementation, this would query on-chain balances
export async function getBalances(
  relayerAddress: Address,
): Promise<PortfolioBalance> {
  // This would be replaced with actual on-chain balance queries
  const portfolio: PortfolioBalance = {
    chains: [],
    totalValueUSD: 0,
  }

  // Calculate balances for each chain
  for (const [chainIdStr, chainConfig] of Object.entries(chains)) {
    const chainId = parseInt(chainIdStr)

    if (!chainConfig.assets) continue

    const chainBalance: ChainBalance = {
      chainId,
      assets: [],
      totalValueUSD: 0,
    }

    // Calculate balances for each asset on this chain
    for (const [symbol, assetConfig] of Object.entries(chainConfig.assets)) {
      // In a real implementation, we would query the blockchain here
      // For stub, we'll generate a random balance
      const rawBalance = BigInt(
        Math.floor(Math.random() * 100) * 10 ** assetDecimals[symbol],
      )

      // Calculate USD value
      const decimals = assetDecimals[symbol] || 18
      const normalizedBalance = Number(rawBalance) / 10 ** decimals
      const valueUSD = normalizedBalance * (assetPrices[symbol] || 0)

      const assetBalance: AssetBalance = {
        symbol,
        address: assetConfig.address,
        balance: rawBalance,
        valueUSD,
      }

      chainBalance.assets.push(assetBalance)
      chainBalance.totalValueUSD += valueUSD
    }

    portfolio.chains.push(chainBalance)
    portfolio.totalValueUSD += chainBalance.totalValueUSD
  }

  return portfolio
}

// Calculate target distribution based on weights
// TODO: Add caching if this becomes a performance bottleneck, as its input is likely to be static
export function calculateTargetDistribution(): Record<
  number,
  Record<string, number>
> {
  const targetDistribution: Record<number, Record<string, number>> = {}

  // Calculate total weights per asset across all chains
  const assetTotalWeights: Record<string, number> = {}

  for (const [chainIdStr, chainConfig] of Object.entries(chains)) {
    const chainId = parseInt(chainIdStr)
    targetDistribution[chainId] = {}

    if (!chainConfig.assets) continue

    for (const [symbol, assetConfig] of Object.entries(chainConfig.assets)) {
      const weight = getAssetWeight(chainId, symbol)

      if (!assetTotalWeights[symbol]) {
        assetTotalWeights[symbol] = 0
      }

      assetTotalWeights[symbol] += weight
    }
  }

  // Calculate percentage distribution for each asset on each chain
  for (const [chainIdStr, chainConfig] of Object.entries(chains)) {
    const chainId = parseInt(chainIdStr)

    if (!chainConfig.assets) continue

    for (const [symbol, assetConfig] of Object.entries(chainConfig.assets)) {
      const weight = getAssetWeight(chainId, symbol)
      const totalWeight = assetTotalWeights[symbol]

      if (totalWeight > 0) {
        // Calculate the target percentage for this asset on this chain
        targetDistribution[chainId][symbol] = weight / totalWeight
      }
    }
  }

  return targetDistribution
}

// Determine the optimal destination chain for an asset
export function findUnderfundedChain(
  asset: string,
  sourceChainId: number,
  currentBalances: PortfolioBalance,
): number | null {
  // Get target distribution
  const targetDistribution = calculateTargetDistribution()

  // Calculate actual distribution percentages
  const actualDistribution: Record<number, Record<string, number>> = {}
  const assetTotalValue: Record<string, number> = {}

  // First, calculate total value per asset
  for (const chain of currentBalances.chains) {
    if (!actualDistribution[chain.chainId]) {
      actualDistribution[chain.chainId] = {}
    }

    for (const assetBalance of chain.assets) {
      if (assetBalance.symbol === asset) {
        if (!assetTotalValue[asset]) {
          assetTotalValue[asset] = 0
        }
        assetTotalValue[asset] += assetBalance.valueUSD
      }
    }
  }

  // Then calculate actual distribution percentages
  for (const chain of currentBalances.chains) {
    for (const assetBalance of chain.assets) {
      if (assetBalance.symbol === asset && assetTotalValue[asset] > 0) {
        actualDistribution[chain.chainId][asset] =
          assetBalance.valueUSD / assetTotalValue[asset]
      } else {
        actualDistribution[chain.chainId][asset] = 0
      }
    }
  }

  // Find the chain with the biggest deficit compared to target
  let biggestDeficit = -1
  let optimalChainId: number | null = null

  for (const [chainIdStr, chainTargets] of Object.entries(targetDistribution)) {
    const chainId = parseInt(chainIdStr)

    // Skip source chain
    if (chainId === sourceChainId) continue

    // Check if this chain supports this asset
    if (!(asset in chainTargets)) continue

    const targetPercentage = chainTargets[asset]
    const actualPercentage = actualDistribution[chainId]?.[asset] || 0

    const deficit = targetPercentage - actualPercentage

    if (deficit > biggestDeficit) {
      biggestDeficit = deficit
      optimalChainId = chainId
    }
  }

  return optimalChainId
}

// Determine if we should route a specific deposit to a different chain
export function shouldReroute(
  depositEvent: any,
  relayerAddress: Address,
): boolean {
  // TODO: Implement based on current inventory, may require that as input...
  return true
}

// Get optimal destination chain based on inventory distribution
export async function getOptimalDestinationChain(
  depositEvent: any,
  relayerAddress: Address,
): Promise<number | null> {
  try {
    // Get current balances
    const balances = await getBalances(relayerAddress)

    // Find the most underfunded chain for this asset
    const assetSymbol = getAssetSymbolFromAddress(
      depositEvent.outputToken,
      depositEvent.destinationChainId,
    )

    if (!assetSymbol) return null

    return findUnderfundedChain(
      assetSymbol,
      depositEvent.originChainId,
      balances,
    )
  } catch (error) {
    console.error('Error determining optimal destination chain:', error)
    return null
  }
}

// Helper to get asset symbol from address (stub implementation)
function getAssetSymbolFromAddress(
  address: string,
  chainId: number,
): string | null {
  // Look up the symbol from the address in our chain config
  const chainConfig = chains[chainId]

  if (!chainConfig || !chainConfig.assets) return null

  for (const [symbol, assetConfig] of Object.entries(chainConfig.assets)) {
    if (assetConfig.address.toLowerCase() === address.toLowerCase()) {
      return symbol
    }
  }

  return null
}
