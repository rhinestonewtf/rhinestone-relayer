import { describe, beforeAll, it, assert, vi, afterEach, expect } from 'vitest'
import { createServer } from 'prool'
import { anvil } from 'prool/instances'
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'
import { fillBundle } from '../../src/filler'
import { getEmptyBundleEvent } from '../common/utils'
import * as chains from '../../src/utils/chains'

vi.mock('../../src/utils/chains')

const executionServer = createServer({
  instance: () =>
    anvil({
      // forkUrl: 'https://sepolia.base.org',
      // chainId: 31337,
    }),
  port: 8545,
})

describe('multi chain', () => {
  beforeAll(async () => {
    await executionServer.start()

    const testClient = createTestClient({
      chain: foundry,
      mode: 'anvil',
      transport: http('http://localhost:8545/1'),
    })

    await testClient.setCode({
      address: '0x000000000060f6e853447881951574CDd0663530',
      bytecode: '0x',
    })
  })

  // todo: do we need this?
  // afterEach(() => {
  //   vi.restoreAllMocks()
  // })

  it.concurrent('should claim first and then fill', async () => {
    const bundle = getEmptyBundleEvent()

    vi.mocked(chains.getRPCUrl).mockImplementation((chainId: number) => {
      console.log(chainId)
      switch (chainId) {
        case 1:
          return 'http://localhost:8545/1'
        case 2:
          return 'http://localhost:8545/2'
        default:
          return 'http://localhost:8545/1'
      }
    })

    bundle.acrossDepositEvents[0].originClaimPayload.chainId = 1
    bundle.targetFillPayload.chainId = 2

    await fillBundle(bundle)
  })

  it.concurrent('should claim on multiple chains and then fill', async () => {})

  it.concurrent('should not fill if claim fails', async () => {})

  it.concurrent('should not fill if one of many claims fails', async () => {})
})
