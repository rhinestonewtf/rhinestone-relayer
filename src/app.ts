import express, { Express, Request, Response } from "express";
import {
  initiateBridgeIntent,
  getSolverPayload,
  getCosignedClaimRequest,
} from "./controllers/orchestratorController";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/initiate_bridge_intent", initiateBridgeIntent);
app.post("/get_solver_payload", getSolverPayload);
app.post("/get_cosigned_claim_request", getCosignedClaimRequest);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// Use next js maybe
// Indexer for events for the solver - the graph? 
// Orchestrator Database - Postgres SQL, supabase, prysma orm
// Add ID to claim request
// 