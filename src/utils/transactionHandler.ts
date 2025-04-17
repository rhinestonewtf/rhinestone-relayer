import { Hex } from 'viem'
import { getWalletClient } from './getClients'
import { privateKeyToAccount } from 'viem/accounts'
import { nonceManager } from '../nonceManager'

export const handleTransactions = async (
  transactions: any[],
  getRPCUrl: (chainId: number) => string,
) => {
  // todo: do this in parallel
  for (const transaction of transactions) {
    const walletClient = getWalletClient(
      transaction.chainId,
      process.env.SOLVER_PRIVATE_KEY! as Hex,
      getRPCUrl,
    )

    const account = privateKeyToAccount(process.env.SOLVER_PRIVATE_KEY! as Hex)
    let gas
    try {
      gas = await walletClient.estimateGas({
        account,
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
      })
    } catch (error) {
      return false
    }

    const { maxFeePerGas, maxPriorityFeePerGas } =
      await walletClient.estimateFeesPerGas()

    const nonce = await nonceManager.getNonce({
      chainId: transaction.chainId,
      account: account.address,
      getRPCUrl,
    })

    let fillTx
    try {
      fillTx = await walletClient.sendRawTransaction({
        serializedTransaction: await account.signTransaction({
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
    } catch (txError) {
      // addFillStatus(BundleActionStatus.FAILED)
      // recordError(txError)
      // recordBundleFill(
      //   bundle.targetFillPayload.chainId,
      //   walletClient.account.address,
      //   BundleActionStatus.FAILED,
      // )
      // console.log('txError', txError)
      // // TODO: Synchronize nonce at this point, either by decrementing the nonce or by getting the latest nonce from the chain
      return false
    }

    walletClient.waitForTransactionReceipt({ hash: fillTx })
  }
  return true
}
