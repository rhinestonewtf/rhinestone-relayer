import {
  AbiItem,
  Address,
  Hex,
  decodeFunctionData,
  encodeFunctionData,
} from 'viem'
import spokePoolAbi from '../../artifacts/SpokePool.sol/SpokePool.json'

// Use the full ABI from the artifacts but ensure it's in the correct format for Viem
const fillAbi = spokePoolAbi.abi as AbiItem[]

// Interface for the relay data structure using bytes32
interface RelayData {
  depositor: `0x${string}`
  recipient: `0x${string}`
  exclusiveRelayer: `0x${string}`
  inputToken: `0x${string}`
  outputToken: `0x${string}`
  inputAmount: bigint
  outputAmount: bigint
  originChainId: bigint
  depositId: bigint
  fillDeadline: number
  exclusivityDeadline: number
  message: `0x${string}`
}

// Interface for the relay data structure using address (V3Relay)
interface RelayDataV3 {
  depositor: Address
  recipient: Address
  exclusiveRelayer: Address
  inputToken: Address
  outputToken: Address
  inputAmount: bigint
  outputAmount: bigint
  originChainId: bigint
  depositId: number
  fillDeadline: number
  exclusivityDeadline: number
  message: `0x${string}`
}

// Define the possible function signatures that can be decoded
type DecodedAcrossFillData =
  | { functionName: 'fillRelay'; args: [RelayData, bigint, `0x${string}`] }
  | {
      functionName: 'fillRelayWithUpdatedDeposit'
      args: [
        RelayData,
        bigint,
        `0x${string}`,
        bigint,
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
      ]
    }
  | { functionName: 'fillV3Relay'; args: [RelayDataV3, bigint] }

/**
 * Decodes the calldata for an Across fill transaction
 *
 * This function examines the input data and determines which Across fill function was called
 * (fillRelay, fillRelayWithUpdatedDeposit, or fillV3Relay) and extracts the arguments.
 *
 * @param data - The encoded function call data
 * @returns The decoded function name and arguments
 */
export function decodeAcrossFillData(data: Hex): DecodedAcrossFillData {
  try {
    // Try to decode the function call data using Viem
    const result = decodeFunctionData({
      abi: fillAbi,
      data,
    })

    // Check which function was called and return appropriately typed data
    if (result.functionName === 'fillRelay') {
      return {
        functionName: 'fillRelay',
        args: result.args as [RelayData, bigint, `0x${string}`],
      }
    } else if (result.functionName === 'fillRelayWithUpdatedDeposit') {
      return {
        functionName: 'fillRelayWithUpdatedDeposit',
        args: result.args as [
          RelayData,
          bigint,
          `0x${string}`,
          bigint,
          `0x${string}`,
          `0x${string}`,
          `0x${string}`,
        ],
      }
    } else if (result.functionName === 'fillV3Relay') {
      return {
        functionName: 'fillV3Relay',
        args: result.args as [RelayDataV3, bigint],
      }
    } else {
      throw new Error(`Unsupported function: ${result.functionName}`)
    }
  } catch (error) {
    console.error('Error decoding Across fill data:', error)
    throw new Error('Failed to decode Across fill data')
  }
}

/**
 * Encodes the calldata for an Across fill transaction
 *
 * This function takes the decoded Across fill data and re-encodes it, allowing
 * modifications to parameters like repaymentChainId before encoding.
 *
 * @param decodedData - The decoded function name and arguments
 * @returns The encoded function call data
 */
export function encodeAcrossFillData(decodedData: DecodedAcrossFillData): Hex {
  try {
    return encodeFunctionData({
      abi: fillAbi,
      functionName: decodedData.functionName,
      args: decodedData.args,
    })
  } catch (error) {
    console.error('Error encoding Across fill data:', error)
    throw new Error('Failed to encode Across fill data')
  }
}

/**
 * Updates the repayment chain ID in decoded fill data
 *
 * When changing the repayment chain ID, we need to use the fillRelayWithUpdatedDeposit function
 * rather than fillRelay, as this is the proper way to modify the deposit parameters according
 * to the SpokePool contract.
 *
 * @param decodedData - The original decoded fill data
 * @param newRepaymentChainId - The new repayment chain ID to set
 * @returns The updated decoded fill data with the appropriate function for changing repayment chain
 */
export function updateRepaymentChainId(
  decodedData: DecodedAcrossFillData,
  newRepaymentChainId: bigint,
): DecodedAcrossFillData {
  // For fillV3Relay, we need to handle a different type of relay data
  if (decodedData.functionName === 'fillV3Relay') {
    // Convert RelayDataV3 to RelayData format
    const v3RelayData = decodedData.args[0]
    const relayData: RelayData = {
      depositor: `0x${v3RelayData.depositor.slice(2)}` as `0x${string}`,
      recipient: `0x${v3RelayData.recipient.slice(2)}` as `0x${string}`,
      exclusiveRelayer:
        `0x${v3RelayData.exclusiveRelayer.slice(2)}` as `0x${string}`,
      inputToken: `0x${v3RelayData.inputToken.slice(2)}` as `0x${string}`,
      outputToken: `0x${v3RelayData.outputToken.slice(2)}` as `0x${string}`,
      inputAmount: v3RelayData.inputAmount,
      outputAmount: v3RelayData.outputAmount,
      originChainId: v3RelayData.originChainId,
      depositId: BigInt(v3RelayData.depositId),
      fillDeadline: v3RelayData.fillDeadline,
      exclusivityDeadline: v3RelayData.exclusivityDeadline,
      message: v3RelayData.message,
    }

    // Create a fillRelayWithUpdatedDeposit call
    return {
      functionName: 'fillRelayWithUpdatedDeposit',
      args: [
        relayData,
        newRepaymentChainId,
        `0x${v3RelayData.depositor.slice(2)}` as `0x${string}`, // Use depositor as relayer
        relayData.outputAmount,
        relayData.recipient,
        relayData.message,
        '0x' as `0x${string}`, // Empty signature
      ],
    }
  } else {
    // For fillRelay or fillRelayWithUpdatedDeposit
    const relayData = decodedData.args[0]
    const relayer = decodedData.args[2]

    // Create a fillRelayWithUpdatedDeposit call
    return {
      functionName: 'fillRelayWithUpdatedDeposit',
      args: [
        relayData,
        newRepaymentChainId,
        relayer,
        relayData.outputAmount,
        relayData.recipient,
        relayData.message,
        '0x' as `0x${string}`, // Empty signature
      ],
    }
  }
}
