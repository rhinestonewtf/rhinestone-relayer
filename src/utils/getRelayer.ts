import { Hex, getContract } from 'viem'
import { rhinestoneRelayerAbi } from '../constants/abi'
import { RELAYER_ADDRESS } from '../constants/constants'
import { getWalletClient } from './getClients'

export function getRelayer(chainId: number) {
  const walletClient = getWalletClient(
    chainId,
    process.env.SOLVER_PRIVATE_KEY! as Hex,
  )

  const RELAYER = getContract({
    abi: rhinestoneRelayerAbi,
    address: RELAYER_ADDRESS,
    client: walletClient,
  })

  return RELAYER
}
