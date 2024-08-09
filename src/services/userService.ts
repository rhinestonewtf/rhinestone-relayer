import { BridgeIntent } from "../models/bridgeIntent";
import { ClaimRequest } from "../models/claimRequest";

export class UserService {
  async generateBridgeIntent(intent: BridgeIntent): Promise<ClaimRequest> {
    // Simulate solver auction and return claim request
    const fee = BigInt(10); // Example fee
    const claimRecipient = "0xSolverAddress"; // Example solver address

    return {
      fee,
      claimRecipient,
      intent,
    };
  }

  async getSolverPayload(
    claimRequest: ClaimRequest,
    userSignature: string
  ): Promise<string> {
    // Verify user signature and funds, then interact with solver
    const solverPayload = "0xSolverPayload"; // Example solver payload

    return solverPayload;
  }

  async getCosignedClaimRequest(signedClaimRequest: string): Promise<string> {
    // Verify the signed claim request and return cosigned payload
    const cosignedPayload = "0xCosignedPayload"; // Example cosigned payload

    return cosignedPayload;
  }
}
