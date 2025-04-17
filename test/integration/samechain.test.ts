import { describe, it, expect } from 'vitest'
import { Hex } from 'viem'
import { getEmptyBundleEvent } from '../common/utils'
import { privateKeyToAccount } from 'viem/accounts'
import {
  getCount,
  getThreadId,
  mockGetRPRUrl,
  setupChain,
} from './common/utils'
import { RHINESTONE_SPOKEPOOL_ADDRESS } from '../../src/constants'
import { processBundle } from '../../src/processor'

const solverAccount = privateKeyToAccount(
  process.env.SOLVER_PRIVATE_KEY! as Hex,
)

describe('samechain', () => {
  it.concurrent(
    'should make a single transaction for pure samechain',
    async () => {
      const threadId = getThreadId(10)

      await setupChain({
        rpcUrl: `http://localhost:8545/${threadId}`,
        solverAddress: solverAccount.address,
      })
      const bundle = getEmptyBundleEvent()

      bundle.acrossDepositEvents[0].originClaimPayload = {
        ...bundle.acrossDepositEvents[0].originClaimPayload,
        chainId: 1,
        to: RHINESTONE_SPOKEPOOL_ADDRESS,
        data: '0xd09de08a',
      }
      bundle.targetFillPayload.chainId = 1
      bundle.targetFillPayload.to = RHINESTONE_SPOKEPOOL_ADDRESS
      bundle.targetFillPayload.data = '0xd09de08a'

      await processBundle(bundle, mockGetRPRUrl(threadId))

      const sourceCount = await getCount({
        rpcUrl: `http://localhost:8545/${threadId}`,
        address: solverAccount.address,
      })
      expect(sourceCount).toEqual(1n)
    },
  )

  it.concurrent(
    'should make a single transaction for mixed samechain',
    async () => {
      const threadId = getThreadId(10)

      await setupChain({
        rpcUrl: `http://localhost:8545/${threadId}`,
        solverAddress: solverAccount.address,
      })
      await setupChain({
        rpcUrl: `http://localhost:8546/${threadId}`,
        solverAddress: solverAccount.address,
      })

      const bundle = getEmptyBundleEvent()

      bundle.acrossDepositEvents[0].originClaimPayload = {
        ...bundle.acrossDepositEvents[0].originClaimPayload,
        chainId: 1,
        to: RHINESTONE_SPOKEPOOL_ADDRESS,
        data: '0xd09de08a',
      }
      bundle.acrossDepositEvents.push(
        getEmptyBundleEvent().acrossDepositEvents[0],
      )
      bundle.acrossDepositEvents[1].originClaimPayload = {
        ...bundle.acrossDepositEvents[1].originClaimPayload,
        chainId: 2,
        to: RHINESTONE_SPOKEPOOL_ADDRESS,
        data: '0xd09de08a',
      }

      bundle.targetFillPayload.chainId = 1
      bundle.targetFillPayload.to = RHINESTONE_SPOKEPOOL_ADDRESS
      bundle.targetFillPayload.data = '0xd09de08a'

      await processBundle(bundle, mockGetRPRUrl(threadId))

      const firstSourceCount = await getCount({
        rpcUrl: `http://localhost:8545/${threadId}`,
        address: solverAccount.address,
      })
      expect(firstSourceCount).toEqual(1n)

      const secondSourceCount = await getCount({
        rpcUrl: `http://localhost:8546/${threadId}`,
        address: solverAccount.address,
      })
      expect(secondSourceCount).toEqual(1n)
    },
  )
})
