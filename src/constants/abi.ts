export const wethAbi = [
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    inputs: [],
    outputs: [{ name: 'result', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'spender', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: 'result', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
    outputs: [{ name: 'result', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nonces',
    inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
    outputs: [{ name: 'result', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'permit',
    inputs: [
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'spender', type: 'address', internalType: 'address' },
      { name: 'value', type: 'uint256', internalType: 'uint256' },
      { name: 'deadline', type: 'uint256', internalType: 'uint256' },
      { name: 'v', type: 'uint8', internalType: 'uint8' },
      { name: 'r', type: 'bytes32', internalType: 'bytes32' },
      { name: 's', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: 'result', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      { name: 'from', type: 'address', internalType: 'address' },
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'spender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'AllowanceOverflow', inputs: [] },
  { type: 'error', name: 'AllowanceUnderflow', inputs: [] },
  { type: 'error', name: 'ETHTransferFailed', inputs: [] },
  { type: 'error', name: 'InsufficientAllowance', inputs: [] },
  { type: 'error', name: 'InsufficientBalance', inputs: [] },
  { type: 'error', name: 'InvalidPermit', inputs: [] },
  {
    type: 'error',
    name: 'Permit2AllowanceIsFixedAtInfinity',
    inputs: [],
  },
  { type: 'error', name: 'PermitExpired', inputs: [] },
  { type: 'error', name: 'TotalSupplyOverflow', inputs: [] },
] as const

export const rhinestoneRelayerAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    name: 'fillBundle',
    inputs: [
      {
        name: 'executionDeposit',
        type: 'tuple',
        internalType: 'struct AcrossDeposit',
        components: [
          {
            name: 'inputToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'inputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'originChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'depositId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'depositor',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'recipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
      {
        name: 'standardDeposits',
        type: 'tuple[]',
        internalType: 'struct AcrossDeposit[]',
        components: [
          {
            name: 'inputToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'outputToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'inputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'outputAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'destinationChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'originChainId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'depositId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'quoteTimestamp',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'fillDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'exclusivityDeadline',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'depositor',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'recipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'exclusiveRelayer',
            type: 'address',
            internalType: 'address',
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
        ],
      },
      {
        name: 'repaymentChainId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'multiCall',
    inputs: [
      {
        name: 'executions',
        type: 'tuple[]',
        internalType: 'struct Execution[]',
        components: [
          { name: 'to', type: 'address', internalType: 'address' },
          { name: 'value', type: 'uint256', internalType: 'uint256' },
          { name: 'data', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setSpokepool',
    inputs: [{ name: '_spokepool', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'spokepool',
    inputs: [],
    outputs: [
      { name: '', type: 'address', internalType: 'contract ISpokePool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawFunds',
    inputs: [
      { name: 'recipient', type: 'address', internalType: 'address' },
      { name: 'token', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [{ name: 'token', type: 'address', internalType: 'address' }],
  },
] as const

export const rhinestoneSpokepoolAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'orchestrator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'addressBook',
        type: 'address',
        internalType: 'contract IAddressBook',
      },
      {
        name: 'spokePoolId',
        type: 'bytes32',
        internalType: 'IAddressBook.ID',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: '$processedFills',
    inputs: [
      {
        name: 'IntentFillPayloadHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [{ name: 'processed', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [{ name: 'datas', type: 'bytes[]', internalType: 'bytes[]' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [{ name: 'callData', type: 'bytes', internalType: 'bytes' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'eip712Domain',
    inputs: [],
    outputs: [
      { name: 'fields', type: 'bytes1', internalType: 'bytes1' },
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'version', type: 'string', internalType: 'string' },
      { name: 'chainId', type: 'uint256', internalType: 'uint256' },
      {
        name: 'verifyingContract',
        type: 'address',
        internalType: 'address',
      },
      { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
      {
        name: 'extensions',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'fill',
    inputs: [
      {
        name: 'fillPayloads',
        type: 'tuple',
        internalType: 'struct IRhinestoneSpokePool.IntentFillPayload',
        components: [
          {
            name: 'segments',
            type: 'tuple[]',
            internalType: 'struct IRhinestoneSpokePool.SegmentData[]',
            components: [
              {
                name: 'tokenIn',
                type: 'uint256[2][]',
                internalType: 'uint256[2][]',
              },
              {
                name: 'tokenOut',
                type: 'uint256[2][]',
                internalType: 'uint256[2][]',
              },
              {
                name: 'originWETHAddress',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'originChainId',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'baseDepositId',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
          {
            name: 'orchestratorSig',
            type: 'bytes',
            internalType: 'bytes',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'fill',
    inputs: [
      {
        name: 'payload',
        type: 'tuple',
        internalType: 'struct IRhinestoneSpokePool.IntentFillPayload',
        components: [
          {
            name: 'segments',
            type: 'tuple[]',
            internalType: 'struct IRhinestoneSpokePool.SegmentData[]',
            components: [
              {
                name: 'tokenIn',
                type: 'uint256[2][]',
                internalType: 'uint256[2][]',
              },
              {
                name: 'tokenOut',
                type: 'uint256[2][]',
                internalType: 'uint256[2][]',
              },
              {
                name: 'originWETHAddress',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'originChainId',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'baseDepositId',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          { name: 'message', type: 'bytes', internalType: 'bytes' },
          {
            name: 'orchestratorSig',
            type: 'bytes',
            internalType: 'bytes',
          },
        ],
      },
      {
        name: 'exclusiveRelayer',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'repaymentAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isAcrossDepositCall',
    inputs: [{ name: 'selector', type: 'bytes4', internalType: 'bytes4' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'event',
    name: 'Filled',
    inputs: [
      {
        name: 'nonce',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SpokePoolInitialized',
    inputs: [
      {
        name: 'spokePool',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'weth',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AtmoicFill_SameChainParamterForSolverShouldBeEmpty',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AtomicFill_FilldeadlineExpired',
    inputs: [{ name: 'fillDeadline', type: 'uint32', internalType: 'uint32' }],
  },
  {
    type: 'error',
    name: 'AtomicFill_InvalidOrchestratorSignature',
    inputs: [],
  },
  { type: 'error', name: 'AtomicFill_InvalidTokenLength', inputs: [] },
  { type: 'error', name: 'AtomicFill_NoSegments', inputs: [] },
  { type: 'error', name: 'AtomicFill_SegmentMismatch', inputs: [] },
  {
    type: 'error',
    name: 'DepositRouter_InvalidMessageType',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DepositRouter_InvalidNotarizedChain',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DepositRouter_InvalidOrchestratorSignature',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DepositRouter_InvalidSolverInCalldata',
    inputs: [],
  },
  { type: 'error', name: 'DepositRouter_InvalidTarget', inputs: [] },
  {
    type: 'error',
    name: 'ExpectedTokenBalanceInvalid',
    inputs: [
      { name: 'token', type: 'address', internalType: 'address' },
      { name: 'expected', type: 'uint256', internalType: 'uint256' },
      { name: 'actual', type: 'uint256', internalType: 'uint256' },
    ],
  },
  { type: 'error', name: 'InvalidAcrossMessageType', inputs: [] },
] as const
