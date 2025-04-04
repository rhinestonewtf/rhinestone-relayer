import { ContractFunctionExecutionError, Hex } from 'viem'

import { logError, logMessage } from './utils/logger'
import { getWalletClient } from './utils/getClients'
import { nonceManager } from './nonceManager'
import { privateKeyToAccount } from 'viem/accounts'
import { formatDepositEvent } from './utils/formatDepositEvent'
import './utils/serializeBigInts'

export async function claimBundle(bundle: any) {
  // TODO: Optimize this with promise all stuff
  // TODO: this currently will make 1 claim tx per token on any chain, but anything but the first claim on a chain will fail
  try {
    for (const depositEvent of bundle.acrossDepositEvents) {
      console.log(
        'Claiming bundle with payload:',
        depositEvent.originClaimPayload,
      )

      if (depositEvent.originClaimPayload.chainId === 0) {
        console.log('Skipping same chain claim')
        continue
      }

      const walletClient = getWalletClient(
        depositEvent.originClaimPayload.chainId,
        process.env.SOLVER_PRIVATE_KEY! as Hex,
      )

      // const nonce = await nonceManager.getNonce({
      //   chainId: depositEvent.originClaimPayload.chainId,
      //   account: walletClient.account.address,
      // })

      const account = privateKeyToAccount(
        process.env.SOLVER_PRIVATE_KEY! as Hex,
      )
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
      } catch (txError) {
        const error = txError as ContractFunctionExecutionError
        const errorMessage = `🔴 Failed to send transaction for origin chainId: ${depositEvent.originClaimPayload.chainId}. Error: ${error.message}`
        await logError(errorMessage)
        throw txError // Rethrow the error to handle it in the Promise.all
      }
    }
  } catch (e) {
    // Handle any errors that occurred in the Promise.all
    const error = e as ContractFunctionExecutionError
    const errorMessage = `❌ One or more claims failed. Error: ${error.shortMessage}`
    await logError(errorMessage)
  }
}
