import { Address } from 'viem'
import { chains, getAssetWeight } from '../config/chains'
import { getPublicClient } from '../helpers/getClients'

// TODO: Maybe move to an artifacts directory?
// Minimal ERC20 ABI - only what we need for balance checking (and decimals)
const erc20ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const

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

/**
 * Get token balance for an account on a specific chain
 * Handles both native tokens and ERC20 tokens
 */
async function getTokenBalance(
  chainId: number,
  tokenAddress: Address,
  account: Address,
  getRPCUrl: (chainId: number) => string,
): Promise<{ balance: bigint; decimals: number }> {
  const publicClient = getPublicClient(chainId, getRPCUrl)
  let balance: bigint
  let decimals: number

  // TODO: Not every chain's native token is 0 address...
  // Handle native token (ETH, MATIC, etc.)
  if (tokenAddress === '0x0000000000000000000000000000000000000000') {
    try {
      balance = await publicClient.getBalance({ address: account })
      // Native tokens typically have 18 decimals
      decimals = 18
    } catch (error) {
      console.error(
        `Error getting native token balance on chain ${chainId}:`,
        error,
      )
      balance = 0n
      decimals = 18
    }
  } else {
    // For ERC-20 tokens
    try {
      // Get balance
      const balanceResult = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account],
      })

      balance = balanceResult as bigint

      // Try to get decimals from the contract
      try {
        const decimalsResult = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20ABI,
          functionName: 'decimals',
          args: [],
        })

        decimals = Number(decimalsResult)
      } catch (error) {
        // If decimals function fails, try to find in our mapping first, then fall back to default
        console.warn(
          `Failed to get decimals for token ${tokenAddress} on chain ${chainId}, using configured value or default`,
        )

        // Find by token address (in case it's mapped) or use symbol mapping through assetConfig
        // If all else fails, default to 18 decimals
        decimals = assetDecimals[tokenAddress] || 18
      }
    } catch (error) {
      console.error(
        `Error getting balance for token ${tokenAddress} on chain ${chainId}:`,
        error,
      )
      balance = 0n
      decimals = 18
    }
  }

  return { balance, decimals }
}

/**
 * Get balances for the relayer across all configured chains
 * Can optionally filter to a specific asset symbol
 */
export async function getBalances(
  getRPCUrl: (chainId: number) => string,
  relayerAddress: Address,
  assetSymbol?: string,
): Promise<PortfolioBalance> {
  const portfolio: PortfolioBalance = {
    chains: [],
    totalValueUSD: 0,
  }

  // Process each chain from our configuration
  for (const [chainIdStr, chainConfig] of Object.entries(chains)) {
    const chainId = parseInt(chainIdStr)

    if (!chainConfig.assets) continue

    const chainBalance: ChainBalance = {
      chainId,
      assets: [],
      totalValueUSD: 0,
    }

    // Process each asset on this chain
    for (const [symbol, assetConfig] of Object.entries(chainConfig.assets)) {
      // Skip if we're filtering by asset and this isn't the one we want
      if (assetSymbol && symbol !== assetSymbol) continue

      try {
        // Query the on-chain balance
        const { balance, decimals } = await getTokenBalance(
          chainId,
          assetConfig.address as Address,
          relayerAddress,
          getRPCUrl,
        )

        // Calculate USD value
        const normalizedBalance = Number(balance) / 10 ** decimals
        const valueUSD = normalizedBalance * (assetPrices[symbol] || 0)

        const assetBalance: AssetBalance = {
          symbol,
          address: assetConfig.address,
          balance,
          valueUSD,
        }

        chainBalance.assets.push(assetBalance)
        chainBalance.totalValueUSD += valueUSD
      } catch (error) {
        console.error(
          `Error getting balance for ${symbol} on chain ${chainId}:`,
          error,
        )
        // Continue with other assets even if one fails
      }
    }

    // Only add chains that have at least one valid asset balance
    if (chainBalance.assets.length > 0) {
      portfolio.chains.push(chainBalance)
      portfolio.totalValueUSD += chainBalance.totalValueUSD
    }
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

  // Calculate total value for this specific asset
  let totalValue = 0
  for (const chain of currentBalances.chains) {
    if (!actualDistribution[chain.chainId]) {
      actualDistribution[chain.chainId] = {}
    }

    // Find the asset in this chain's assets (should be at most one entry now)
    const assetBalance = chain.assets.find((a) => a.symbol === asset)
    if (assetBalance) {
      totalValue += assetBalance.valueUSD
    }
  }

  // No need to calculate for multiple assets anymore
  // Calculate actual distribution percentages for this asset
  for (const chain of currentBalances.chains) {
    const assetBalance = chain.assets.find((a) => a.symbol === asset)

    if (assetBalance && totalValue > 0) {
      actualDistribution[chain.chainId][asset] =
        assetBalance.valueUSD / totalValue
    } else {
      actualDistribution[chain.chainId][asset] = 0
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

// Get optimal destination chain based on inventory distribution
// This function uses the depositEvent to determine which asset we're handling
// and finds the most underfunded chain for that specific asset
export async function getOptimalDestinationChain(
  depositEvent: any,
  relayerAddress: Address,
  getRPCUrl: (chainId: number) => string,
): Promise<number | null> {
  try {
    // Find the asset symbol from the output token
    const assetSymbol = getAssetSymbolFromAddress(
      depositEvent.outputToken,
      depositEvent.destinationChainId,
    )

    // If we can't identify the asset, we can't reroute it
    // TODO: This means the asset is not supported, we should at least log this, but potentially hard error
    if (!assetSymbol) return null

    // Get current balances for just this specific asset
    const balances = await getBalances(getRPCUrl, relayerAddress, assetSymbol)

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
