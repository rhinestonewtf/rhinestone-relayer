import {
  Address,
  ContractFunctionExecutionError,
  encodeFunctionData,
  Hex,
  zeroAddress,
} from 'viem'

import { OWNER_ADDRESS, REPAYMENT_CHAIN_ID } from './constants/constants'
import { logError, logMessage } from './utils/logger'
import { checkBundleInventory } from './utils/inventoryNotifs'
import { claimBundle } from './claimer'
import { getWalletClient } from './utils/getClients'
import {
  getOrchestrator,
  updateTargetFillPayload,
} from '@rhinestone/orchestrator-sdk'
import { nonceManager } from './nonceManager'

function isWhitelistedAddress(address: Address) {
  // Replace with clave provided address here
  if (
    address.toLowerCase() ===
      '0x8BBF760ca40215C630C54E7b1c91317DCCB5eE63'.toLowerCase() ||
    address.toLowerCase() ===
      '0x423A44964012825a5B54Bf19d32151C440765115'.toLowerCase()
  ) {
    return true
  }
  return false
}

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

    // if (
    //   Number(updatedPayload.chainId) === 1 ||
    //   Number(updatedPayload.chainId) === 10 ||
    //   Number(updatedPayload.chainId) === 137 ||
    //   Number(updatedPayload.chainId) === 8453 ||
    //   Number(updatedPayload.chainId) === 42161
    // ) {
    //   console.log('Waiting for 12 seconds')
    
    //   if (
    //     !isWhitelistedAddress(
    //       bundle.acrossDepositEvents[0].recipient as Address,
    //     )
    //   ) {
    //     // Wait for 12 seconds before proceeding
    //     await new Promise((resolve) => setTimeout(resolve, 12_000))
    
    //     // Check the bundle is still valid post delay
    //     const bundleStatus = await getOrchestrator(
    //       process.env.ORCHESTRATOR_API_KEY!,
    //       process.env.ORCHESTRATOR_URL,
    //     ).getBundleStatus(bundle.bundleId)
    //     if (
    //       bundleStatus.fillTransactionHash !== undefined ||
    //       bundleStatus.status === 'EXPIRED' ||
    //       bundleStatus.status === 'FAILED'
    //     ) {
    //       return
    //     }
    //   }
    // }

    // checkBundleInventory(bundle)
    // console.log(bundle)

    const nonce = nonceManager.getNonce({
      chainId: bundle.targetFillPayload.chainId,
    })

    // console.log('Filling bundle with payload:', updatedPayload)
    let fillTx
    try {
      fillTx = await walletClient.sendTransaction({
        to: updatedPayload.to,
        value: updatedPayload.value,
        data: updatedPayload.data,
        chain: walletClient.chain,
        // TODO: There's got to be a better way.
        // nonce,
        nonce: await walletClient.getTransactionCount({
          address: OWNER_ADDRESS,
        }),
      })
    } catch (txError) {
      console.log('txError', txError)
      // TODO: Synchronize nonce at this point, either by decrementing the nonce or by getting the latest nonce from the chain
      return
    }

    logMessage('🚢 I AM FILLING A BUNDLE FOR THE PROD ORCH')

    logMessage(
      '🟢 Successfully filled bundle with tx hash: ' +
        fillTx +
        ' on chain: ' +
        bundle.targetFillPayload.chainId +
        ' with nonce: ' +
        nonce,
    )

    walletClient.waitForTransactionReceipt({ hash: fillTx })

    claimBundle(bundle)
  } catch (e) {
    const error = e as ContractFunctionExecutionError

    const errorMessage = `🔴 Failed to fill bundle. \n\n Error: ${error.shortMessage} \n\n Sender: ${error.sender} \n\n To: ${error.contractAddress} \n\n Bundle: ${JSON.stringify(bundle)} \n\n Encoded Function Data: ${updatedPayload.data}`
    await logError(errorMessage)
  }
}
