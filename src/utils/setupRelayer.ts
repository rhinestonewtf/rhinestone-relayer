import { Address, Hex, encodeFunctionData, erc20Abi, getContract } from 'viem'
import { getPublicClient } from './getClients'

import {
  getSpokePoolAddress,
  registry,
  TokenConfig,
} from '@rhinestone/orchestrator-sdk'
import { getRelayer } from './getRelayer'

const MAX_UINT256 =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n

export type ExecutionRelayer = {
  to: Address
  value: bigint
  data: Hex
}

export async function setSpokepool(chainId: number) {
  const RELAYER = getRelayer(chainId)

  const currentSpokepool = await RELAYER.read.spokepool()
  const updatedSpokepool = getSpokePoolAddress(chainId)

  if (currentSpokepool === updatedSpokepool) {
    console.log(
      `🟡 Skipping spokepool update for chainId: ${chainId} & Spokepool Address: ${currentSpokepool}`,
    )
  } else {
    const tx = await RELAYER.write.setSpokepool([getSpokePoolAddress(chainId)])
    console.log(
      `🟢 Updating spokepool for chainId: ${chainId} & Spokepool Address: ${currentSpokepool} -> ${updatedSpokepool}`,
    )
    console.log(`Tx Hash: ${tx}`)
  }
}

export async function approveSpokepool(tokens: TokenConfig[], chainId: number) {
  const RELAYER = getRelayer(chainId)
  const publicClient = getPublicClient(chainId)
  const executions: ExecutionRelayer[] = []

  for (const token of tokens) {
    if (token.symbol === 'ETH') {
      continue
    }
    const ERC20 = getContract({
      abi: erc20Abi,
      address: token.address,
      client: publicClient,
    })
    const currentAllowance: bigint = await ERC20.read.allowance([
      RELAYER.address,
      getSpokePoolAddress(chainId),
    ])

    if (currentAllowance < MAX_UINT256 - 1000000000000000000000n) {
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [getSpokePoolAddress(chainId), MAX_UINT256],
      })

      console.log('Approving token:', token.address, 'for chainId:', chainId)

      executions.push({
        to: token.address,
        value: 0n,
        data: data,
      })
    } else {
      console.log(
        `🟡 Skipping approvals for chainId: ${chainId}, token: ${token.symbol}`,
      )
    }
  }

  if (executions.length === 0) {
    console.log(`🟡 Skipping approvals for chainId: ${chainId}`)
  } else {
    const tx = await RELAYER.write.multiCall([executions])
    console.log(`🟢 Approving tokens for chainId: ${chainId}`)
    console.log(`Tx Hash: ${tx}`)

    await publicClient.waitForTransactionReceipt({ hash: tx })
  }
}

export async function setAllSpokepools() {
  const chainIds = Object.keys(registry).map(Number) // Get all chain IDs

  for (const chainId of chainIds) {
    await setSpokepool(chainId)
  }

  console.log('🟢 All spokepools updated')

  for (const chainId of chainIds) {
    const tokens = Object.values(registry[chainId].supportedTokens)

    await approveSpokepool(tokens, chainId)
  }
}

setAllSpokepools()
