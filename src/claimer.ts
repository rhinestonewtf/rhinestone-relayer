import {
  Address,
  ContractFunctionExecutionError,
  encodeFunctionData,
  Hex,
} from 'viem'
import { getOriginModule } from './utils/getOriginModule'
import { logError, logMessage } from './utils/logger'
import { originModuleAbi } from './constants/abi'
import { waitForTransactionReceipt } from 'viem/_types/actions/public/waitForTransactionReceipt'
import { getPublicClient } from './utils/getClients'
import { OWNER_ADDRESS } from './constants/constants'

export function formatClaimPayload(payload: any) {
  return {
    order: {
      settlement: {
        orchestrator: payload.order.settlement.orchestrator as Address,
        recipient: payload.order.settlement.recipient as Address,
        settlementContract: payload.order.settlement
          .settlementContract as Address,
        targetChainId: BigInt(payload.order.settlement.targetChainId),
        fillDeadline: payload.order.settlement.fillDeadline,
        lastDepositId: BigInt(payload.order.settlement.lastDepositId),
      },
      acrossTransfer: {
        originModule: payload.order.acrossTransfer.originModule as Address,
        originAccount: payload.order.acrossTransfer.originAccount as Address,
        targetAccount: payload.order.acrossTransfer.targetAccount as Address,
        originChainId: BigInt(payload.order.acrossTransfer.originChainId),
        initiateDeadline: payload.order.acrossTransfer.initiateDeadline,
        maxFee: BigInt(payload.order.acrossTransfer.maxFee),
        depositId: BigInt(payload.order.acrossTransfer.depositId),
        originTransfer: {
          tokenAddress: payload.order.acrossTransfer.originTransfer
            .tokenAddress as Address,
          amount: BigInt(payload.order.acrossTransfer.originTransfer.amount),
        },
        targetTransfer: {
          tokenAddress: payload.order.acrossTransfer.targetTransfer
            .tokenAddress as Address,
          amount: BigInt(payload.order.acrossTransfer.targetTransfer.amount),
        },
      },
      smartDigests: {
        acrossTransferDigests: {
          digestIndex: BigInt(
            payload.order.smartDigests.acrossTransferDigests.digestIndex,
          ),
          chainDataDigests:
            payload.order.smartDigests.acrossTransferDigests.chainDataDigests.map(
              (digest: string) => digest as Hex,
            ),
        },
        executionDigest: payload.order.smartDigests.executionDigest as Hex,
        userOpDigest: payload.order.smartDigests.userOpDigest as Hex,
      },
      userSig: payload.order.userSig as Hex,
    },
    auctionFee: BigInt(payload.auctionFee),
    orchestratorSig: payload.orchestratorSignature as Hex,
    acrossMessagePayload: payload.acrossMessagePayload as Hex,
  }
}

export async function claimBundle(bundle: any) {
  claimDepositEvent(bundle.executionDepositEvent)
  for (const depositEvent of bundle.standardDepositEvents) {
    claimDepositEvent(depositEvent)
  }
}

export async function claimDepositEvent(depositEvent: any) {
  const ORIGIN_MODULE = getOriginModule(
    depositEvent.originChainId,
    process.env.SOLVER_PRIVATE_KEY! as Hex,
  )

  try {
    const publicClient = getPublicClient(depositEvent.originChainId)

    const tx = await ORIGIN_MODULE.write.handleAcross(
      [formatClaimPayload(depositEvent.originClaimPayload)],
      {
        nonce: await publicClient.getTransactionCount({
          address: OWNER_ADDRESS,
        }),
      },
    )

    logMessage(
      `✅ Successfully claimed on Origin Chain: ${depositEvent.originChainId} with tx hash: ` +
        tx,
    )

    await getPublicClient(depositEvent.originChainId).waitForTransactionReceipt(
      { hash: tx },
    )
  } catch (e) {
    const error = e as ContractFunctionExecutionError
    const encodedFunctionData = encodeFunctionData({
      abi: originModuleAbi,
      functionName: 'handleAcross',
      args: [formatClaimPayload(depositEvent.originClaimPayload)],
    })

    const errorMessage = `❌ Could not claim for origin chainId : ${depositEvent.originChainId} \n\n Error: ${error.shortMessage} \n\n Sender: ${error.sender} \n\n To: ${error.contractAddress} \n\n DepositEvent: ${JSON.stringify(depositEvent)} \n\n Encoded Function Data: ${encodedFunctionData}`
    await logError(errorMessage)
  }
}
