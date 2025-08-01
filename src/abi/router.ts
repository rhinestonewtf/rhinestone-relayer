export const routerAbi = [
    {
        type: 'constructor',
        inputs: [
            {
                name: 'atomicFillSigner',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'adder',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'remover',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: '$atomicFillSigner',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: '$claimAdapters',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                internalType: 'bytes4',
            },
        ],
        outputs: [
            {
                name: 'claimAdapter',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: '$fillAdapters',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                internalType: 'bytes4',
            },
        ],
        outputs: [
            {
                name: 'fillAdapter',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'DEFAULT_ADMIN_ROLE',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'bytes32',
                internalType: 'bytes32',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'DOMAIN_SEPARATOR',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'bytes32',
                internalType: 'bytes32',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'HELPER',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'contract Helper',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'MULTICALL',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'address',
                internalType: 'contract MultiCall',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'addClaimRoute',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                internalType: 'bytes4',
            },
            {
                name: 'route',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'addFillRoute',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                internalType: 'bytes4',
            },
            {
                name: 'route',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'eip712Domain',
        inputs: [],
        outputs: [
            {
                name: 'fields',
                type: 'bytes1',
                internalType: 'bytes1',
            },
            {
                name: 'name',
                type: 'string',
                internalType: 'string',
            },
            {
                name: 'version',
                type: 'string',
                internalType: 'string',
            },
            {
                name: 'chainId',
                type: 'uint256',
                internalType: 'uint256',
            },
            {
                name: 'verifyingContract',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'salt',
                type: 'bytes32',
                internalType: 'bytes32',
            },
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
        name: 'getFillAdapter',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                internalType: 'bytes4',
            },
        ],
        outputs: [
            {
                name: 'adapter',
                type: 'address',
                internalType: 'address',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getRoleAdmin',
        inputs: [
            {
                name: 'role',
                type: 'bytes32',
                internalType: 'bytes32',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bytes32',
                internalType: 'bytes32',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'grantRole',
        inputs: [
            {
                name: 'role',
                type: 'bytes32',
                internalType: 'bytes32',
            },
            {
                name: 'account',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'hasClaimHash',
        inputs: [
            {
                name: 'proofSender',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'recipient',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'claimHash',
                type: 'bytes32',
                internalType: 'bytes32',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
                internalType: 'bool',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'hasRole',
        inputs: [
            {
                name: 'role',
                type: 'bytes32',
                internalType: 'bytes32',
            },
            {
                name: 'account',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
                internalType: 'bool',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'initialize',
        inputs: [
            {
                name: 'addAdmin',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'rmAdmin',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'initialized',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'bool',
                internalType: 'bool',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'pause',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'renounceRole',
        inputs: [
            {
                name: 'role',
                type: 'bytes32',
                internalType: 'bytes32',
            },
            {
                name: 'callerConfirmation',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'retireClaimRoute',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                internalType: 'bytes4',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'retireFillRoute',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                internalType: 'bytes4',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'revokeRole',
        inputs: [
            {
                name: 'role',
                type: 'bytes32',
                internalType: 'bytes32',
            },
            {
                name: 'account',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'routeClaim',
        inputs: [
            {
                name: 'solverContexts',
                type: 'bytes[]',
                internalType: 'bytes[]',
            },
            {
                name: 'adapterCalldatas',
                type: 'bytes[]',
                internalType: 'bytes[]',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'routeClaim',
        inputs: [
            {
                name: 'solverContext',
                type: 'bytes',
                internalType: 'bytes',
            },
            {
                name: 'adapterCalldata',
                type: 'bytes',
                internalType: 'bytes',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'routeFill',
        inputs: [
            {
                name: 'solverContexts',
                type: 'bytes[]',
                internalType: 'bytes[]',
            },
            {
                name: 'adapterCalldatas',
                type: 'bytes[]',
                internalType: 'bytes[]',
            },
            {
                name: 'atomicFillSignature',
                type: 'bytes',
                internalType: 'bytes',
            },
        ],
        outputs: [],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'setAtomicFillSigner',
        inputs: [
            {
                name: 'signer',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'storeClaimHash',
        inputs: [
            {
                name: 'claimHash',
                type: 'bytes32',
                internalType: 'bytes32',
            },
            {
                name: 'recipient',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'supportsInterface',
        inputs: [
            {
                name: 'interfaceId',
                type: 'bytes4',
                internalType: 'bytes4',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
                internalType: 'bool',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'upgradedTime',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'event',
        name: 'ClaimRouteAdded',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                indexed: false,
                internalType: 'bytes4',
            },
            {
                name: 'router',
                type: 'address',
                indexed: false,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'ClaimRouteRetired',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                indexed: false,
                internalType: 'bytes4',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'FillRouteAdded',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                indexed: false,
                internalType: 'bytes4',
            },
            {
                name: 'router',
                type: 'address',
                indexed: false,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'FillRouteRetired',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                indexed: false,
                internalType: 'bytes4',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'FillSignerSet',
        inputs: [
            {
                name: 'signer',
                type: 'address',
                indexed: false,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'RoleAdminChanged',
        inputs: [
            {
                name: 'role',
                type: 'bytes32',
                indexed: true,
                internalType: 'bytes32',
            },
            {
                name: 'previousAdminRole',
                type: 'bytes32',
                indexed: true,
                internalType: 'bytes32',
            },
            {
                name: 'newAdminRole',
                type: 'bytes32',
                indexed: true,
                internalType: 'bytes32',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'RoleGranted',
        inputs: [
            {
                name: 'role',
                type: 'bytes32',
                indexed: true,
                internalType: 'bytes32',
            },
            {
                name: 'account',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'sender',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'RoleRevoked',
        inputs: [
            {
                name: 'role',
                type: 'bytes32',
                indexed: true,
                internalType: 'bytes32',
            },
            {
                name: 'account',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
            {
                name: 'sender',
                type: 'address',
                indexed: true,
                internalType: 'address',
            },
        ],
        anonymous: false,
    },
    {
        type: 'error',
        name: 'AccessControlBadConfirmation',
        inputs: [],
    },
    {
        type: 'error',
        name: 'AccessControlUnauthorizedAccount',
        inputs: [
            {
                name: 'account',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'neededRole',
                type: 'bytes32',
                internalType: 'bytes32',
            },
        ],
    },
    {
        type: 'error',
        name: 'AccountCreationFailed',
        inputs: [],
    },
    {
        type: 'error',
        name: 'AdapterNotInstalled',
        inputs: [
            {
                name: 'selector',
                type: 'bytes4',
                internalType: 'bytes4',
            },
        ],
    },
    {
        type: 'error',
        name: 'AdapterSelectorNotSupported',
        inputs: [
            {
                name: 'adapter',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'selector',
                type: 'bytes4',
                internalType: 'bytes4',
            },
        ],
    },
    {
        type: 'error',
        name: 'AtomicSignerNotSet',
        inputs: [],
    },
    {
        type: 'error',
        name: 'InvalidAccountAddress',
        inputs: [],
    },
    {
        type: 'error',
        name: 'InvalidAtomicity',
        inputs: [],
    },
    {
        type: 'error',
        name: 'InvalidClaimHash',
        inputs: [],
    },
    {
        type: 'error',
        name: 'InvalidRecipient',
        inputs: [],
    },
    {
        type: 'error',
        name: 'LengthMismatch',
        inputs: [],
    },
    {
        type: 'error',
        name: 'Paused',
        inputs: [],
    },
    {
        type: 'error',
        name: 'RouteAlreadyExists',
        inputs: [],
    },
] as const
