import { Request, Response } from "express";
import { OrchestratorService } from "../services/orchestratorService";
import { BridgeIntent } from "../models/bridgeIntent";

const orchestratorService = new OrchestratorService();

export const initiateBridgeIntent = async (req: Request, res: Response) => {
  const intent: BridgeIntent = req.body;
  const claimRequest = await orchestratorService.initiateBridgeIntent(intent);
  res.json(claimRequest);
};

export const getSolverPayload = async (req: Request, res: Response) => {
  const { claimRequest, userSignature } = req.body;
  const solverPayload = await orchestratorService.getSolverPayload(
    claimRequest,
    userSignature
  );
  res.json(solverPayload);
};

export const getCosignedClaimRequest = async (req: Request, res: Response) => {
  const { signedClaimRequest } = req.body;
  const cosignedPayload = await orchestratorService.getCosignedClaimRequest(
    signedClaimRequest
  );
  res.json(cosignedPayload);
};
