import {
  createPublicClient,
  createWalletClient,
  Hex,
  http,
  publicActions,
} from 'viem'

import { privateKeyToAccount } from 'viem/accounts'

export const getPublicClient = (
  chainId: number,
  getRPCUrl: (chainId: number) => string,
) => {
  return createPublicClient({
    transport: http(getRPCUrl(chainId)),
  })
}

export const getWalletClient = (
  chainId: number,
  privateKey: Hex,
  getRPCUrl: (chainId: number) => string,
) => {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    transport: http(getRPCUrl(chainId)),
  }).extend(publicActions)
}
