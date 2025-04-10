import { ContractFunctionExecutionError, Hex } from 'viem'

import { logError, logMessage } from './utils/logger'
import { getPublicClient, getWalletClient } from './utils/getClients'
import { nonceManager } from './nonceManager'
import { privateKeyToAccount } from 'viem/accounts'
import './utils/serializeBigInts'
import { withSpan } from './opentelemetry/api'
import {
  addChainId,
  addClaimStatus,
  addTransactionId,
  BundleActionStatus,
  recordError,
} from './tracing'
import { recordBundleClaim } from './metrics'
import { getTenderlySimulation } from './utils/tenderly'

export const claimBundle = async (bundle: any) =>
  withSpan('claim bundle', async () => {
    // TODO: Optimize this with promise all stuff
    // TODO: this currently will make 1 claim tx per token on any chain, but anything but the first claim on a chain will fail

    try {
      const claimedChainIds: number[] = []
      for (const depositEvent of bundle.acrossDepositEvents) {
        // Check if the chainId is already claimed
        if (claimedChainIds.includes(depositEvent.originClaimPayload.chainId)) {
          console.log(
            `Skipping claim for chainId ${depositEvent.originClaimPayload.chainId} as it has already been claimed.`,
          )
          continue
        }
        await claimBundleEvent(depositEvent)
        claimedChainIds.push(depositEvent.originClaimPayload.chainId)
      }
      addClaimStatus(BundleActionStatus.SUCCESS)
      return { success: true }
    } catch (e) {
      // Handle any errors that occurred in the Promise.all
      const error = e as ContractFunctionExecutionError
      const errorMessage = `❌ One or more claims failed. Error: ${error.shortMessage}`
      addClaimStatus(BundleActionStatus.FAILED)
      recordError(e)
      await logError(errorMessage)
      return { success: false }
    }
  })

const claimBundleEvent = async (depositEvent: any) =>
  withSpan('claim bundle event', async () => {
    addChainId(depositEvent.originClaimPayload.chainId)

    console.log(
      'Claiming bundle with payload:',
      depositEvent.originClaimPayload,
    )

    if (depositEvent.originClaimPayload.chainId === 0) {
      console.log('Skipping same chain claim')
      addClaimStatus(BundleActionStatus.SKIPPED)
      return
    }

    const walletClient = getWalletClient(
      depositEvent.originClaimPayload.chainId,
      process.env.SOLVER_PRIVATE_KEY! as Hex,
    )

    // const nonce = await nonceManager.getNonce({
    //   chainId: depositEvent.originClaimPayload.chainId,
    //   account: walletClient.account.address,
    // })

    const account = privateKeyToAccount(process.env.SOLVER_PRIVATE_KEY! as Hex)
    const gas = await walletClient.estimateGas({
      account,
      to: depositEvent.originClaimPayload.to,
      value: BigInt(depositEvent.originClaimPayload.value),
      data: depositEvent.originClaimPayload.data,
    })

    const { maxFeePerGas, maxPriorityFeePerGas } =
      await walletClient.estimateFeesPerGas()

    let nonce = await nonceManager.getNonce({
      chainId: depositEvent.originClaimPayload.chainId,
      account: account.address,
    })

    // Adding try/catch for the sendTransaction
    try {
      // const claimTx = await walletClient.sendTransaction({
      //   chain: walletClient.chain,
      //   to: depositEvent.originClaimPayload.to,
      //   value: BigInt(depositEvent.originClaimPayload.value),
      //   data: depositEvent.originClaimPayload.data,
      //   nonce,
      // })
      const claimTx = await walletClient.sendRawTransaction({
        serializedTransaction: await account.signTransaction({
          to: depositEvent.originClaimPayload.to,
          value: BigInt(depositEvent.originClaimPayload.value),
          data: depositEvent.originClaimPayload.data,
          chainId: depositEvent.originClaimPayload.chainId,
          type: 'eip1559',
          maxFeePerGas,
          maxPriorityFeePerGas,
          gas,
          nonce,
        }),
      })

      logMessage(
        '✅ Successfully claimed a bundle for the Prod Orch: ' +
          claimTx +
          ' on chainId: ' +
          depositEvent.originClaimPayload.chainId +
          ' with nonce: ' +
          nonce,
      )

      walletClient.waitForTransactionReceipt({ hash: claimTx })
      addTransactionId(claimTx)
      addClaimStatus(BundleActionStatus.SUCCESS)
      recordBundleClaim(
        depositEvent.originClaimPayload.chainId.toString(),
        walletClient.account.address.toString(),
        BundleActionStatus.SUCCESS,
      )
    } catch (txError) {
      const error = txError as ContractFunctionExecutionError
      let errorMessage = `🔴 Failed to send transaction for origin chainId: ${depositEvent.originClaimPayload.chainId}. Error: ${error.message}`
      const tenderlyUrl = await getTenderlySimulation({
        chainId: depositEvent.originClaimPayload.chainId,
        from: privateKeyToAccount(process.env.SOLVER_PRIVATE_KEY! as Hex)
          .address,
        to: depositEvent.originClaimPayload.to,
        calldata: depositEvent.originClaimPayload.data,
        blockNumber: Number(
          await getPublicClient(
            depositEvent.originClaimPayload.chainId,
          ).getBlockNumber(),
        ),
      })
      if (tenderlyUrl) {
        errorMessage += `\n\n Tenderly simulation: ${tenderlyUrl}`
      }
      addClaimStatus(BundleActionStatus.FAILED)
      recordBundleClaim(
        depositEvent.originClaimPayload.chainId.toString(),
        walletClient.account.address.toString(),
        BundleActionStatus.FAILED,
      )
      recordError(txError)
      await logError(errorMessage)
      throw txError // Rethrow the error to handle it in the Promise.all
    }
  })
