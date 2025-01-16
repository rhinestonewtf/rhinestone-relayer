require('dotenv').config()

import {
  Execution,
  getEmptyUserOp,
  getOrchestrator,
  getTokenAddress,
  MetaIntent,
} from '@rhinestone/orchestrator-sdk'
import { encodeFunctionData, erc20Abi, Hex } from 'viem'
import { postMetaIntentWithOwnableValidator } from '../test/safe7579Signature'

const orchestrator = getOrchestrator(process.env.ORCHESTRATOR_API_KEY!)

export const generateBundle = async () => {
  const userId = '320660fd-6805-4e1a-bbd0-c86575b5715e'
  const accountAddress = '0xf781C5Cc66dbEacBc0Db3F7C7F9bDdC0F51b9499'

  const execution: Execution = {
    target: getTokenAddress('USDC', 8453),
    value: 0n,
    callData: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: ['0x7E287A503f0D19b7899C15e80EB18C0Ee55fFd12', 1n],
    }),
  }

  const metaIntent: MetaIntent = {
    targetChainId: 8453, // Base
    tokenTransfers: [
      {
        tokenAddress: getTokenAddress('USDC', 8453),
        amount: 1n,
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

  console.log('🔵 Bundle Generator Bundle ID: ', bundleId)
}
