import { describe, it, expect, beforeAll } from 'vitest'
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
import { waitForServer } from './common/server'

const solverAccount = privateKeyToAccount(
  process.env.SOLVER_PRIVATE_KEY! as Hex,
)

describe('multi chain', () => {
  beforeAll(async () => {
    await waitForServer('http://localhost:8545/healthcheck')
    await waitForServer('http://localhost:8546/healthcheck')
    await waitForServer('http://localhost:8547/healthcheck')
  })

  it.concurrent('should claim first and then fill', async () => {
    const threadId = getThreadId()

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
    bundle.targetFillPayload.chainId = 2
    bundle.targetFillPayload.to = RHINESTONE_SPOKEPOOL_ADDRESS
    bundle.targetFillPayload.data = '0xd09de08a'

    await processBundle(bundle, mockGetRPRUrl(threadId))

    const sourceCount = await getCount({
      rpcUrl: `http://localhost:8545/${threadId}`,
      address: solverAccount.address,
    })
    expect(sourceCount).toEqual(1n)

    const targetCount = await getCount({
      rpcUrl: `http://localhost:8546/${threadId}`,
      address: solverAccount.address,
    })
    expect(targetCount).toEqual(1n)
  })

  it.concurrent(
    'should claim on multiple chains and then fill',
    async () => {
      const threadId = getThreadId()

      await setupChain({
        rpcUrl: `http://localhost:8545/${threadId}`,
        solverAddress: solverAccount.address,
      })
      await setupChain({
        rpcUrl: `http://localhost:8546/${threadId}`,
        solverAddress: solverAccount.address,
      })
      await setupChain({
        rpcUrl: `http://localhost:8547/${threadId}`,
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

      bundle.targetFillPayload.chainId = 3
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

      const targetCount = await getCount({
        rpcUrl: `http://localhost:8547/${threadId}`,
        address: solverAccount.address,
      })
      expect(targetCount).toEqual(1n)
    },
    20000,
  )

  it.concurrent('should not fill if claim fails', async () => {
    const threadId = getThreadId()

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
      data: '0x69696969',
    }
    bundle.targetFillPayload.chainId = 2
    bundle.targetFillPayload.to = RHINESTONE_SPOKEPOOL_ADDRESS
    bundle.targetFillPayload.data = '0xd09de08a'

    await processBundle(bundle, mockGetRPRUrl(threadId))

    const sourceCount = await getCount({
      rpcUrl: `http://localhost:8545/${threadId}`,
      address: solverAccount.address,
    })
    expect(sourceCount).toEqual(0n)

    const targetCount = await getCount({
      rpcUrl: `http://localhost:8546/${threadId}`,
      address: solverAccount.address,
    })
    expect(targetCount).toEqual(0n)
  })

  it.concurrent('should not fill if one of many claims fails', async () => {
    const threadId = getThreadId()

    await setupChain({
      rpcUrl: `http://localhost:8545/${threadId}`,
      solverAddress: solverAccount.address,
    })
    await setupChain({
      rpcUrl: `http://localhost:8546/${threadId}`,
      solverAddress: solverAccount.address,
    })
    await setupChain({
      rpcUrl: `http://localhost:8547/${threadId}`,
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
      data: '0x69696969',
    }

    bundle.targetFillPayload.chainId = 3
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
    expect(secondSourceCount).toEqual(0n)

    const targetCount = await getCount({
      rpcUrl: `http://localhost:8547/${threadId}`,
      address: solverAccount.address,
    })
    expect(targetCount).toEqual(0n)
  })
})
