const determineFillOrder = async (bundle: any) => {
  // todo
  return true
}

export const getTransactions = async (bundle: any) => {
  const claimFirst = await determineFillOrder(bundle)

  const claims = bundle.acrossDepositEvents.flatMap((depositEvent: any) => {
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

  let fill

  const fillPayload = {
    to: bundle.targetFillPayload.to,
    data: bundle.targetFillPayload.data,
    chainId: bundle.targetFillPayload.chainId,
    value: 0n, // we never need to send value
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
