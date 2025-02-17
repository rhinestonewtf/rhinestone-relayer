import { ContractFunctionExecutionError, Hex } from 'viem'

import { logError, logMessage } from './utils/logger'
import { getPublicClient, getWalletClient } from './utils/getClients'
import { OWNER_ADDRESS } from './constants/constants'

export async function claimBundle(bundle: any) {
  const claimTxs = bundle.originClaimPayloads.map(
    // TODO: Better typing ofc
    async (originPayload: {
      chainId: number
      to: any
      value: any
      data: any
    }) => {
      const walletClient = getWalletClient(
        originPayload.chainId,
        process.env.SOLVER_PRIVATE_KEY! as Hex,
      )

      // Adding try/catch for the sendTransaction
      try {
        return await walletClient.sendTransaction({
          to: originPayload.to,
          value: originPayload.value,
          data: originPayload.data,
          nonce: await walletClient.getTransactionCount({
            address: OWNER_ADDRESS,
          }),
        })
      } catch (txError) {
        const error = txError as ContractFunctionExecutionError
        const errorMessage = `🔴 Failed to send transaction for origin chainId: ${originPayload.chainId}. Error: ${error.message}`
        await logError(errorMessage)
        throw txError // Rethrow the error to handle it in the Promise.all
      }
    },
  )

  try {
    await Promise.all(claimTxs)
  } catch (e) {
    // Handle any errors that occurred in the Promise.all
    const error = e as ContractFunctionExecutionError
    const errorMessage = `❌ One or more claims failed. Error: ${error.shortMessage}`
    await logError(errorMessage)
  }
}
