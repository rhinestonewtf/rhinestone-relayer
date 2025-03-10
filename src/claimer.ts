import { ContractFunctionExecutionError, Hex } from 'viem'

import { logError, logMessage } from './utils/logger'
import { getPublicClient, getWalletClient } from './utils/getClients'
import { OWNER_ADDRESS } from './constants/constants'

export async function claimBundle(bundle: any) {
  // TODO: Optimize this with promise all stuff
  // TODO: this currently will make 1 claim tx per token on any chain, but anything but the first claim on a chain will fail
  try {
    for (const depositEvent of bundle.acrossDepositEvents) {
      console.log(
        'Claiming bundle with payload:',
        depositEvent.originClaimPayload,
      )

      const walletClient = getWalletClient(
        depositEvent.originClaimPayload.chainId,
        process.env.SOLVER_PRIVATE_KEY! as Hex,
      )

      // Adding try/catch for the sendTransaction
      try {
        const claimTx = await walletClient.sendTransaction({
          chain: walletClient.chain,
          to: depositEvent.originClaimPayload.to,
          value: BigInt(depositEvent.originClaimPayload.value),
          data: depositEvent.originClaimPayload.data,
          // nonce: await walletClient.getTransactionCount({
          //   address: OWNER_ADDRESS,
          // }),
        })

        logMessage(
          '✅ Successfully claimed a bundle for the Prod Orch: ' + claimTx,
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
