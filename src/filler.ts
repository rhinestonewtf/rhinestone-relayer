import {
  Address,
  encodeFunctionData,
  erc20Abi,
  getContract,
  Hex,
  zeroAddress,
} from 'viem'

import { spokepoolAbi } from './constants/abi'
import { getPublicClient, getWalletClient } from './utils/getClients'
import {
  getSpokePoolAddress,
  getTokenAddress,
} from '@rhinestone/orchestrator-sdk'
import { REPAYMENT_CHAIN_ID } from './constants/constants'

require('dotenv').config()

export async function approveFill(chainId: number) {
  const walletClient = getWalletClient(
    chainId,
    process.env.SOLVER_PRIVATE_KEY! as Hex,
  )

  const usdc = getContract({
    address: getTokenAddress('USDC', chainId),
    abi: erc20Abi,
    client: walletClient,
  })

  const tx = await usdc.write.approve(
    [
      getSpokePoolAddress(chainId),
      115792089237316195423570985008687907853269984665640564039457584007913129639935n,
    ],
    {},
  )

  console.log('Approval Tx Hash: ', tx)
}

export async function fillBundle(bundle: any) {
  const depositEvent = bundle.executionDepositEvent

  // NOTE: This should not be added for production fillers.
  // The rhinestone relayer skips feeling test bundles, so that integrating fillers can test using these.
  if (depositEvent.outputAmount == '2') {
    console.log('Skipping fill for bundle:', bundle.bundleId)
    return
  }
  console.log('Filling deposit event:', depositEvent)

  const chainId = Number(depositEvent.destinationChainId)

  const walletClient = getWalletClient(
    chainId,
    process.env.SOLVER_PRIVATE_KEY as Hex,
  )

  const publicClient = getPublicClient(chainId)

  const spokepool = getContract({
    address: getSpokePoolAddress(chainId),
    abi: spokepoolAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  })

  const data = encodeFunctionData({
    abi: spokepoolAbi,
    functionName: 'fillV3Relay',
    args: [
      {
        depositor: depositEvent.depositor as Address,
        recipient: depositEvent.recipient as Address,
        exclusiveRelayer: depositEvent.exclusiveRelayer as Address,
        inputToken: depositEvent.inputToken as Address,
        outputToken: depositEvent.outputToken as Address,
        inputAmount: BigInt(depositEvent.inputAmount),
        outputAmount: BigInt(depositEvent.outputAmount),
        originChainId: 42161n,
        depositId: BigInt(depositEvent.depositId),
        fillDeadline: depositEvent.fillDeadline,
        exclusivityDeadline: depositEvent.exclusivityDeadline,
        message: depositEvent.message as Hex,
      },
      REPAYMENT_CHAIN_ID, // repaymentChainId (Arbitrum)
    ],
  })

  console.log('Data: ', data)

  const tx = await spokepool.write.fillV3Relay(
    [
      {
        depositor: depositEvent.depositor as Address,
        recipient: depositEvent.recipient as Address,
        exclusiveRelayer: depositEvent.exclusiveRelayer as Address,
        inputToken: depositEvent.inputToken as Address,
        outputToken: depositEvent.outputToken as Address,
        inputAmount: BigInt(depositEvent.inputAmount),
        outputAmount: BigInt(depositEvent.outputAmount),
        originChainId: 42161n,
        depositId: BigInt(depositEvent.depositId),
        fillDeadline: depositEvent.fillDeadline,
        exclusivityDeadline: depositEvent.exclusivityDeadline,
        message: depositEvent.message as Hex,
      },
      REPAYMENT_CHAIN_ID, // repaymentChainId (Arbitrum)
    ],
    {},
  )

  console.log('Fill Tx Hash: ', tx)
  console.log('Successfully filled bundle')
}
