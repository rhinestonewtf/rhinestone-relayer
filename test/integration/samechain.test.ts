import { describe, beforeAll, it, assert } from 'vitest'
import { createServer } from 'prool'
import { anvil } from 'prool/instances'
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

const executionServer = createServer({
  instance: () =>
    anvil({
      // forkUrl: 'https://sepolia.base.org',
      // chainId: 31337,
    }),
  port: 8545,
})

describe('samechain', () => {
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

  it('should be able to set code on the same chain', async () => {})
})
