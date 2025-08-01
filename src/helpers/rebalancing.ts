import { Abi, Address, decodeFunctionData, Hex } from "viem"
import { across7579Abi, acrossMultiCallAbi, adapters, ecoAbi, multiCallAbi, routerAbi, singleCallAbi } from "../abi/abi"


export type RepaymentDestination = {
    address: Address,
    chain?: number,
}

const supportedRouteCalls = ['routeClaim', 'routeFill']

export function replaceRepaymentDestinations(data: Hex, destination: RepaymentDestination): Hex {

    const routerCall = decodeFunctionData(
        {
            abi: routerAbi,
            data
        }
    )

    if (!supportedRouteCalls.includes(routerCall.functionName)) {
        throw new Error(`Unsupported route function call: ${routerCall.functionName}`)
    }

    console.log(routerCall)

    const relayerContextData = routerCall.args![0] as Hex[]
    const adaptersCallData = routerCall.args![1] as Hex[]

    for (let i = 0; i < adaptersCallData.length; i++) {
        const relayerContext = relayerContextData[i]
        const adapterCall = adaptersCallData[i]

        console.log('Context: ', relayerContext, ' adapter: ', adapterCall)
    }

    return data
}

type ContextRewrite = (original: Hex, repayment: RepaymentDestination) => Hex

const NoRewrite = (original: Hex, _repayment: RepaymentDestination): Hex => {
    return original
}

const adapterRelayerContextMap = {
    'singleCallAbi': NoRewrite,
    'multiCallAbi': NoRewrite,
    'ecoAbi': NoRewrite,
    'across7579Abi': NoRewrite,
    'acrossMultiCallAbi': NoRewrite,
}


function buildSelectorToContextMap(adapters: { [key: string]: Abi }): { [key: Hex]: ContextRewrite } {

    for (const [key, value] of Object.entries(adapters)) {
        const rewrite = adapterRelayerContextMap[key] as ContextRewrite

    }

    return {}
}