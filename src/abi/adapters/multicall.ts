const multicallAbi = [
  {
    type: 'function',
    name: 'multiCall',
    inputs: [
      {
        name: 'executions',
        type: 'tuple[]',
        internalType: 'struct Execution[]',
        components: [
          {
            name: 'target',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'value',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
] as const

