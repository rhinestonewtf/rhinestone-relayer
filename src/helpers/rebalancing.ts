import { Abi, Address, decodeAbiParameters, decodeFunctionData, encodeAbiParameters, encodeFunctionData, encodePacked, Hex, sliceHex, toFunctionSelector } from "viem"
import { adapters, routerAbi } from "../abi/abi"


export type RepaymentDestination = {
    address: Address,
    chain?: number,
}

const supportedRouteCalls = ['routeClaim', 'routeFill']

export function replaceRepaymentDestinations(data: Hex, destination: RepaymentDestination): Hex {

    let routerCall = decodeFunctionData(
        {
            abi: routerAbi,
            data
        }
    )

    if (!supportedRouteCalls.includes(routerCall.functionName)) {
        throw new Error(`Unsupported route function call: ${routerCall.functionName}`)
    }

    let relayerContextData = routerCall.args![0] as Hex[]
    const adaptersCallData = routerCall.args![1] as Hex[]

    for (let i = 0; i < adaptersCallData.length; i++) {
        let relayerContext = relayerContextData[i]
        const adapterCall = adaptersCallData[i]

        const selector = sliceHex(adapterCall, 0, 4)
        const rewriteF = functionSelectorToRelayerContextMap[selector]
        if (!rewriteF) {
            throw new Error(`Unkonwn adapter call at ${i}, selector: ${selector}`)
        }
        relayerContextData[i] = rewriteF(relayerContext, destination)
    }

    return encodeFunctionData({ ...routerCall, abi: routerAbi })
}

type RelayerContextRewrite = (original: Hex, repayment: RepaymentDestination) => Hex

export const NoRelayerContext = (original: Hex, _repayment: RepaymentDestination): Hex => {
    return original
}

const accrossRelayerContext = [
    {
        type: 'tuple[]',
        components: [
            { name: 'repaymentChain', type: 'uint256' },
            { name: 'repaymentAddress', type: 'address' },
        ],
    },
];

export const AccrossRepaymentsRelayerContext = (original: Hex, repayment: RepaymentDestination): Hex => {
    let decoded = decodeAbiParameters(accrossRelayerContext, original)
    let contexts = decoded[0] as { repaymentChain: bigint, repaymentAddress: Address }[]

    for (let v of contexts) {
        let repaymentContext = v as { repaymentChain: bigint, repaymentAddress: Address }
        repaymentContext.repaymentAddress = repayment.address
        if (repayment.chain) {
            repaymentContext.repaymentChain = BigInt(repayment.chain)
        }
    }

    return encodeAbiParameters(accrossRelayerContext, [contexts])
}

// 1. tokenIn recipient
// 2. refund recipient
const sameChainRelayerContext = ['address', 'address']

export const SameChainRepaymentsRelayerContext = (_original: Hex, repayment: RepaymentDestination): Hex => {
    // can be adapted to support different address for token in and refund
    // if optional address is added in repayment context
    // also we can decode original data and reuse parts of it if needed
    return encodePacked(sameChainRelayerContext, [repayment.address, repayment.address])
}

// a single claimant address
const ecoRelayerContext = ['address']
export const EcoRepaymentsRelayerContext = (_original: Hex, repayment: RepaymentDestination): Hex => {
    return encodePacked(ecoRelayerContext, [repayment.address])
}

export const RelayRepaymentsRelayerContext = (original: Hex, repayment: RepaymentDestination): Hex => {
    // relay settlement uses only relay relayer (pun intended) themselves - nothing to override
    return original
}

const adapterRelayerContextMap = {
    'singleCallAbi': NoRelayerContext,
    'multiCallAbi': NoRelayerContext,
    'sameChainAbi': SameChainRepaymentsRelayerContext,
    'ecoAbi': EcoRepaymentsRelayerContext,
    'across7579Abi': AccrossRepaymentsRelayerContext,
    'acrossMultiCallAbi': AccrossRepaymentsRelayerContext,
    'relayAbi': RelayRepaymentsRelayerContext,
}

const functionSelectorToRelayerContextMap = buildSelectorToContextMap(adapters)

function buildSelectorToContextMap(adapters: { [key: string]: Abi }): { [key: Hex]: RelayerContextRewrite } {
    let map: { [key: Hex]: RelayerContextRewrite } = {}

    for (const [key, value] of Object.entries(adapters)) {
        const rewrite = adapterRelayerContextMap[key] as RelayerContextRewrite
        if (!rewrite) {
            throw new Error(`unknown adapter ${key} for rewrite`)
        }
        const abi = value as Abi

        for (const item of abi.filter((v) => v.type == 'function')) {
            const functionSelector = toFunctionSelector(item)
            map[functionSelector] = rewrite
        }

    }

    return map
}