import { Abi, Address, decodeAbiParameters, decodeFunctionData, encodeAbiParameters, encodeFunctionData, encodePacked, Hex, sliceHex, toFunctionSelector } from "viem"
import { adapters, routerAbi } from "../abi/abi"


export type RepaymentDestination = {
    address: Address,
    chain?: number,
}

const supportedRouteCalls = ['routeClaim', 'routeFill', 'optimized_routeFill921336808']

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

    let contextIndex = 0
    let relayerContextData = routerCall.args![0] as Hex[]
    const isOptimizedRouteCall = routerCall.functionName.includes('optimized')
    const adaptersCallData = !isOptimizedRouteCall
      ? routerCall.args![1] as Hex[]
      : decodeAbiParameters(
          [{ type: 'bytes[]', name: 'adapterContexts' }],
          routerCall.args![1] as Hex
        )[0]

    for (let i = 0; i < adaptersCallData.length; i++) {
        const adapterCall = adaptersCallData[i]
        const selector = sliceHex(adapterCall, 0, 4)
        console.dir({adapterCall, selector})
        const rewriteF = functionSelectorToRelayerContextMap[selector]
        if (!rewriteF) {
            throw new Error(`Unkonwn adapter call at ${i}, selector: ${selector}`)
        }

        if (
          (isOptimizedRouteCall && rewriteF !== NoRelayerContext)
          || !isOptimizedRouteCall
        ) {
          if (contextIndex >= relayerContextData.length) {
              throw new Error(`Mismatch: Adapter call at index ${i} requires a relayer context, but none are available`)
          }

          const currentContext = relayerContextData[contextIndex]
          relayerContextData[contextIndex] = rewriteF(currentContext, destination)
          contextIndex++
        }
    }

    if (contextIndex !== relayerContextData.length) {
        throw new Error('Data mismatch: More contexts were provided than were consumed by the adapter calls')
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

const adapterRelayerContextMap: { [K in keyof typeof adapters]: RelayerContextRewrite } = {
    singleCallAbi: NoRelayerContext,
    multiCallAbi: NoRelayerContext,
    directRoutesAbi: NoRelayerContext,
    sameChainAbi: SameChainRepaymentsRelayerContext,
    ecoAbi: EcoRepaymentsRelayerContext,
    across7579Abi: AccrossRepaymentsRelayerContext,
    acrossMultiCallAbi: AccrossRepaymentsRelayerContext,
    relayAbi: RelayRepaymentsRelayerContext,
}

const functionSelectorToRelayerContextMap = buildSelectorToContextMap()

function buildSelectorToContextMap(): { [key: Hex]: RelayerContextRewrite } {
    let map: { [key: Hex]: RelayerContextRewrite } = {}

    for (const key of Object.keys(adapters) as (keyof typeof adapters)[]) {
        const rewrite = adapterRelayerContextMap[key]
        const abi = adapters[key]

        for (const item of abi.filter((v) => v.type == 'function')) {
            console.dir({item},{depth:null})
            const functionSelector = toFunctionSelector(item)
            map[functionSelector] = rewrite
        }

    }

    return map
}
