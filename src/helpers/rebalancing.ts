import { Address, Hex } from "viem"

export type RepaymentDestination = {
    address: Address,
    chain?: number,
}

export function replaceRepaymentDestinations(data: Hex, destination: RepaymentDestination): Hex {

    return data
}