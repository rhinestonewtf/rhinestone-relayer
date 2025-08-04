import { Abi, Address, decodeAbiParameters, decodeFunctionData, encodeAbiParameters, encodeFunctionData, getFunctionSelector, Hex, parseAbiParameters, sliceHex, toFunctionSelector } from "viem"
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

    console.log(routerCall)

    let relayerContextData = routerCall.args![0] as Hex[]
    const adaptersCallData = routerCall.args![1] as Hex[]

    for (let i = 0; i < adaptersCallData.length; i++) {
        let relayerContext = relayerContextData[i]
        const adapterCall = adaptersCallData[i]

        console.log('Context: ', relayerContext, ' adapter: ', adapterCall)
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

export const SameChainRepaymentsRelayerContext = (original: Hex, repayment: RepaymentDestination): Hex => {
    console.log('Same chain repayments')
    return original
}

export const EcoRepaymentsRelayerContext = (original: Hex, repayment: RepaymentDestination): Hex => {
    console.log('Eco repayments')
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

export const RelayRepaymentsRelayerContext = (original: Hex, repayment: RepaymentDestination): Hex => {
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