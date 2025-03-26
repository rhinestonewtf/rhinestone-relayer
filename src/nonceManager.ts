import { Account, Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { getPublicClient } from './utils/getClients'

export type NonceManagerType = {
  nonces: Map<number, number>
  constructor: () => void
  initialize: (params: { chainId: number }) => Promise<void>
  isInitialized: (params: { chainId: number }) => boolean
  getNonce: (params: { chainId: number }) => number
}

export class NonceManager {
  private static instance: NonceManager
  nonces: Map<number, number> = new Map()

  constructor() {}

  public static getInstance(): NonceManager {
    if (!NonceManager.instance) {
      NonceManager.instance = new NonceManager()
    }
    return NonceManager.instance
  }

  async initialize({ chainId }: { chainId: number }) {
    if (this.nonces.has(chainId)) {
      return
    }

    // NOTE: Nonce must be set initially in order to call syncNonce
    this.nonces.set(chainId, 0)
    await this.syncNonce({ chainId })
  }

  isInitialized({ chainId }: { chainId: number }) {
    return this.nonces.has(chainId)
  }

  async syncNonce({ chainId }: { chainId: number }) {
    if (this.nonces.has(chainId)) {
      return
    }

    const publicClient = getPublicClient(chainId)

    const solver: Account = privateKeyToAccount(
      process.env.SOLVER_PRIVATE_KEY! as Hex,
    )

    const nonce = await publicClient.getTransactionCount({
      address: solver.address,
    })

    this.nonces.set(chainId, nonce)
  }

  getNonce({ chainId }: { chainId: number }) {
    const latest = this.nonces.get(chainId)
    if (latest === undefined) {
      throw new Error('NonceManager not initialized for chain')
    }

    this.nonces.set(chainId, latest + 1)
    return latest
  }
}

export const nonceManager = NonceManager.getInstance()
