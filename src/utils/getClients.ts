import { getChainConfig } from '@rhinestone/orchestrator-sdk'
import {
  createPublicClient,
  createWalletClient,
  Hex,
  http,
  publicActions,
} from 'viem'

import { privateKeyToAccount } from 'viem/accounts'
// import { nonceManager } from 'viem'

export const getPublicClient = (chainId: number) => {
  const chainConfig = getChainConfig(chainId)

  return createPublicClient({
    transport: http(chainConfig.rpcUrl),
    chain: chainConfig.viemChain,
  })
}

export const getWalletClient = (chainId: number, privateKey: Hex) => {
  const chainConfig = getChainConfig(chainId)

  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    transport: http(chainConfig.rpcUrl),
    chain: chainConfig.viemChain,
  }).extend(publicActions)
}
