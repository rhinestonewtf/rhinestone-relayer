import { Address } from 'viem'
import { BundleEvent, Transaction } from '../types'
import { debugLog } from '../helpers/logger'
import { getOptimalDestinationChain } from './inventory'

export const isClaimFirst = async (bundle: BundleEvent) => {
  // todo: This could be enhanced with inventory-based decision making
  return true
}

export const getTransactions = async (
  bundle: BundleEvent,
  isClaimFirstFn = isClaimFirst,
  relayerAddress: Address | undefined = undefined,
  getRPCUrl: (chainId: number) => string,
): Promise<{
  claims: Transaction[]
  fill: Transaction | undefined
}> => {
  const claimFirst = await isClaimFirstFn(bundle)

  // Process claim transactions
  const claims = bundle.acrossDepositEvents
    .map((depositEvent: any) => {
      if (depositEvent.originClaimPayload.chainId === 0) {
        return
      }

      return {
        to: depositEvent.originClaimPayload.to,
        data: depositEvent.originClaimPayload.data,
        chainId: depositEvent.originClaimPayload.chainId,
        value: 0n, // we never need to send value
      }
    })
    .filter(Boolean) as Transaction[]

  let fill: Transaction | undefined

  // Default fill payload from the bundle
  const originalFillPayload = {
    to: bundle.targetFillPayload.to,
    data: bundle.targetFillPayload.data,
    chainId: bundle.targetFillPayload.chainId,
    value: 0n, // we never need to send value
  }

  // Apply inventory-based rebalancing (if relayer address is provided)
  if (relayerAddress && bundle.acrossDepositEvents.length > 0) {
    // Process each deposit event individually
    let optimalChainId: number | null = null

    // Loop through each deposit event to find the optimal destination
    for (const depositEvent of bundle.acrossDepositEvents) {
      try {
        // Skip if there's no origin claim payload (already filtered in claims)
        if (depositEvent.originClaimPayload.chainId === 0) continue

        // Determine optimal destination chain for this deposit event
        const eventOptimalChainId = await getOptimalDestinationChain(
          depositEvent,
          relayerAddress,
          getRPCUrl,
        )

        // If we found a valid optimal chain, consider it
        if (eventOptimalChainId) {
          // If we haven't found an optimal chain yet, use this one
          if (!optimalChainId) {
            optimalChainId = eventOptimalChainId
            debugLog(
              `Considering chain ${optimalChainId} as optimal destination`,
            )
          }
          // If this deposit's optimal chain differs from a previous one,
          // we have conflicting needs. In this simple implementation,
          // we'll use the first valid one, but a more sophisticated approach
          // might prioritize based on deficit size, value, etc.
          else if (optimalChainId !== eventOptimalChainId) {
            debugLog(
              `Note: Deposit events have different optimal destinations (${optimalChainId} vs ${eventOptimalChainId})`,
            )
          }
        }
      } catch (error) {
        // If processing one deposit fails, log and continue with others
        debugLog(`Error processing deposit event: ${error}`)
        // We continue the loop to process other deposit events
      }
    }

    // If we found an optimal chain different from the original destination
    if (optimalChainId && optimalChainId !== bundle.targetFillPayload.chainId) {
      debugLog(
        `Rebalancing: Redirecting fill from chain ${bundle.targetFillPayload.chainId} to chain ${optimalChainId}`,
      )

      // TODO: In a real implementation, we would modify the fill transaction here
      // to target the new chain. This would involve:
      // 1. Generate a new transaction for the optimal chain
      // 2. Update the fill payload with the new transaction

      // For our stub implementation, we're just changing the chainId
      // In production, this would require additional on-chain operations
      const rebalancedFillPayload = {
        ...originalFillPayload,
        chainId: optimalChainId,
        // In a real implementation, we would also need to update
        // the 'to' address and 'data' for the new chain
      }

      // Use the rebalanced fill payload
      if (claimFirst) {
        fill = rebalancedFillPayload
      } else {
        claims.unshift(rebalancedFillPayload)
      }

      // Skip default assignment
      return {
        claims,
        fill,
      }
    }
  }

  // Default behavior if no rebalancing occurred
  if (!claimFirst) {
    claims.unshift(originalFillPayload)
  } else {
    fill = originalFillPayload
  }

  return {
    claims,
    fill,
  }
}
