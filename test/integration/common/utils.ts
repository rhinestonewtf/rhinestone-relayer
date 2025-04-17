import {
  Address,
  createPublicClient,
  createTestClient,
  http,
  parseAbi,
  parseEther,
} from 'viem'
import { foundry } from 'viem/chains'
import { RHINESTONE_SPOKEPOOL_ADDRESS } from '../../../src/constants'

export const setupChain = async ({
  rpcUrl,
  solverAddress,
}: {
  rpcUrl: string
  solverAddress: Address
}) => {
  const testClient = createTestClient({
    chain: foundry,
    mode: 'anvil',
    transport: http(rpcUrl),
  })

  await testClient.setCode({
    address: RHINESTONE_SPOKEPOOL_ADDRESS,
    bytecode:
      '0x608060405234801561000f575f5ffd5b506004361061003f575f3560e01c80633fb5c1cb14610043578063b154be8514610064578063d09de08a14610095575b5f5ffd5b6100626100513660046100b9565b335f90815260208190526040902055565b005b6100836100723660046100d0565b5f6020819052908152604090205481565b60405190815260200160405180910390f35b610062335f9081526020819052604081208054916100b2836100fd565b9190505550565b5f602082840312156100c9575f5ffd5b5035919050565b5f602082840312156100e0575f5ffd5b81356001600160a01b03811681146100f6575f5ffd5b9392505050565b5f6001820161011a57634e487b7160e01b5f52601160045260245ffd5b506001019056fea264697066735822122037e70cd5ede78d5172136046e5d28d898aafd03c8ccee26bdb7fa993836ba39f64736f6c634300081c0033',
  })

  await testClient.setBalance({
    address: solverAddress,
    value: parseEther('10'),
  })
}

export const getCount = async ({
  rpcUrl,
  address,
}: {
  rpcUrl: string
  address: Address
}) => {
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(rpcUrl),
  })

  const count = await publicClient.readContract({
    address: RHINESTONE_SPOKEPOOL_ADDRESS,
    abi: parseAbi(['function number(address) external returns(uint256)']),
    functionName: 'number',
    args: [address],
  })

  return count
}

export const mockGetRPRUrl = (
  threadId: number,
): ((chainId: number) => string) => {
  return (chainId: number) => {
    switch (chainId) {
      case 1:
        return `http://localhost:8545/${threadId}`
      case 2:
        return `http://localhost:8546/${threadId}`
      case 3:
        return `http://localhost:8547/${threadId}`
      default:
        return ''
    }
  }
}

let threadId = 0
export const getThreadId = (base?: number) => {
  threadId += 1
  return threadId + (base || 0)
}
