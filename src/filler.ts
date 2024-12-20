import {
  Address,
  ContractFunctionExecutionError,
  encodeFunctionData,
  erc20Abi,
  getContract,
  Hex,
  WriteContractErrorType,
  zeroAddress,
} from 'viem'

import { rhinestoneRelayerAbi, spokepoolAbi } from './constants/abi'

import { REPAYMENT_CHAIN_ID } from './constants/constants'
import { getRelayer } from './utils/getRelayer'
import { formatDepositEvent } from './utils/formatDepositEvent'

require('dotenv').config()

export async function fillBundle(bundle: any) {
  // NOTE: This should not be added for production fillers.
  // The rhinestone relayer skips filling test bundles, so that integrating fillers can test using these.
  // if (bundle.executionDepositEvent.outputAmount == '2') {
  //   console.log('Skipping fill for bundle:', bundle.bundleId)
  //   return
  // }
  console.log('Filling bundleId :', bundle.bundleId)

  const RELAYER = getRelayer(
    Number(bundle.executionDepositEvent.destinationChainId),
  )

  const standardDepositEvents = [
    ...bundle.standardDepositEvents.map((depositEvent: any) =>
      formatDepositEvent(depositEvent),
    ),
  ]

  try {
    const tx = await RELAYER.write.fillBundle([
      formatDepositEvent(bundle.executionDepositEvent),
      standardDepositEvents,
      BigInt(REPAYMENT_CHAIN_ID),
    ])

    console.log('🟢 Successfully filled bundle with tx hash: ', tx)
  } catch (e) {
    const error = e as ContractFunctionExecutionError
    const encodedFunctionData = encodeFunctionData({
      abi: rhinestoneRelayerAbi,
      functionName: 'fillBundle',
      args: [
        formatDepositEvent(bundle.executionDepositEvent),
        standardDepositEvents,
        BigInt(REPAYMENT_CHAIN_ID),
      ],
    })

    console.error('🔴 Failed to fill bundle.')
    console.error('Error:', error.shortMessage)
    console.log('sender: ', error.sender)
    console.log('to: ', error.contractAddress)

    console.error('Encoded Function Data:', encodedFunctionData)
  }
}
