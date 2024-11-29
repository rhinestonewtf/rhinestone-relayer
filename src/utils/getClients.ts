import {
  createPublicClient,
  createWalletClient,
  Hex,
  http,
  publicActions,
} from 'viem'
import { getNetworkDetails } from '../constants/registry'
import { privateKeyToAccount } from 'viem/accounts'

export const getPublicClient = (chainId: number) => {
  const chainConfig = getNetworkDetails(chainId)

  return createPublicClient({
    transport: http(chainConfig.rpcUrl),
    chain: chainConfig.viemChain,
  })
}

export const getWalletClient = (chainId: number, privateKey: Hex) => {
  const chainConfig = getNetworkDetails(chainId)

  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    transport: http(chainConfig.rpcUrl),
    chain: chainConfig.viemChain,
  }).extend(publicActions)
}
