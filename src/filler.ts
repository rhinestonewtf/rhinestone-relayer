import { ContractFunctionExecutionError, encodeFunctionData, Hex } from 'viem'

import { OWNER_ADDRESS, REPAYMENT_CHAIN_ID } from './constants/constants'
import { logError, logMessage } from './utils/logger'
import { checkBundleInventory } from './utils/inventoryNotifs'
import { claimBundle } from './claimer'
import { getWalletClient } from './utils/getClients'
import { updateTargetFillPayload } from '@rhinestone/orchestrator-sdk'

export async function fillBundle(bundle: any) {
  // const validatedBundle: BundleEvent = await validateBundle(bundle)
  // NOTE: This should not be added for production fillers.
  // The rhinestone relayer skips filling test bundles, so that integrating fillers can test using these.
  if (bundle.acrossDepositEvents[0].outputAmount == '3') {
    logMessage('Skipping fill for bundle: ' + String(bundle.bundleId))
    return
  }

  logMessage(
    '\n\n ==================================================================================================================== \n\n FILLING bundleId : ' +
      String(bundle.bundleId) +
      '\n\n ==================================================================================================================== \n\n',
  )
  // const updatedPayload = updateTargetFillPayload(
  //   {
  //     chainId: bundle.targetFillPayload.chainId,
  //     to: bundle.targetFillPayload.to,
  //     value: BigInt(bundle.targetFillPayload.value),
  //     data: bundle.targetFillPayload.data,
  //   },
  //   // ['0x000000000000000000000000000000000000dEaD'],
  //   [OWNER_ADDRESS],
  //   [10],
  // )

  const updatedPayload = {
    chainId: bundle.targetFillPayload.chainId,
    to: bundle.targetFillPayload.to,
    value: BigInt(bundle.targetFillPayload.value),
    data: bundle.targetFillPayload.data,
  }

  try {
    const walletClient = getWalletClient(
      bundle.targetFillPayload.chainId,
      process.env.SOLVER_PRIVATE_KEY! as Hex,
    )

    if (
      Number(updatedPayload.chainId) === 8453 ||
      Number(updatedPayload.chainId) === 1 ||
      Number(updatedPayload.chainId) === 137 ||
      Number(updatedPayload.chainId) === 42161 ||
      Number(updatedPayload.chainId) === 10
    ) {
      // Wait for 20 seconds before proceeding
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    // checkBundleInventory(bundle)
    // console.log(bundle)

    // console.log('Filling bundle with payload:', updatedPayload)
    const fillTx = await walletClient.sendTransaction({
      to: updatedPayload.to,
      value: updatedPayload.value,
      data: updatedPayload.data,
      chain: walletClient.chain,
      // TODO: There's got to be a better way.
      nonce: await walletClient.getTransactionCount({
        address: OWNER_ADDRESS,
      }),
    })

    logMessage('🚢 I AM FILLING A BUNDLE FOR THE PROD ORCH')

    logMessage(
      '🟢 Successfully filled bundle with tx hash: ' +
        fillTx +
        ' on chain: ' +
        walletClient.chain,
    )

    walletClient.waitForTransactionReceipt({ hash: fillTx })

    claimBundle(bundle)
  } catch (e) {
    const error = e as ContractFunctionExecutionError

    const errorMessage = `🔴 Failed to fill bundle. \n\n Error: ${error.shortMessage} \n\n Sender: ${error.sender} \n\n To: ${error.contractAddress} \n\n Bundle: ${JSON.stringify(bundle)} \n\n Encoded Function Data: ${updatedPayload.data}`
    await logError(errorMessage)
  }
}
