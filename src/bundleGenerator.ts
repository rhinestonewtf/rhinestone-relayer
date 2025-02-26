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
  const accountAddress = '0x579d5631f76126991c00fb8fe5467fa9d49e5f6a'

  const execution: Execution = {
    target: getTokenAddress('USDC', 8453),
    value: 0n,
    callData: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: ['0xD1dcdD8e6Fe04c338aC3f76f7D7105bEcab74F77', 10n],
    }),
  }

  const metaIntent: MetaIntent = {
    targetChainId: 8453, // Base
    tokenTransfers: [
      {
        tokenAddress: getTokenAddress('USDC', 8453),
        amount: 10n,
      },
    ],
    targetAccount: accountAddress,
    targetExecutions: [execution],
    accountAccessList: [
      { chainId: 42161, tokenAddress: getTokenAddress('USDC', 42161) },
    ],
  }

  const bundleResult = await postMetaIntentWithOwnableValidator(
    metaIntent,
    accountAddress,
    process.env.BUNDLE_GENERATOR_PRIVATE_KEY! as Hex,
    orchestrator,
  )

  for (const { bundleId, status} of bundleResult) {
    console.log(`🔵 Bundle Generator Bundle ID: ${bundleId} Status: ${status}`)
  }
}
generateBundle()
