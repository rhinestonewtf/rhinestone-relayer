import { Address } from 'viem'
import { defaultGetRPCUrl } from './config/chains'
import { addDelay } from './core/delay'
import { getTransactions } from './core/fillOrder'
import { handleTransactions } from './core/transactionHandler'
import { validateBundle } from './core/validator'
import { debugLog } from './helpers/logger'
import { addBundleId } from './monitoring/tracing'
import { BundleEvent } from './types'

export const processBundle = async (
  bundle: BundleEvent,
  getRPCUrl: (chainId: number) => string = defaultGetRPCUrl,
  relayerAddress: Address | undefined = undefined,
) => {
  // add bundle id for tracing
  addBundleId(String(bundle.bundleId))

  // validate the bundle
  const isValid = await validateBundle(bundle)
  debugLog(`Bundle ${bundle.bundleId} is valid: ${isValid}`)

  if (!isValid) {
    // if the bundle is not valid, we should not process it
    // this should be handled by the monitoring system
    return
  }

  // add a time delay
  // note: this is used to give other fillers time to fill the order
  await addDelay(bundle)

  // determine order of filling, potentially applying inventory rebalancing
  const { claims, fill } = await getTransactions(
    bundle,
    undefined,
    relayerAddress,
    getRPCUrl,
  )

  // handle the claims
  const success = await handleTransactions(claims, getRPCUrl)
  debugLog(`Claims for bundle ${bundle.bundleId} were successful: ${success}`)

  // if claims were successful and we havent filled yet, then fill now
  if (success && fill) {
    debugLog(`Filling bundle ${bundle.bundleId}`)
    await handleTransactions([fill], getRPCUrl)
  }
}
