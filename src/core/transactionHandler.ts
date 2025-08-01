import { Address, Hex, TransactionSerializable } from 'viem'
import { FeeEstimation, Transaction } from '../types'
import { getWalletClient } from '../helpers/getClients'
import { nonceManager } from './nonceManager'
import {
  addFillStatus,
  BundleActionStatus,
  recordError,
} from '../monitoring/tracing'
import { recordBundleFill } from '../monitoring/metrics'
import { getTenderlySimulation } from '../helpers/tenderly'
import { debugLog } from '../helpers/logger'
import { SOLVER_PRIVATE_KEY } from '../config/vars'
import { replaceRepaymentDestinations } from '../helpers/rebalancing'

export const handleTransactions = async (
  bundleId: string,
  transactions: Transaction[],
  getRPCUrl: (chainId: number) => string,
) => {
  const processPromises = transactions.map(async (transaction) => {
    const walletClient = getWalletClient(
      transaction.chainId,
      SOLVER_PRIVATE_KEY as Hex,
      getRPCUrl,
    )

    const txData = replaceRepaymentDestinations(transaction.data, { address: walletClient.account.address })

    let gas
    try {
      gas = await walletClient.estimateGas({
        account: walletClient.account,
        to: transaction.to,
        value: transaction.value,
        data: txData,
        authorizationList: transaction.authorizationList,
      })
    } catch (error) {
      debugLog(`Error estimating gas: ${error} for transaction: ${transaction}`)
      return { success: false }
    }

    const { maxFeePerGas, maxPriorityFeePerGas } =
      await walletClient.estimateFeesPerGas()

    const nonce = await nonceManager.getNonce({
      chainId: transaction.chainId,
      account: walletClient.account.address,
      getRPCUrl,
    })

    const feeEstimation = {
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas
    }

    let tx
    try {
      tx = await walletClient.sendRawTransaction({
        serializedTransaction: await walletClient.account.signTransaction(makeTransactionRequest(transaction, nonce, feeEstimation)),
      })

      if (transaction.isFill) {
        // make preconfirmation
        fetch(`${process.env.ORCHESTRATOR_URL}/bundles/${bundleId}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ORCHESTRATOR_API_KEY!,
          },
          body: JSON.stringify({
            type: 'FillPreconfirmation',
            chainId: transaction.chainId,
            txHash: tx,
          }),
        })
        debugLog(`Fill preconfirmation sent for transaction: ${tx}`)
      }

      debugLog(`Transaction sent: ${tx}`)

      // do we need to wait for transaction receipt?
      // await walletClient.waitForTransactionReceipt({ hash: fillTx })
      return { success: true }
    } catch (txError) {
      await processTransactionFailure({
        txError,
        transaction,
        relayerAddress: walletClient.account.address,
        blockNumber: await walletClient.getBlockNumber(),
      })
      return { success: false }
    }
  })

  // Execute all transaction processes in parallel
  const results = await Promise.all(processPromises)

  // Check if any transaction failed
  const allSuccessful = results.every((result) => result.success)
  return allSuccessful
}

const processTransactionFailure = async ({
  txError,
  transaction,
  relayerAddress,
  blockNumber,
}: {
  txError: unknown
  transaction: Transaction
  relayerAddress: Address
  blockNumber: bigint
}) => {
  // add metrics
  addFillStatus(BundleActionStatus.FAILED)
  recordError(txError)
  recordBundleFill(
    String(transaction.chainId),
    relayerAddress,
    BundleActionStatus.FAILED,
  )

  // simulate on tenderly
  await getTenderlySimulation({
    chainId: transaction.chainId,
    from: relayerAddress,
    to: transaction.to,
    calldata: transaction.data,
    blockNumber: Number(blockNumber),
  })
}

function makeTransactionRequest(transaction: Transaction, nonce: number, feeEstimation: FeeEstimation): TransactionSerializable {
  if (transaction.authorizationList) {
    return {
      to: transaction.to,
      value: BigInt(transaction.value),
      data: transaction.data,
      chainId: transaction.chainId,
      ...feeEstimation,
      nonce,
      type: 'eip7702',
      authorizationList: transaction.authorizationList
    }
  } else {
    return {
      to: transaction.to,
      value: BigInt(transaction.value),
      data: transaction.data,
      chainId: transaction.chainId,
      ...feeEstimation,
      nonce,
      type: 'eip1559'
    }
  }
}