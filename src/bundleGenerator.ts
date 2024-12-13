import {
  Execution,
  getEmptyUserOp,
  getOrchestrator,
  getTokenAddress,
  MetaIntent,
} from '@rhinestone/orchestrator-sdk'
import { encodeFunctionData, erc20Abi, Hex } from 'viem'

require('dotenv').config()

const orchestrator = getOrchestrator(process.env.ORCHESTRATOR_API_KEY!)

export const generateBundle = async () => {
  const userId = '581379d0-2fdd-4ea3-9aab-b900f7ed3e30'
  const accountAddress = '0x7F1eA505b099BA673937a61A4c9B161c115c6E01'

  const execution: Execution = {
    target: getTokenAddress('USDC', 8453),
    value: 0n,
    callData: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: ['0xD1dcdD8e6Fe04c338aC3f76f7D7105bEcab74F77', 1n],
    }),
  }

  const metaIntent: MetaIntent = {
    targetChainId: 8453, // Base
    tokenTransfers: [
      {
        tokenAddress: getTokenAddress('USDC', 8453),
        amount: 2n,
      },
    ],
    targetAccount: accountAddress,
    targetExecutions: [],
    userOp: getEmptyUserOp(),
  }

  const bundleId = await orchestrator.postMetaIntentWithOwnableValidator(
    metaIntent,
    userId,
    process.env.BUNDLE_GENERATOR_PRIVATE_KEY! as Hex,
  )

  console.log(bundleId)

  await new Promise((resolve) => setTimeout(resolve, 5000))
  const bundleStatus = await orchestrator.getBundleStatus(userId, bundleId)

  console.log(bundleStatus)
}
