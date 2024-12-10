import {
  Execution,
  getOrchestrator,
  MetaIntent,
  PackedUserOperation,
} from '@rhinestone/orchestrator-sdk'
import { encodeFunctionData, erc20Abi, Hex } from 'viem'
import { baseUSDC } from './constants/registry'
import { zeroAddress, zeroHash } from 'viem'

require('dotenv').config()

const orchestrator = getOrchestrator(process.env.ORCHESTRATOR_API_KEY!)

export function getEmptyUserOp(): PackedUserOperation {
  return {
    sender: zeroAddress,
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    accountGasLimits: zeroHash,
    preVerificationGas: 0n,
    gasFees: zeroHash,
    paymasterAndData: '0x',
    signature: '0x',
  }
}

export const generateBundle = async () => {
  const userId = '157757fa-6952-4576-8858-49d9145987ee'
  const accountAddress = '0xFfF799094Ede20f26d06A6Ff9bFDca13AD260018'

  const execution: Execution = {
    target: baseUSDC,
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
        tokenAddress: baseUSDC,
        amount: 2n,
      },
    ],
    targetAccount: accountAddress,
    targetExecutions: [execution],
    userOp: getEmptyUserOp(),
  }

  const bundleId = (
    await orchestrator.postMetaIntentWithOwnableValidator(
      metaIntent,
      userId,
      process.env.BUNDLE_GENERATOR_PRIVATE_KEY! as Hex,
    )
  ).bundleId

  console.log(bundleId)

  await new Promise((resolve) => setTimeout(resolve, 5000))
  const bundleStatus = await orchestrator.getBundleStatus(userId, bundleId)

  console.log(bundleStatus)
}
