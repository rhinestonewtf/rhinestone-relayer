import { BundleEvent, DepositEvent } from '@rhinestone/orchestrator-sdk'
import { Address } from 'viem'

// export type BundleEvent = {
//   bundleId: string
//   type: string
//   standardDepositEvents: DepositEvent[]
//   executionDepositEvent: DepositEvent
// }

// export type DepositEvent = {
//   inputToken: Address // address
//   outputToken: Address // address
//   inputAmount: bigint // uint256
//   outputAmount: bigint // uint256
//   destinationChainId: number
//   originChainId: number
//   depositId: bigint // uint256 (indexed)
//   quoteTimestamp: number // uint32
//   fillDeadline: number // uint32
//   exclusivityDeadline: number // uint32
//   depositor: Address // address (indexed)
//   recipient: Address // address
//   exclusiveRelayer: Address // address
//   message: string // bytes
// }

// export function validateDepositEvent(depositEvent: any): DepositEvent {
//   const validatedDepositEvent = {
//     inputToken: depositEvent.inputToken as Address,
//     outputToken: depositEvent.outputToken as Address,
//     inputAmount: BigInt(depositEvent.inputAmount),
//     outputAmount: BigInt(depositEvent.outputAmount),
//     destinationChainId: depositEvent.destinationChainId,
//     originChainId: depositEvent.originChainId,
//     depositId: BigInt(depositEvent.depositId),
//     quoteTimestamp: depositEvent.quoteTimestamp,
//     fillDeadline: depositEvent.fillDeadline,
//     exclusivityDeadline: depositEvent.exclusivityDeadline,
//     depositor: depositEvent.depositor as Address,
//     recipient: depositEvent.recipient as Address,
//     exclusiveRelayer: depositEvent.exclusiveRelayer as Address,
//     message: depositEvent.message,
//   }
//   return validatedDepositEvent
// }

// export async function validateBundle(bundle: any): Promise<BundleEvent> {
//   const validatedBundle: BundleEvent = {
//     bundleId: bundle.bundleId,
//     type: bundle.type,
//     executionDepositEvent: validateDepositEvent(bundle.executionDepositEvent),
//     standardDepositEvents: bundle.standardDepositEvents.map(
//       (depositEvent: any) => validateDepositEvent(depositEvent),
//     ),
//   }

//   return validatedBundle
// }
