import { describe, beforeAll, it, assert, vi, afterEach, expect } from 'vitest'
import { createServer } from 'prool'
import { anvil } from 'prool/instances'
import {
  createPublicClient,
  createTestClient,
  Hex,
  http,
  parseAbi,
  parseEther,
  zeroAddress,
} from 'viem'
import { foundry } from 'viem/chains'
import { fillBundle } from '../../src/filler'
import { getEmptyBundleEvent } from '../common/utils'
import { privateKeyToAccount } from 'viem/accounts'
import { getCount, mockGetRPRUrl, setupChain } from './common/utils'
import { RHINESTONE_SPOKEPOOL_ADDRESS } from '../../src/utils/constants'

// this should be fine since we just do one tx per chain
vi.mock('../../src/nonceManager', () => {
  return {
    nonceManager: {
      getNonce: vi.fn().mockResolvedValue(0),
    },
  }
})

const executionServer1 = createServer({
  instance: () =>
    anvil({
      chainId: 1,
    }),
  port: 8545,
})

const executionServer2 = createServer({
  instance: () =>
    anvil({
      chainId: 2,
    }),
  port: 8546,
})

const executionServer3 = createServer({
  instance: () =>
    anvil({
      chainId: 3,
    }),
  port: 8547,
})

const solverAccount = privateKeyToAccount(
  process.env.SOLVER_PRIVATE_KEY! as Hex,
)

describe('multi chain', () => {
  beforeAll(async () => {
    await executionServer1.start()
    await executionServer2.start()
    await executionServer3.start()
  })

  it.concurrent('should claim first and then fill', async () => {
    const threadId = 1

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

    await fillBundle(bundle, mockGetRPRUrl(threadId))

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

  it.concurrent('should claim on multiple chains and then fill', async () => {
    const threadId = 2

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

    await fillBundle(bundle, mockGetRPRUrl(threadId))

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
  })

  it.concurrent('should not fill if claim fails', async () => {
    const threadId = 3

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

    await fillBundle(bundle, mockGetRPRUrl(threadId))

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
    const threadId = 4

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

    await fillBundle(bundle, mockGetRPRUrl(threadId))

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
