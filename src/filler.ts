import { ContractFunctionExecutionError, encodeFunctionData } from 'viem'

import { rhinestoneRelayerAbi } from './constants/abi'

import { REPAYMENT_CHAIN_ID } from './constants/constants'
import { getRelayer } from './utils/getRelayer'
import { formatDepositEvent } from './utils/formatDepositEvent'
import { logError, logMessage } from './utils/logger'
import { checkBundleInventory } from './utils/inventoryNotifs'
import { claimBundle } from './claimer'
import { getPublicClient } from './utils/getClients'

export async function fillBundle(bundle: any) {
  // const validatedBundle: BundleEvent = await validateBundle(bundle)
  // NOTE: This should not be added for production fillers.
  // The rhinestone relayer skips filling test bundles, so that integrating fillers can test using these.
  if (bundle.executionDepositEvent.outputAmount == '1') {
    logMessage('Skipping fill for bundle: ' + String(bundle.bundleId))
    return
  }

  logMessage(
    '\n\n ==================================================================================================================== \n\n FILLING bundleId : ' +
      String(bundle.bundleId) +
      '\n\n ==================================================================================================================== \n\n',
  )

  const RELAYER = getRelayer(
    Number(bundle.executionDepositEvent.destinationChainId),
  )

  const standardDepositEvents = [
    ...bundle.standardDepositEvents.map((depositEvent: any) =>
      formatDepositEvent(depositEvent),
    ),
  ]

  try {
    checkBundleInventory(bundle)
    const tx = await RELAYER.write.fillBundle(
      [
        formatDepositEvent(bundle.executionDepositEvent),
        standardDepositEvents,
        BigInt(REPAYMENT_CHAIN_ID),
      ],
      {},
    )
    logMessage('🟢 Successfully filled bundle with tx hash: ' + tx)

    await getPublicClient(
      bundle.executionDepositEvent.destinationChainId,
    ).waitForTransactionReceipt({ hash: tx })

    claimBundle(bundle)
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

    const errorMessage = `🔴 Failed to fill bundle. \n\n Error: ${error.shortMessage} \n\n Sender: ${error.sender} \n\n To: ${error.contractAddress} \n\n Bundle: ${JSON.stringify(bundle)} \n\n Encoded Function Data: ${encodedFunctionData}`
    await logError(errorMessage)
  }
}
