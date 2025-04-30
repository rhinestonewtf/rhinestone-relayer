import { BundleEvent, Transaction } from '../types'

export const isClaimFirst = async (bundle: BundleEvent) => {
  // todo
  return true
}

export const getTransactions = async (
  bundle: BundleEvent,
  isClaimFirstFn = isClaimFirst,
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
        isFill: false,
      }
    })
    .filter(Boolean) as Transaction[]

  let fill

  const fillPayload = {
    to: bundle.targetFillPayload.to,
    data: bundle.targetFillPayload.data,
    chainId: bundle.targetFillPayload.chainId,
    value: 0n, // we never need to send value
    isFill: true,
  }

  if (!claimFirst) {
    claims.unshift(fillPayload)
  } else {
    fill = fillPayload
  }

  return {
    claims,
    fill,
  }
}
