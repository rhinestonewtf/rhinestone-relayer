import { Hex, getContract } from 'viem'
import { originModuleAbi } from '../constants/abi'
import { getWalletClient } from './getClients'
import { getOriginModuleAddress } from '@rhinestone/orchestrator-sdk'

export function getOriginModule(chainId: number, privateKey: Hex) {
  const walletClient = getWalletClient(chainId, privateKey)

  const ORIGIN_MODULE = getContract({
    address: getOriginModuleAddress(chainId),
    abi: originModuleAbi,
    client: {
      wallet: walletClient,
    },
  })

  return ORIGIN_MODULE
}
