// import { BridgeIntent } from "@prisma/client";
import { BridgeIntent } from '../models/bridgeIntent'
import { ClaimRequest } from '../models/claimRequest'

export class SolverService {
  getSolverPayload(
    claimRequest: ClaimRequest,
  ):
    | { request: ClaimRequest; solverPayload: String }
    | PromiseLike<{ request: ClaimRequest; solverPayload: String }> {
    throw new Error('Method not implemented.')
  }

  async solverAuction(intent: BridgeIntent): Promise<{
    fee: bigint
    claimRecipient: string
    solverExpiryTimestamp: number
  }> {
    return new Promise((resolve) => {
      // Simulate a delay of 1-2 seconds to mimic the auction process
      setTimeout(() => {
        const mockFee = BigInt(1000000) // Example fee
        const mockClaimRecipient = '0xMockSolverAddress' // Example solver address

        resolve({
          fee: mockFee,
          claimRecipient: mockClaimRecipient,
          solverExpiryTimestamp: Date.now(),
        })
      }, 1000) // Simulate a 1 second delay
    })
  }
}
