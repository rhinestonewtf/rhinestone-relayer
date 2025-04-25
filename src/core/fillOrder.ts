import { Address } from 'viem'
import { BundleEvent, Transaction } from '../types'
import { debugLog } from '../helpers/logger'
import { getOptimalDestinationChain, shouldReroute } from './inventory'

export const isClaimFirst = async (bundle: BundleEvent) => {
  // todo: This could be enhanced with inventory-based decision making
  return true
}

export const getTransactions = async (
  bundle: BundleEvent,
  isClaimFirstFn = isClaimFirst,
  relayerAddress: Address | undefined = undefined,
): Promise<{
  claims: Transaction[]
  fill: Transaction | undefined
}> => {
  const claimFirst = await isClaimFirstFn(bundle)

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

  // Apply inventory-based rebalancing if relayer address is provided
  // Note: In a production system, we'd need more sophisticated routing logic
  if (relayerAddress && bundle.acrossDepositEvents.length > 0) {
    try {
      // We'll use the first deposit event for simplicity
      // In a production system, more complex logic would be needed for multiple deposits
      const depositEvent = bundle.acrossDepositEvents[0]

      // Check if we should consider rerouting this transaction
      if (shouldReroute(depositEvent, relayerAddress)) {
        // Find the optimal destination chain based on our inventory distribution
        const optimalChainId = await getOptimalDestinationChain(
          depositEvent,
          relayerAddress,
        )

        // If we found an alternate destination, and it's different from the original
        if (
          optimalChainId &&
          optimalChainId !== bundle.targetFillPayload.chainId
        ) {
          debugLog(
            `Rebalancing: Redirecting fill from chain ${bundle.targetFillPayload.chainId} to chain ${optimalChainId}`,
          )

          // In a real implementation, we would modify the fill transaction here
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

          // Skip default assignment below
          return {
            claims,
            fill,
          }
        }
      }
    } catch (error) {
      // If rebalancing logic fails, fall back to original destination
      debugLog(
        `Error in rebalancing logic, using original destination: ${error}`,
      )
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
