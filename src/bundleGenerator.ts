import {
  Execution,
  getEmptyUserOp,
  getOrchestrator,
  getTokenAddress,
  MetaIntent,
} from '@rhinestone/orchestrator-sdk'
import { encodeFunctionData, erc20Abi, Hex } from 'viem'
import { postMetaIntentWithOwnableValidator } from '../test/safe7579Signature'

require('dotenv').config()

const orchestrator = getOrchestrator(process.env.ORCHESTRATOR_API_KEY!)

export const generateBundle = async () => {
  const userId = 'd6f64241-a62c-4542-bb23-e78d7e1e0cd6'
  const accountAddress = '0x9EB7504B7546b1B66e177B364A3566eC10132A40'

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
    targetExecutions: [execution],
    userOp: getEmptyUserOp(),
  }

  const bundleId = await postMetaIntentWithOwnableValidator(
    metaIntent,
    userId,
    process.env.BUNDLE_GENERATOR_PRIVATE_KEY! as Hex,
    orchestrator,
  )

  console.log(bundleId)

  await new Promise((resolve) => setTimeout(resolve, 5000))
  const bundleStatus = await orchestrator.getBundleStatus(userId, bundleId)

  console.log(bundleStatus)
}
