// import { Address, erc20Abi, getContract } from 'viem'
// import { getPublicClient, getWalletClient } from './getClients'
// import { logError } from './logger'
// import { getRelayerWallet } from './getRelayer'
//
// export function getToken(tokenAddress: Address, chainId: number) {
//   const TOKEN = getContract({
//     abi: erc20Abi,
//     address: tokenAddress,
//     client: getPublicClient(chainId),
//   })
//
//   return TOKEN
// }
//
// export async function checkBundleInventory(bundle: any) {
//   // Create a map to store tokenAddress -> totalAmount mapping
//   const tokenTotals = new Map<Address, bigint>()
//
//   // Iterate through all deposit events
//   for (const depositEvent of bundle.standardDepositEvents) {
//     const amount = BigInt(depositEvent.outputAmount)
//     const tokenAddress = depositEvent.outputToken as Address
//
//     // Aggregate amounts for each token address
//     if (tokenTotals.has(tokenAddress)) {
//       tokenTotals.set(tokenAddress, tokenTotals.get(tokenAddress)! + amount)
//     } else {
//       tokenTotals.set(tokenAddress, amount)
//     }
//   }
//
//   const amount = BigInt(bundle.executionDepositEvent.outputAmount)
//   const tokenAddress = bundle.executionDepositEvent.outputToken as Address
//
//   // Aggregate amounts for each token address
//   if (tokenTotals.has(tokenAddress)) {
//     tokenTotals.set(tokenAddress, tokenTotals.get(tokenAddress)! + amount)
//   } else {
//     tokenTotals.set(tokenAddress, amount)
//   }
//
//   // Iterate through all token addresses
//   for (const [tokenAddress, totalAmount] of tokenTotals) {
//     await checkDepositEventInventory(
//       bundle.bundleId,
//       tokenAddress,
//       bundle.executionDepositEvent.destinationChainId,
//       totalAmount,
//     )
//   }
// }
//
// export async function checkDepositEventInventory(
//   bundleId: string,
//   tokenAddress: Address,
//   chainId: number,
//   amount: bigint,
// ) {
//   const TOKEN = getToken(tokenAddress, chainId)
//
//   const relayerBalance = await TOKEN.read.balanceOf([getRelayerWallet(chainId).account.address])
//
//   if (relayerBalance < amount) {
//     logError(
//       `🟡 Insufficient Relayer Balance for bundle: ${bundleId} \n\n Token Address: ${tokenAddress} \n\n ChainId: ${chainId} \n\n Current Balance: ${relayerBalance} \n\n Required Balance: ${amount}\n\n `,
//     )
//   }
// }
