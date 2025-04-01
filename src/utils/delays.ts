import { BundleEvent, getSupportedChainIds } from '@rhinestone/orchestrator-sdk'

const defaultDelayPeriod = 0

const defaultDelays: { [chaindId: number]: number } =
  getSupportedChainIds().reduce(
    (acc, chainId) => {
      const delay = process.env[`DELAY_${chainId}`] || process.env.DELAY
      if (delay) {
        acc[chainId] = parseInt(delay)
      } else {
        acc[chainId] = defaultDelayPeriod
      }
      return acc
    },
    {} as { [chaindId: number]: number },
  )

export async function delayForBundle(bundle: BundleEvent) {
    const delay = defaultDelays[bundle.targetFillPayload.chainId]
    if (delay && delay > 0) {
        console.log(
            `Delaying bundle ${bundle.bundleId} for ${delay} milliseconds`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay)) 
    }
}

export function getDelay(chainId: number) {
    return defaultDelays[chainId] || defaultDelayPeriod
}

export function setDelay(chainId: number, delay: number) {
    defaultDelays[chainId] = delay
}
