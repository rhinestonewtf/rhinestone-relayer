require('dotenv').config()

import {
  Execution,
  getOrchestrator,
  getTokenAddress,
  MetaIntent,
} from '@rhinestone/orchestrator-sdk'
import { encodeFunctionData, erc20Abi, Hex } from 'viem'
import { postMetaIntentWithOwnableValidator } from '../test/safe7579Signature'

const orchestrator = getOrchestrator(
  process.env.ORCHESTRATOR_API_KEY!,
  process.env.ORCHESTRATOR_URL,
)

export const generateBundle = async () => {
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
    accountAccessList: [
      { chainId: 42161, tokenAddress: getTokenAddress('USDC', 42161) },
    ],
  }

  const bundleId = await postMetaIntentWithOwnableValidator(
    metaIntent,
    accountAddress,
    process.env.BUNDLE_GENERATOR_PRIVATE_KEY! as Hex,
    orchestrator,
  )

  console.log('🔵 Bundle Generator Bundle ID: ', bundleId)
}
generateBundle()
