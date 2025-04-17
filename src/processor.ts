import { addBundleId } from './tracing'
import { defaultGetRPCUrl } from './utils/chains'
import { addDelay } from './utils/delay'
import { getTransactions } from './utils/fillOrder'
import { handleTransactions } from './utils/transactionHandler'
import { validateBundle } from './utils/validator'

export const processBundle = async (
  bundle: any,
  getRPCUrl: (chainId: number) => string = defaultGetRPCUrl,
) => {
  // add bundle id for tracing
  addBundleId(bundle.bundleId)

  // validate the bundle
  await validateBundle(bundle)

  // add a time delay
  // note: this is used to give other fillers time to fill the order
  await addDelay(bundle)

  // determine order of filling
  const { claims, fill } = await getTransactions(bundle)

  const success = await handleTransactions(claims, getRPCUrl)

  if (success && fill) {
    await handleTransactions([fill], getRPCUrl)
  }
}
