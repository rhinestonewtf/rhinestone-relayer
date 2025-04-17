import { defaultGetRPCUrl } from './config/chains'
import { addDelay } from './core/delay'
import { getTransactions } from './core/fillOrder'
import { handleTransactions } from './core/transactionHandler'
import { validateBundle } from './core/validator'
import { addBundleId } from './monitoring/tracing'
import { BundleEvent } from './types'

export const processBundle = async (
  bundle: BundleEvent,
  getRPCUrl: (chainId: number) => string = defaultGetRPCUrl,
) => {
  // add bundle id for tracing
  addBundleId(String(bundle.bundleId))

  // validate the bundle
  const isValid = await validateBundle(bundle)

  if (!isValid) {
    // if the bundle is not valid, we should not process it
    // this should be handled by the monitoring system
    return
  }

  // add a time delay
  // note: this is used to give other fillers time to fill the order
  await addDelay(bundle)

  // determine order of filling
  const { claims, fill } = await getTransactions(bundle)

  // handle the claims
  const success = await handleTransactions(claims, getRPCUrl)

  // if claims were successful and we havent filled yet, then fill now
  if (success && fill) {
    await handleTransactions([fill], getRPCUrl)
  }
}
