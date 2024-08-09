import { BridgeIntent } from './bridgeIntent'

export type ClaimRequest = {
  fee: bigint
  claimRecipient: string
  solverExpiryTimestamp: number
  intent: BridgeIntent
}
