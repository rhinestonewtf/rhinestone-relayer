import { describe, expect, it, vi } from 'vitest'
import { isClaimFirst, getTransactions } from '../../src/core/fillOrder'
import { getEmptyBundleEvent } from '../common/utils'

describe('fillOrder', () => {
  it('should determine fill order', async () => {
    const bunlde = getEmptyBundleEvent()
    const claimFirst = await isClaimFirst(bunlde)

    expect(claimFirst).toBe(true)
  })

  it('should get transactions in case of fill first', async () => {
    const bundle = getEmptyBundleEvent()
    bundle.acrossDepositEvents[0].originClaimPayload.chainId = 1

    const { claims, fill } = await getTransactions(bundle)

    expect(claims.length).toBe(1)
    expect(claims[0].to).toBe(
      bundle.acrossDepositEvents[0].originClaimPayload.to,
    )
    expect(claims[0].data).toBe(
      bundle.acrossDepositEvents[0].originClaimPayload.data,
    )
    expect(claims[0].chainId).toBe(
      bundle.acrossDepositEvents[0].originClaimPayload.chainId,
    )
    expect(claims[0].value).toBe(0n)

    expect(fill).toBeDefined()
    expect(fill?.to).toBe(bundle.targetFillPayload.to)
    expect(fill?.data).toBe(bundle.targetFillPayload.data)
    expect(fill?.chainId).toBe(bundle.targetFillPayload.chainId)
    expect(fill?.value).toBe(0n)
  })

  it('should get transactions without samechain claim', async () => {
    const bundle = getEmptyBundleEvent()

    // we don't need to manipulate bundle because chainId is 0 by default
    const { claims } = await getTransactions(bundle)

    expect(claims.length).toBe(0)
  })

  it('should get transactions in case of fill first', async () => {
    const bundle = getEmptyBundleEvent()
    bundle.acrossDepositEvents[0].originClaimPayload.chainId = 1

    const { claims, fill } = await getTransactions(bundle, async () => false)

    expect(claims.length).toBe(2)
    expect(claims[0].to).toBe(bundle.targetFillPayload.to)
    expect(claims[0].data).toBe(bundle.targetFillPayload.data)
    expect(claims[0].chainId).toBe(bundle.targetFillPayload.chainId)
    expect(claims[0].value).toBe(0n)

    expect(claims[1].to).toBe(
      bundle.acrossDepositEvents[0].originClaimPayload.to,
    )
    expect(claims[1].data).toBe(
      bundle.acrossDepositEvents[0].originClaimPayload.data,
    )
    expect(claims[1].chainId).toBe(
      bundle.acrossDepositEvents[0].originClaimPayload.chainId,
    )
    expect(claims[1].value).toBe(0n)

    expect(fill).toBeUndefined()
  })
})
