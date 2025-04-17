import { BundleEvent } from '../types'

export const addDelay = async (bundle: BundleEvent) => {
  let delay = 0
  let hasEth
  let hasL2s

  if (
    bundle.acrossDepositEvents.every(
      (depositEvent: any) => depositEvent.originClaimPayload.chainId === 0,
    )
  ) {
    // in pure samechain case, only do a 4s delay
    delay = 4000
  } else {
    for (const depositEvent of bundle.acrossDepositEvents) {
      const chainId = depositEvent.originClaimPayload.chainId

      if (chainId === 1) {
        hasEth = true
      } else if (
        chainId === 10 ||
        chainId === 137 ||
        chainId === 8453 ||
        chainId === 42161
      ) {
        hasL2s = true
      }

      // terminate early if we have eth
      if (hasEth) {
        break
      }
    }
  }

  if (hasEth) {
    delay = 25000 // 25 seconds
  } else if (hasL2s) {
    delay = 15000 // 15 seconds
  }

  if (delay > 0 && process.env.DEPLOYMENT_ENV == 'prod') {
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}
