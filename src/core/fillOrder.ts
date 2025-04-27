import { Address } from 'viem'
import { BundleEvent, Transaction } from '../types'
import { debugLog } from '../helpers/logger'
import { getOptimalDestinationChain } from './inventory'
import {
  decodeAcrossFillData,
  encodeAcrossFillData,
  updateRepaymentChainId,
} from '../helpers/across'

export const isClaimFirst = async (bundle: BundleEvent) => {
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
        `Rebalancing: Setting repayment from chain ${bundle.targetFillPayload.chainId} to chain ${optimalChainId}`,
      )

      // In order to change the repayment chain, we need to decode the original fill data,
      // update the repaymentChainId parameter, and re-encode the data.
      // 1) Decode the original fill data
      const decodedData = decodeAcrossFillData(bundle.targetFillPayload.data)

      // 2) Update the repaymentChainId parameter using the helper function
      const updatedData = updateRepaymentChainId(
        decodedData,
        BigInt(optimalChainId),
      )

      // 3) Re-encode the data with the updated parameter
      const reEncodedData = encodeAcrossFillData(updatedData)

      // 4) Create the modified payload
      const rebalancedFillPayload = {
        ...originalFillPayload,
        data: reEncodedData,
      }

      // 5) Use the rebalanced fill payload
      if (claimFirst) {
        fill = rebalancedFillPayload
      } else {
        claims.unshift(rebalancedFillPayload)
      }

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
