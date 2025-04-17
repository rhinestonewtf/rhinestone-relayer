import { Address, Hex } from 'viem'
import { Transaction } from '../types'
import { getPublicClient, getWalletClient } from '../helpers/getClients'
import { nonceManager } from './nonceManager'
import {
  addFillStatus,
  BundleActionStatus,
  recordError,
} from '../monitoring/tracing'
import { recordBundleFill } from '../monitoring/metrics'
import { getTenderlySimulation } from '../helpers/tenderly'

export const handleTransactions = async (
  transactions: Transaction[],
  getRPCUrl: (chainId: number) => string,
) => {
  const processPromises = transactions.map(async (transaction) => {
    const walletClient = getWalletClient(
      transaction.chainId,
      process.env.SOLVER_PRIVATE_KEY! as Hex,
      getRPCUrl,
    )

    let gas
    try {
      gas = await walletClient.estimateGas({
        account: walletClient.account,
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
      })
    } catch (error) {
      await processTransactionFailure({
        txError: error,
        transaction,
        relayerAddress: walletClient.account.address,
        blockNumber: await walletClient.getBlockNumber(),
      })
      return { success: false }
    }

    const { maxFeePerGas, maxPriorityFeePerGas } =
      await walletClient.estimateFeesPerGas()

    const nonce = await nonceManager.getNonce({
      chainId: transaction.chainId,
      account: walletClient.account.address,
      getRPCUrl,
    })

    let fillTx
    try {
      fillTx = await walletClient.sendRawTransaction({
        serializedTransaction: await walletClient.account.signTransaction({
          to: transaction.to,
          value: transaction.value,
          data: transaction.data,
          chainId: transaction.chainId,
          type: 'eip1559',
          maxFeePerGas,
          maxPriorityFeePerGas,
          gas,
          nonce,
        }),
      })

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
