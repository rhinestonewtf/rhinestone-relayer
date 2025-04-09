import { getContract, Hex } from 'viem'
import { getPublicClient, getWalletClient } from './getClients'
import { wethAbi } from '../constants/abi'
import { getTokenAddress } from '@rhinestone/orchestrator-sdk'

function relayerWallet(chainId: number) {
  return getWalletClient(chainId, process.env.SOLVER_PRIVATE_KEY! as Hex)
}

function getWETH(chainId: number) {
  const WETH = getContract({
    abi: wethAbi,
    address: getTokenAddress('WETH', chainId),
    client: relayerWallet(chainId),
  })

  return WETH
}

async function wrapEth(amount: bigint, chainId: number) {
  const WETH = getWETH(chainId)

  const tx = await WETH.write.deposit({
    value: amount,
    chain: undefined,
  })

  console.log(tx)

  await getPublicClient(chainId).waitForTransactionReceipt({ hash: tx })
}

async function unwrapWeth(amount: bigint, chainId: number) {
  const WETH = getWETH(chainId)

  const tx = await WETH.write.withdraw([amount], {
    chain: undefined,
  })

  console.log(tx)

  await getPublicClient(chainId).waitForTransactionReceipt({ hash: tx })
}

async function unwrapAllWeth(chainId: number) {
  const WETH = getWETH(chainId)

  const balance = await WETH.read.balanceOf([
    relayerWallet(chainId).account.address,
  ])

  await unwrapWeth(balance, chainId)
}

async function getWETHBalance(chainId: number) {
  const WETH = getWETH(chainId)

  const balance = await WETH.read.balanceOf([
    relayerWallet(chainId).account.address,
  ])

  return balance
}

unwrapAllWeth(8453)
