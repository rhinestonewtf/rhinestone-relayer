import {
  createPublicClient,
  createWalletClient,
  Hex,
  http,
  nonceManager,
  publicActions,
  extractChain,
} from 'viem'

import { privateKeyToAccount } from 'viem/accounts'
import { loadConfig } from './config'
import { getRPCUrl } from './chains'

export const getPublicClient = (chainId: number) => {
  console.log('hi')
  console.log(getRPCUrl(chainId))
  return createPublicClient({
    transport: http(getRPCUrl(chainId)),
  })
}

export const getWalletClient = (chainId: number, privateKey: Hex) => {
  console.log('herro')
  console.log(getRPCUrl(chainId))

  return createWalletClient({
    account: privateKeyToAccount(privateKey, { nonceManager }),
    transport: http(getRPCUrl(chainId)),
  }).extend(publicActions)
}
