import { Address, Hex } from 'viem'

export function formatDepositEvent(depositEvent: any) {
  const formattedDepositEvent = {
    inputToken: depositEvent.inputToken as Address,
    outputToken: depositEvent.outputToken as Address,
    inputAmount: BigInt(depositEvent.inputAmount),
    outputAmount: BigInt(depositEvent.outputAmount),
    destinationChainId: BigInt(depositEvent.destinationChainId),
    depositId: BigInt(depositEvent.depositId),
    quoteTimestamp: depositEvent.quoteTimestamp as number,
    fillDeadline: depositEvent.fillDeadline as number,
    exclusivityDeadline: depositEvent.exclusivityDeadline as number,
    depositor: depositEvent.depositor as Address,
    recipient: depositEvent.recipient as Address,
    exclusiveRelayer: depositEvent.exclusiveRelayer as Address,
    message: depositEvent.message as Hex,
  }

  return formattedDepositEvent
}
