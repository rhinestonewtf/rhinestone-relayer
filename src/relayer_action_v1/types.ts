import { Address, Hex, SignedAuthorization } from "viem"



export type RelayerActionV1 = {
    id: bigint
    timestamp: number
    fill: FillAction,
    claims: ClaimAction[],
}

export type ChainCall = {
    chainId: number,
    data: Hex,
    to: Address,
    value: bigint,
}

export type ChainAction = {
    id: number,
    settlementLayer: string,
    call: ChainCall
    eip7702Delegation?: SignedAuthorization
}

export type FillAction = ChainAction & {}

export type ClaimAction = ChainAction & {
    beforeFill: boolean,
}