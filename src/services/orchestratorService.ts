import { BridgeIntent } from '../models/bridgeIntent'
import { ClaimRequest } from '../models/claimRequest'
import { SolverService } from './solverService'

import { privateKeyToAccount } from 'viem/accounts'

import { PrismaClient, UserAccount } from '@prisma/client'

import {
  AccountStateConflictError,
  createWalletClient,
  erc20Abi,
  getContract,
  GetContractReturnType,
  http,
  isAddress,
  publicActions,
  Signature,
  signatureToCompactSignature,
  verifyTypedData,
  zeroAddress,
} from 'viem'
import { accountLockerAbi } from '../abi'

require('dotenv').config()

// TODO: Generate this types using typechain or something?
const types = {
  BridgeIntent: [
    { name: 'sourceChainId', type: 'uint256' },
    { name: 'targetChainId', type: 'uint256' },
    { name: 'tokenAddress', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'accountLocker', type: 'address' },
  ],
  ClaimRequest: [
    { name: 'fee', type: 'uint256' },
    { name: 'claimRecipient', type: 'address' },
    { name: 'intent', type: 'BridgeIntent' },
  ],
}

export class OrchestratorService {
  private solverService: SolverService
  private client
  private prisma

  constructor() {
    this.solverService = new SolverService()

    this.client = createWalletClient({
      account: privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`),
      transport: http(process.env.RPC_URL),
    }).extend(publicActions)

    this.prisma = new PrismaClient()
  }

  async verifyUserSignature(
    userAccount: UserAccount,
    userSignature: Signature,
    claimRequest: ClaimRequest,
  ): Promise<Boolean> {
    const domain = {
      name: 'Account Locker', // TODO: Update this to the actual domain name
      version: '1',
      chainId: claimRequest.intent.sourceChainId,
      verifyingContract: claimRequest.intent.accountLocker,
    }

    if (isAddress(userAccount.lockerOwner)) {
      const valid = await verifyTypedData({
        address: userAccount.lockerOwner,
        domain,
        types,
        primaryType: 'ClaimRequest',
        message: {
          intent: claimRequest.intent,
          fee: claimRequest.fee,
          claimRecipient: claimRequest.claimRecipient,
        },
        signature: userSignature,
      })

      return valid
    }

    return false
  }

  async initiateBridgeIntent(intentData: BridgeIntent): Promise<ClaimRequest> {
    // 1. Send the BridgeIntent to the solver sevice
    // Run the solver auction to get the fee and claimRecipient
    const { fee, claimRecipient, solverExpiryTimestamp } =
      await this.solverService.solverAuction(intentData)

    // 2. Create the claim request, and send to user
    const request: ClaimRequest = {
      fee: fee,
      claimRecipient: claimRecipient,
      solverExpiryTimestamp: solverExpiryTimestamp,
      intent: intentData,
    }

    return request
  }

  // TODO: Add sanitation everywhere
  async getSolverPayload(
    claimRequest: ClaimRequest,
    userSignature: Signature,
  ): Promise<{ request: ClaimRequest; solverPayload: String }> {
    const accountLocker = getContract({
      address: claimRequest.intent.accountLocker,
      abi: accountLockerAbi,
      client: this.client,
    })

    // 1. Fetch Account from the database, if the account doesn't exist, create one
    let userAccount = await this.prisma.userAccount.findUnique({
      where: {
        accountLocker_chainId: {
          accountLocker: claimRequest.intent.accountLocker,
          chainId: claimRequest.intent.sourceChainId,
        },
      },
    })

    if (!userAccount) {
      // If the user account doesn't exist, create it
      userAccount = await this.prisma.userAccount.create({
        data: {
          accountLocker: claimRequest.intent.accountLocker,
          accountOwner: await accountLocker.read.accountOwner(),
          lockerOwner: await accountLocker.read.lockerOwner(),
          chainId: claimRequest.intent.sourceChainId,
        },
      })
    }

    // 1. Verify user signature
    if (
      await this.verifyUserSignature(userAccount, userSignature, claimRequest)
    ) {
      throw new Error('Invalid user signature')
    }

    let sourceTokenBalance: bigint = BigInt(0)

    // 2. Check account balance for source token
    // TODO: Add checks here to ensure that all filled claim requests have been updated for this account
    if (claimRequest.intent.sourceTokenAddress === zeroAddress) {
      sourceTokenBalance = await this.client.getBalance({
        address: accountLocker.address,
      })
    } else {
      sourceTokenBalance = await this.client.readContract({
        address: claimRequest.intent.sourceTokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [accountLocker.address],
      })
    }

    // 3. Subtract unfilled claim requests from current balance
    const pendingClaims = await this.prisma.claimRequest.findMany({
      where: {
        UserAccount: userAccount,
        sourceTokenAddress: claimRequest.intent.sourceTokenAddress,
      },
    })

    pendingClaims.forEach((claim) => {
      // TODO: Check if claim is filled by solver already, if filled remove it from the pending claims
      sourceTokenBalance -= claim.amount
    })

    if (sourceTokenBalance < claimRequest.intent.amount) {
      throw new Error('Insufficient balance')
    }

    const solverPayload =
      await this.solverService.getSolverPayload(claimRequest)

    // Add a claim request to the database
    // TODO: Is there a better way to write this?
    await this.prisma.claimRequest.create({
      data: {
        fee: claimRequest.fee,
        claimRecipient: claimRequest.claimRecipient,
        solverExpiry: claimRequest.solverExpiryTimestamp,
        sourceChainId: claimRequest.intent.sourceChainId,
        targetChainId: claimRequest.intent.targetChainId,
        sourceTokenAddress: claimRequest.intent.sourceTokenAddress,
        targetTokenAddress: claimRequest.intent.targetTokenAddress,
        amount: claimRequest.intent.amount,
        expiryTimestamp: claimRequest.intent.expiryTimestamp,
        orchestrator: claimRequest.intent.orchestrator,
        nonce: claimRequest.intent.nonce,
        userData: claimRequest.intent.userData,
        maxFee: claimRequest.intent.maxFee,
        UserAccountId: userAccount.id,
        status: 'PENDING',
      },
    })

    return this.solverService.getSolverPayload(claimRequest)
  }

  async getCosignedClaimRequest(signedClaimRequest: string): Promise<string> {
    // Verify the signed claim request and return cosigned payload
    const cosignedPayload = '0xCosignedPayload' // Example cosigned payload

    return cosignedPayload
  }
}
