import { Address, erc20Abi, getContract, zeroAddress } from 'viem'
import {
  getSupportedTokens,
  getSupportedChainIds,
} from '@rhinestone/orchestrator-sdk'
import { getPublicClient, getWalletClient } from './getClients'
import { RELAYER_ADDRESS, TOKEN_SYMBOLS } from '../constants/constants'
import { logError } from './logger'

export function getToken(tokenAddress: Address, chainId: number) {
  const TOKEN = getContract({
    abi: erc20Abi,
    address: tokenAddress,
    client: getPublicClient(chainId),
  })

  return TOKEN
}

export async function checkBundleInventory(bundle: any) {
  // Create a map to store tokenAddress -> totalAmount mapping
  const tokenTotals = new Map<Address, bigint>()

  // Iterate through all deposit events
  for (const depositEvent of bundle.standardDepositEvents) {
    const amount = BigInt(depositEvent.outputAmount)
    const tokenAddress = depositEvent.outputToken as Address

    // Aggregate amounts for each token address
    if (tokenTotals.has(tokenAddress)) {
      tokenTotals.set(tokenAddress, tokenTotals.get(tokenAddress)! + amount)
    } else {
      tokenTotals.set(tokenAddress, amount)
    }
  }

  const amount = BigInt(bundle.executionDepositEvent.outputAmount)
  const tokenAddress = bundle.executionDepositEvent.outputToken as Address

  // Aggregate amounts for each token address
  if (tokenTotals.has(tokenAddress)) {
    tokenTotals.set(tokenAddress, tokenTotals.get(tokenAddress)! + amount)
  } else {
    tokenTotals.set(tokenAddress, amount)
  }

  // Iterate through all token addresses
  for (const [tokenAddress, totalAmount] of tokenTotals) {
    await checkDepositEventInventory(
      bundle.bundleId,
      tokenAddress,
      bundle.executionDepositEvent.destinationChainId,
      totalAmount,
    )
  }
}

export async function getAllBalances(
  chainIds: number[] = getSupportedChainIds(),
  symbols: string[] = TOKEN_SYMBOLS,
) {
  const balances = await Promise.all(
    chainIds.map(async (chainId) => {
      const tokens = getSupportedTokens(chainId).filter((token) =>
        symbols.includes(token.symbol),
      )
      if (tokens.length === 0) {
        return []
      }
      const balances = await Promise.all(
        tokens.map(async (token) => {
          const tokenAddress = token.address as Address
          const tokenDecimals = token.decimals
          const symbol = token.symbol
          const balance = await getBalance(tokenAddress, chainId)
          return { chainId, tokenAddress, balance, tokenDecimals, symbol }
        }),
      )
      return balances
    }),
  )
  return balances.flat()
}

export async function getBalance(
  tokenAddress: Address,
  chainId: number,
  tokenHolder: Address = RELAYER_ADDRESS,
): Promise<bigint> {
  if (tokenAddress === zeroAddress) {
    return getPublicClient(chainId).getBalance({
      address: tokenHolder,
    })
  }
  const TOKEN = getToken(tokenAddress, chainId)

  const relayerBalance = await TOKEN.read.balanceOf([tokenHolder])

  return relayerBalance
}

export async function checkDepositEventInventory(
  bundleId: string,
  tokenAddress: Address,
  chainId: number,
  amount: bigint,
) {
  const relayerBalance = await getBalance(tokenAddress, chainId)

  if (relayerBalance < amount) {
    logError(
      `🟡 Insufficient Relayer Balance for bundle: ${bundleId} \n\n Token Address: ${tokenAddress} \n\n ChainId: ${chainId} \n\n Current Balance: ${relayerBalance} \n\n Required Balance: ${amount}\n\n `,
    )
  }
}
