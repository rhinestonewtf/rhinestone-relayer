import { Address, decodeFunctionData, Hex } from "viem"
import { routerAbi } from "../abi/router"

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

    return data
}