import { getContract, Hex } from 'viem'
import { getPublicClient, getWalletClient } from './getClients'
import { wethAbi } from '../constants/abi'
import { getTokenAddress } from '@rhinestone/orchestrator-sdk'

function getWETH(chainId: number) {
  const walletClient = getWalletClient(
    chainId,
    process.env.SOLVER_PRIVATE_KEY! as Hex,
  )

  const WETH = getContract({
    abi: wethAbi,
    address: getTokenAddress('WETH', chainId),
    client: walletClient,
  })

  return WETH
}

async function wrapEth(amount: bigint, chainId: number) {
  const WETH = getWETH(chainId)

  const tx = await WETH.write.deposit({ value: amount })

  console.log(tx)

  await getPublicClient(chainId).waitForTransactionReceipt({ hash: tx })
}

async function unwrapEth(amount: bigint, chainId: number) {
  const WETH = getWETH(chainId)

  const tx = await WETH.write.withdraw([amount])

  console.log(tx)

  await getPublicClient(chainId).waitForTransactionReceipt({ hash: tx })
}
