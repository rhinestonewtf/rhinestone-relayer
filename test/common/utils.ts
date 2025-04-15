// import type { BundleEvent } from '@rhinestone/orchestrator-sdk'
import { zeroAddress } from 'viem'

export const getEmptyBundleEvent = () => {
  return {
    bundleId: 0n,
    type: 'Bundle',
    targetFillPayload: {
      chainId: 0,
      to: zeroAddress,
      data: '0x',
      value: 0n,
    },
    acrossDepositEvents: [
      {
        originClaimPayload: {
          to: zeroAddress,
          value: 0n,
          data: zeroAddress,
          chainId: 0,
        },
        originChainId: 0,
        inputToken: zeroAddress,
        inputAmount: 0n,
        outputToken: zeroAddress,
        outputAmount: 0n,
        destinationChainId: 0,
        depositId: 0n,
        quoteTimestamp: 0,
        fillDeadline: 0,
        exclusivityDeadline: 0,
        depositor: zeroAddress,
        recipient: zeroAddress,
        exclusiveRelayer: zeroAddress,
        message: '0x',
      },
    ],
  }
}
