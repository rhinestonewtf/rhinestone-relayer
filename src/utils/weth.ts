import { getContract, Hex } from 'viem'
import { getPublicClient, getWalletClient } from './getClients'
import { wethAbi } from '../constants/abi'
import { getTokenAddress } from '@rhinestone/orchestrator-sdk'
import { OWNER_ADDRESS } from '../constants/constants'

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

async function unwrapWeth(amount: bigint, chainId: number) {
  const WETH = getWETH(chainId)

  const tx = await WETH.write.withdraw([amount])

  console.log(tx)

  await getPublicClient(chainId).waitForTransactionReceipt({ hash: tx })
}

async function unwrapAllWeth(chainId: number) {
  const WETH = getWETH(chainId)

  const balance = await WETH.read.balanceOf([OWNER_ADDRESS])

  await unwrapWeth(balance, chainId)
}

async function getWETHBalance(chainId: number) {
  const WETH = getWETH(chainId)

  const balance = await WETH.read.balanceOf([OWNER_ADDRESS])

  return balance
}

unwrapAllWeth(8453)
