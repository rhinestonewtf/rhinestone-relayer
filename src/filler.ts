import { Address, ContractFunctionExecutionError, Hex } from 'viem'

import { logError, logMessage } from './utils/logger'
import { claimBundle } from './claimer'
import { getWalletClient } from './utils/getClients'
import { nonceManager } from './nonceManager'
import { privateKeyToAccount } from 'viem/accounts'
import { getOrchestrator } from '@rhinestone/orchestrator-sdk'
import { withSpan } from './opentelemetry/api'
import {
  addChainId,
  addFillStatus,
  addTransactionId,
  BundleActionStatus,
  recordError,
} from './tracing'
import { addChain } from 'viem/_types/actions/wallet/addChain'
import { recordBundleFill } from './metrics'

function isWhitelistedAddress(address: Address) {
  // Replace with clave provided address here
  if (
    address.toLowerCase() ===
      '0xbe75079fd259a82054cAAB2CE007cd0c20b177a8'.toLowerCase() ||
    address.toLowerCase() ===
      '0x41ee28EE05341E7fdDdc8d433BA66054Cd302cA1'.toLowerCase() ||
    address.toLowerCase() ===
      '0x3C3116d2220DD02dbF9c993D57794f6a44CEF9eF'.toLowerCase() ||
    address.toLowerCase() ===
      '0x4fd8608EA002829D0478696f5B3330cF43761EA1'.toLowerCase() ||
    address.toLowerCase() ===
      '0x53323e9bE41473E747001CDe9076e6A2c29C1b3E'.toLowerCase() ||
    address.toLowerCase() ===
      '0x5EF8F77eAeaFa97deb76D367C2C3d2814ab2a1C7'.toLowerCase() ||
    address.toLowerCase() ===
      '0xF48a1D9EbF8843736c9867b2082e0635D10f3822'.toLowerCase() ||
    address.toLowerCase() ===
      '0x18776Ff0A0C0D27164974150a1CB42C73e66715c'.toLowerCase() ||
    address.toLowerCase() ===
      '0x5b4EBF3F804Ae9Bd78B37eAd3E791a799536Bf81'.toLowerCase() ||
    address.toLowerCase() ===
      '0x1D99c5B0BE9311428a689FA9c75036B436431E07'.toLowerCase() ||
    address.toLowerCase() ===
      '0x57aA68CEd28A534283b20EF76C29Dd7fC4d9406c'.toLowerCase()
  ) {
    return true
  }
  return false
}

export const fillBundle = async (bundle: any) =>
  withSpan('fillBundle', async () => {
    // const validatedBundle: BundleEvent = await validateBundle(bundle)
    // NOTE: This should not be added for production fillers.
    // The rhinestone relayer skips filling test bundles, so that integrating fillers can test using these.
    addChainId(bundle.targetFillPayload.chainId)
    if (bundle.acrossDepositEvents[0].outputAmount == '3') {
      addFillStatus(BundleActionStatus.SKIPPED)
      return
    }

    let delay = 0
    let hasEth
    let hasL2s

    // check if pure same chain flow first
    if (
      bundle.acrossDepositEvents.every(
        (depositEvent: any) => depositEvent.originClaimPayload.chainId === 0,
      )
    ) {
      delay = 4000
    } else {
      for (const depositEvent of bundle.acrossDepositEvents) {
        const chainId = depositEvent.originClaimPayload.chainId

        if (chainId === 1) {
          hasEth = true
        } else if (
          chainId === 10 ||
          chainId === 137 ||
          chainId === 8453 ||
          chainId === 42161
        ) {
          hasL2s = true
        }

        // terminate early if we have eth
        if (hasEth) {
          break
        }
      }
    }

    if (hasEth) {
      delay = 25000 // 25 seconds
    } else if (hasL2s) {
      delay = 15000 // 15 seconds
    }

    if (delay > 0 && process.env.DEPLOYMENT_ENV == 'prod') {
      console.log(`waiting for ${delay / 1000} seconds`)
      await new Promise((resolve) => setTimeout(resolve, delay))

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

    const { success } = await claimBundle(bundle)

    if (!success) {
      console.log('Claim bundle failed, skipping fill')
    }

    const updatedPayload = {
      chainId: bundle.targetFillPayload.chainId,
      to: bundle.targetFillPayload.to,
      value: BigInt(bundle.targetFillPayload.value),
      data: bundle.targetFillPayload.data,
    }

    let nonce

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
      //   if (
      //     isWhitelistedAddress(
      //       bundle.acrossDepositEvents[0].recipient as Address,
      //     )
      //   ) {
      //     console.log('waiting for 20 seconds')
      //     // Wait for 20 seconds before proceeding
      //     await new Promise((resolve) => setTimeout(resolve, 20_000))
      //
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

      // const nonce = await nonceManager.getNonce({
      //   chainId: bundle.targetFillPayload.chainId,
      //   account: walletClient.account.address,
      // })

      const account = privateKeyToAccount(
        process.env.SOLVER_PRIVATE_KEY! as Hex,
      )
      const gas = await walletClient.estimateGas({
        account,
        to: updatedPayload.to,
        value: updatedPayload.value,
        data: updatedPayload.data,
      })

      const { maxFeePerGas, maxPriorityFeePerGas } =
        await walletClient.estimateFeesPerGas()

      nonce = await nonceManager.getNonce({
        chainId: bundle.targetFillPayload.chainId,
        account: account.address,
      })

      // console.log('Filling bundle with payload:', updatedPayload)
      let fillTx
      try {
        fillTx = await walletClient.sendRawTransaction({
          serializedTransaction: await account.signTransaction({
            to: updatedPayload.to,
            value: updatedPayload.value,
            data: updatedPayload.data,
            chainId: bundle.targetFillPayload.chainId,
            type: 'eip1559',
            maxFeePerGas,
            maxPriorityFeePerGas,
            gas,
            nonce,
          }),
        })

        // fillTx = await walletClient.sendTransaction({
        //   to: updatedPayload.to,
        //   value: updatedPayload.value,
        //   data: updatedPayload.data,
        //   chain: walletClient.chain,
        //   // TODO: There's got to be a better way.
        //   nonce,
        // })
      } catch (txError) {
        addFillStatus(BundleActionStatus.FAILED)
        recordError(txError)
        recordBundleFill(
          bundle.targetFillPayload.chainId,
          walletClient.account.address,
          BundleActionStatus.FAILED,
        )
        console.log('txError', txError)
        // TODO: Synchronize nonce at this point, either by decrementing the nonce or by getting the latest nonce from the chain
        return
      }

      logMessage(
        '🟢 Successfully filled bundle with tx hash: ' +
          fillTx +
          ' on chain: ' +
          bundle.targetFillPayload.chainId +
          ' with nonce: ' +
          nonce,
      )

      walletClient.waitForTransactionReceipt({ hash: fillTx })

      addTransactionId(fillTx)
      addFillStatus(BundleActionStatus.SUCCESS)
      recordBundleFill(
        bundle.targetFillPayload.chainId,
        walletClient.account.address,
        BundleActionStatus.SUCCESS,
      )
    } catch (e) {
      const error = e as ContractFunctionExecutionError
      addFillStatus(BundleActionStatus.FAILED)
      recordError(e)
      const errorMessage = `🔴 Failed to fill bundle. \n\n Error: ${error.shortMessage} \n\n Sender: ${error.sender} \n\n To: ${error.contractAddress} \n\n Bundle: ${JSON.stringify(bundle)} \n\n Encoded Function Data: ${updatedPayload.data}`
      await logError(errorMessage)
    }
  })
