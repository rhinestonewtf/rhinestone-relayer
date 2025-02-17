import { ContractFunctionExecutionError, encodeFunctionData, Hex } from 'viem'

import { rhinestoneRelayerAbi } from './constants/abi'

import { OWNER_ADDRESS, REPAYMENT_CHAIN_ID } from './constants/constants'
import { logError, logMessage } from './utils/logger'
import { checkBundleInventory } from './utils/inventoryNotifs'
import { claimBundle } from './claimer'
import { getWalletClient } from './utils/getClients'

export async function fillBundle(bundle: any) {
  // const validatedBundle: BundleEvent = await validateBundle(bundle)
  // NOTE: This should not be added for production fillers.
  // The rhinestone relayer skips filling test bundles, so that integrating fillers can test using these.
  if (bundle.executionDepositEvent.outputAmount == '3') {
    logMessage('Skipping fill for bundle: ' + String(bundle.bundleId))
    return
  }

  logMessage(
    '\n\n ==================================================================================================================== \n\n FILLING bundleId : ' +
      String(bundle.bundleId) +
      '\n\n ==================================================================================================================== \n\n',
  )

  try {
    const walletClient = getWalletClient(
      bundle.fillPayload,
      process.env.SOLVER_PRIVATE_KEY! as Hex,
    )

    checkBundleInventory(bundle)
    const fillTx = await walletClient.sendTransaction({
      to: bundle.fillPayload.to,
      value: bundle.fillPayload.value,
      data: bundle.fillPayload.data,
      // TODO: There's got to be a better way.
      nonce: await walletClient.getTransactionCount({
        address: OWNER_ADDRESS,
      }),
    })

    logMessage('🟢 Successfully filled bundle with tx hash: ' + fillTx)

    walletClient.waitForTransactionReceipt({ hash: fillTx })

    claimBundle(bundle)
  } catch (e) {
    const error = e as ContractFunctionExecutionError

    const errorMessage = `🔴 Failed to fill bundle. \n\n Error: ${error.shortMessage} \n\n Sender: ${error.sender} \n\n To: ${error.contractAddress} \n\n Bundle: ${JSON.stringify(bundle)} \n\n Encoded Function Data: ${bundle.fillPayload.data}`
    await logError(errorMessage)
  }
}
