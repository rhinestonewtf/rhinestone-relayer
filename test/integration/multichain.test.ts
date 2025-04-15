import { describe, beforeAll, it, assert, vi, afterEach, expect } from 'vitest'
import { createServer } from 'prool'
import { anvil } from 'prool/instances'
import { createTestClient, Hex, http, parseEther } from 'viem'
import { foundry } from 'viem/chains'
import { fillBundle } from '../../src/filler'
import { getEmptyBundleEvent } from '../common/utils'
import * as chains from '../../src/utils/chains'
import { privateKeyToAccount } from 'viem/accounts'

vi.mock('../../src/utils/chains')

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

  // todo: do we need this?
  // afterEach(() => {
  //   vi.restoreAllMocks()
  // })

  it.concurrent('should claim first and then fill', async () => {
    const bundle = getEmptyBundleEvent()

    const testClient = createTestClient({
      chain: foundry,
      mode: 'anvil',
      transport: http('http://localhost:8545/1'),
    })

    await testClient.setCode({
      address: '0x000000000060f6e853447881951574CDd0663530',
      bytecode: '0x',
    })

    await testClient.setBalance({
      address: solverAccount.address,
      value: parseEther('10'),
    })

    const testClient2 = createTestClient({
      chain: foundry,
      mode: 'anvil',
      transport: http('http://localhost:8546/1'),
    })

    await testClient2.setCode({
      address: '0x000000000060f6e853447881951574CDd0663530',
      bytecode: '0x',
    })

    await testClient2.setBalance({
      address: solverAccount.address,
      value: parseEther('10'),
    })

    vi.mocked(chains.getRPCUrl).mockImplementation((chainId: number) => {
      switch (chainId) {
        case 1:
          return 'http://localhost:8545/1'
        case 2:
          return 'http://localhost:8546/1'
        default:
          return 'http://localhost:8545/1'
      }
    })

    bundle.acrossDepositEvents[0].originClaimPayload = {
      ...bundle.acrossDepositEvents[0].originClaimPayload,
      chainId: 1,
      to: '0x000000000060f6e853447881951574CDd0663530',
    }
    bundle.targetFillPayload.chainId = 2

    await fillBundle(bundle)
  })

  it.concurrent('should claim on multiple chains and then fill', async () => {})

  it.concurrent('should not fill if claim fails', async () => {})

  it.concurrent('should not fill if one of many claims fails', async () => {})
})
