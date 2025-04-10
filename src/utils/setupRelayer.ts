require('dotenv').config()

import { Address, Hex, erc20Abi, getContract } from 'viem'
import { getPublicClient, getWalletClient } from './getClients'

import {
  getSupportedChainIds,
  getSupportedTokens,
  registry,
  TokenConfig,
} from '@rhinestone/orchestrator-sdk'

const MAX_UINT256 =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n

// TODO: Replace with orchestrator SDK functions
function getRhinestoneSpokepoolAddress(): Address {
  return '0x000000000060f6e853447881951574CDd0663530'
}

export async function approveSpokepool(tokens: TokenConfig[], chainId: number) {
  const publicClient = getPublicClient(chainId)
  const walletClient = getWalletClient(chainId, process.env.SOLVER_PRIVATE_KEY! as Hex)

  for (const token of tokens) {
    if (token.symbol === 'ETH') {
      continue
    }
    const ERC20 = getContract({
      abi: erc20Abi,
      address: token.address,
      client: walletClient,
    })
    const currentAllowance: bigint = await ERC20.read.allowance([
      walletClient.account.address,
      getRhinestoneSpokepoolAddress(),
    ])

    if (currentAllowance < MAX_UINT256 - 1000000000000000000000n) {
      const tx = await ERC20.write.approve(
        [getRhinestoneSpokepoolAddress(), MAX_UINT256],
        {
          chain: walletClient.chain
        },
      )
      await publicClient.waitForTransactionReceipt({ hash: tx })

      console.log('🟢 Approving token:', token.address, 'for chainId:', chainId)
      console.log(tx)
    } else {
      console.log(
        `🟡 Skipping approvals for chainId: ${chainId}, token: ${token.symbol}`,
      )
    }
  }
}

export async function approveAllRhinestoneSpokepools() {
  const chainIds = Object.keys(registry).map(Number) // Get all chain IDs

  for (const chainId of chainIds) {
    const tokens = getSupportedTokens(chainId)

    await approveSpokepool(tokens, chainId)
  }

  console.log('🟢 All spokepools approved')
}

approveAllRhinestoneSpokepools()
