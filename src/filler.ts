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
      '0xbe75079fd259a82054cAAB2CE007cd0c20b177a8'.toLowerCase() ||
    address.toLowerCase() ===
      '0x41ee28EE05341E7fdDdc8d433BA66054Cd302cA1'.toLowerCase() ||
    address.toLowerCase() ===
      '0x3C3116d2220DD02dbF9c993D57794f6a44CEF9eF'.toLowerCase()
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

    if (
      Number(updatedPayload.chainId) === 1 ||
      Number(updatedPayload.chainId) === 10 ||
      Number(updatedPayload.chainId) === 137 ||
      Number(updatedPayload.chainId) === 8453 ||
      Number(updatedPayload.chainId) === 42161
    ) {
      if (
        isWhitelistedAddress(bundle.acrossDepositEvents[0].recipient as Address)
      ) {
        console.log('waiting for 20 seconds')
        // Wait for 20 seconds before proceeding
        await new Promise((resolve) => setTimeout(resolve, 20_000))

        // Check the bundle is still valid post delay
        const bundleStatus = await getOrchestrator(
          process.env.ORCHESTRATOR_API_KEY!,
          process.env.ORCHESTRATOR_URL,
        ).getBundleStatus(bundle.bundleId)
        if (
          bundleStatus.fillTransactionHash !== undefined ||
          bundleStatus.status === 'EXPIRED' ||
          bundleStatus.status === 'FAILED'
        ) {
          return
        }
      }
    }

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
