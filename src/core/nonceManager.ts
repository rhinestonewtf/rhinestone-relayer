import { Address } from 'viem'
import { addSpanAttributes, CreateSpan } from '../opentelemetry/api'
import { getPublicClient } from '../helpers/getClients'

class AggregatedNonceManager {
  private static instance: AggregatedNonceManager
  chainAccountNonces: Map<number, Map<Address, NonceManager>> = new Map()

  constructor() {}

  public static getInstance(): AggregatedNonceManager {
    if (!AggregatedNonceManager.instance) {
      AggregatedNonceManager.instance = new AggregatedNonceManager()
    }
    return AggregatedNonceManager.instance
  }

  getAccountNonces(chainId: number): Map<Address, NonceManager> {
    let res = this.chainAccountNonces.get(chainId)
    if (!res) {
      res = new Map()
      this.chainAccountNonces.set(chainId, res)
    }

    return res
  }

  getNonceManager(
    chainId: number,
    account: Address,
    getRPCUrl: (chainId: number) => string,
  ): NonceManager {
    let addressNonces = this.getAccountNonces(chainId)
    let nonceManager = addressNonces.get(account)
    if (!nonceManager) {
      nonceManager = new NonceManager(chainId, account, getRPCUrl)
      addressNonces.set(account, nonceManager)
    }
    return nonceManager
  }

  @CreateSpan('getNonce')
  async getNonce({
    chainId,
    account,
    getRPCUrl,
  }: {
    chainId: number
    account: Address
    getRPCUrl: (chainId: number) => string
  }): Promise<number> {
    addSpanAttributes({
      chainId: chainId.toString(),
      account: account.toString(),
    })
    let nonceManager = this.getNonceManager(chainId, account, getRPCUrl)
    return await nonceManager.getNonce()
  }
}

// this nonce manager IS NOT thread-safe
class NonceManager {
  private chainId: number
  private account: Address
  private getRPCUrl: (chainId: number) => string
  private nonce?: number
  private initializing?: Promise<void>

  constructor(
    chainId: number,
    account: Address,
    getRPCUrl: (chainId: number) => string,
  ) {
    this.chainId = chainId
    this.account = account
    this.getRPCUrl = getRPCUrl
  }

  async getNonce() {
    if (this.nonce === undefined) {
      if (!this.initializing) {
        this.initializing = (async () => {
          let client = getPublicClient(this.chainId, this.getRPCUrl)
          this.nonce = await client.getTransactionCount({
            address: this.account,
          })
          this.initializing = undefined // set to undefined to cleanup some memory, but not strictly neeeded
        })()
      }
      await this.initializing
    }
    return this.nonce!++ // we are sure nonce is here at this point
  }
}

export const nonceManager = AggregatedNonceManager.getInstance()
