import { Hex, getContract } from 'viem'
import { rhinestoneRelayerAbi } from '../constants/abi'
import { getWalletClient } from './getClients'

export function getRelayer(chainId: number) {
  const walletClient = getRelayerWallet(chainId)

  const RELAYER = getContract({
    abi: rhinestoneRelayerAbi,
    address: walletClient.account.address,
    client: walletClient,
  })

  return RELAYER
}

export function getRelayerWallet(chainId: number) {
  return getWalletClient(
    chainId,
    process.env.SOLVER_PRIVATE_KEY! as Hex,
  )
}
